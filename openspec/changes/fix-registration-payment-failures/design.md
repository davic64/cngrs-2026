## Context

Ver proposal.md (Why). Estado actual relevante:

- `db` usa `drizzle-orm/neon-http`: no hay transacciones interactivas, pero `db.batch([...])` ejecuta varias sentencias en una sola transacción.
- `registerUser()` (`src/app/actions/auth.ts`) inserta usuario → contacto → salud → pago por separado y hace un `delete` manual si algo falla. Todo lo inesperado cae en `"Error interno al procesar el registro"`.
- Flujo tarjeta: `uploadRegistrationFiles()` genera un `sessionId` (`reg_...`) que ya viaja en `metadata.sessionId` de Stripe. Tras el pago, el cliente lee `localStorage` y llama `registerUser()` + `recordNewRegistrationPayment()`. El webhook sólo confirma archivos temporales.
- Bug menor detectado: `completeStripeRegistration()` envía `tipoPago = "tarjeta"` en vez del tipo real (`completo`/`inscripcion`).
- Telegram ya se usa (`settings.telegramToken`, `settings.telegramChatId`) inline en `password-reset.ts`.
- No hay acceso a logs de producción: la causa exacta del error de transferencia es desconocida. Candidatas plausibles según el código: campo requerido nulo tras restaurar sesión (contacto de emergencia, género → violación NOT NULL/enum), fallo de subida a R2, o el `delete` de rollback fallando.

## Goals / Non-Goals

**Goals:**
- Un único camino de creación de usuario (atómico) usado por transferencia/efectivo y por tarjeta.
- Que un cobro confirmado por Stripe siempre termine en un usuario, o en un registro fallido visible para el admin.
- Hacer diagnosticable el próximo fallo sin acceso a logs (Telegram).

**Non-Goals:**
- Pagos desde el dashboard de usuarios existentes (webhook rama `userId` real).
- Deduplicar pagos por `stripe session id` en la tabla `payments` (la unicidad del teléfono ya hace idempotente el registro).
- Reescribir el flujo de persistencia `localStorage` de transferencia/efectivo.

## Decisions

### 1. Helper `createRegistration(input)` con `db.batch`
Función de servidor (no exportada como action) que recibe datos ya validados + URLs de archivos + pago opcional, genera `userId = crypto.randomUUID()` y ejecuta en un `db.batch` los inserts de `users`, `emergency_contacts`, `health_info` y `payments` (con `registrationStatus` ya calculado). Reemplaza los inserts sueltos y el rollback manual.
- *Alternativa*: cambiar a `drizzle-orm/neon-serverless` (WebSocket) para `db.transaction`. Descartada: cambia el driver global por un solo caso; `batch` basta.

### 2. Validación con una función simple, sin librería
`validateRegistration(fields)` devuelve `{ ok: true, data }` o `{ ok: false, error: "<campo> es requerido" }`. Se usa en `registerUser()` y en el guardado del registro pendiente. Corre antes de subir el comprobante.
- *Alternativa*: añadir `zod`. Descartada: no está instalado y son ~15 checks triviales.

### 3. Errores por etapa + reporte
`registerUser()` rastrea la etapa (`validacion`, `subida_comprobante`, `guardado`) y en el catch: `console.error` con etapa + `error.code` + `error.message`, notifica por Telegram (fire-and-forget, nunca bloquea la respuesta) y devuelve un mensaje por etapa. `23505` sigue mapeado a "teléfono ya registrado". Se extrae `notifyAdmin(text)` a `src/lib/telegram.ts` y `password-reset.ts` lo reutiliza.

### 4. Tabla `pending_registrations`
```
id              text PK        -- el sessionId reg_... ya existente
data            jsonb          -- campos validados del formulario + URLs de archivos
password_hash   text           -- nunca la contraseña en claro
payment_type    text           -- completo | inscripcion
status          text           -- pending | completed | failed
user_id         uuid null
error           text null
created_at      timestamp
```
Nueva action `savePendingRegistration(formData)`: valida, verifica teléfono libre y cupos, hace upsert por `id`. `createCheckoutSession()` se llama después, con el mismo `id` en `metadata.sessionId` (ya existe). Los checks de cupo se quitan de `createCheckoutSession()` (ya se hicieron) o se dejan; no afecta el spec.
- *Alternativa*: meter todo el formulario en `metadata` de Stripe. Descartada: límite de 500 caracteres por valor y contraseña expuesta en Stripe.

### 5. `finalizeCardRegistration(checkoutSessionId)` idempotente
Usada por el webhook y por el regreso del navegador:
1. `stripe.checkout.sessions.retrieve()` → exige `payment_status === "paid"`; lee `metadata.sessionId` y `baseAmount`.
2. Carga `pending_registrations`. Si `status = completed` → devuelve `user_id`.
3. Si no: `createRegistration()` con pago `tarjeta/completado` por `baseAmount`, y en el mismo batch `update pending_registrations set status='completed', user_id=...`.
4. Si falla con `23505` (carrera webhook vs. navegador): recarga el pendiente; si ya está `completed` devuelve ese `user_id`. Si no, se trata como fallo.
5. Otro fallo: `status='failed'`, `error=...`, Telegram al admin con nombre, teléfono, monto y `checkoutSessionId`; devuelve error.

La action del navegador además setea la cookie `user_session`. El webhook responde `500` cuando la finalización falla (Stripe reintenta hasta ~3 días); `200` en éxito o si ya estaba completado.

No se revalidan cupos en la finalización: si ya pagó, se registra.

### 6. Cliente (`register/page.tsx`)
- Tarjeta: en `handleFinalAction`, tras asegurar archivos subidos, llamar `savePendingRegistration()`; si falla, `alert(error)` y no ir a Stripe.
- `completeStripeRegistration(sessionId)`: sólo llama `finalizeCardRegistration(sessionId)`; en éxito limpia `localStorage` y va a `/dashboard`. Ya no necesita `loadRegText()`.
- Transferencia: sin cambios de flujo; mostrará el mensaje específico que devuelva el servidor.

## Risks / Trade-offs

- [Carrera webhook/navegador] → cubierto por unicidad de teléfono + relectura del pendiente (Decisión 5.4).
- [Teléfono tomado entre guardar pendiente y pagar] → finalización falla, queda `failed` y el admin es notificado para reembolso o alta manual. Ventana de minutos, muy improbable.
- [Registros pendientes que nunca pagan se acumulan] → filas pequeñas; limpieza opcional en el cron existente (`status='pending'` y > 24 h).
- [Webhook no configurado para el entorno] → el regreso del navegador sigue finalizando; el webhook es la red de seguridad.
- [La causa real del error de transferencia sigue sin confirmarse] → la validación cubre las causas por datos; el log/Telegram por etapa revelará cualquier otra en el próximo intento.

## Migration Plan

1. `npx drizzle-kit generate` + `migrate` para `pending_registrations` (tabla nueva, sin cambios a tablas existentes).
2. Desplegar. Registros con tarjeta iniciados antes del deploy (sin fila pendiente) regresan por el camino viejo: si `finalizeCardRegistration` no encuentra pendiente, notifica al admin con los datos de Stripe.
3. Rollback: revertir el deploy; la tabla nueva puede quedarse sin efecto.
4. El cobro huérfano ya ocurrido se resuelve a mano (buscar en Stripe, alta por admin o reembolso).

## Open Questions

- ¿Conviene que el admin vea los `pending_registrations` con `status = failed` en el panel? Por ahora basta Telegram + Drizzle Studio.
