# Design

## Context

Estado observado:

- `src/app/actions/admin.ts` (725 líneas) no llama `getSessionUser()` en ninguna acción; la única barrera es el layout de `/admin` (`src/app/admin/layout.tsx`). `updateUserDetails(userId, data: any)` hace `db.update(users).set(data)` con cualquier campo, incluido `role`.
- Varias lecturas de `admin.ts` las usan páginas no admin: `getSettings`/`getLocalities`/`getCartaResponsivaTemplate` (registro y `/dashboard`), `getVenue`/`getAgendaDays` (panel del asistente), `getSupportInfo`.
- El estatus de registro se calcula en cuatro lugares con la misma regla (suma de pagos `completado` ≥ `settings.fullPaymentPrice`, default 1500): `validatePayment`, el webhook de Stripe, `createRegistration` y `createAdmin`.
- Los cupos (`500` generales ≤29, `50` acompañantes >29) están escritos como literales en `checkCapacity` (`src/lib/registration.ts`) y los conteos viven en `src/app/actions/ocr.ts` (usuarios `completado` por edad).
- `AdminUsersClient` (947 líneas) guarda una copia del usuario en `selectedUser` (estado), por lo que no se refresca tras `router.refresh()`.
- Driver `neon-http`: `db.batch([...])` corre como transacción (ya usado en `createRegistration`).
- Hay una migración pendiente de aplicar de `fix-registration-payment-failures` (`drizzle/0002_*`, tabla `pending_registrations`).

Ver proposal.md para la motivación. Supuestos tomados porque no se aclararon: conjunto de campos editables, bitácora en BD sin visor, estatus siempre derivado de pagos, días del dashboard en `America/Mexico_City`, paneles de configuración se quedan en el dashboard.

## Goals / Non-Goals

**Goals:**
- Ninguna acción administrativa ejecutable sin sesión admin; lecturas públicas intactas y sin secretos.
- Ediciones atómicas (dato + recálculo de estatus + bitácora) y con las validaciones del registro.
- Un solo cálculo de estatus y un solo lugar para los límites de cupo.
- Dashboard sin dependencias nuevas.

**Non-Goals:**
- Firmar/rotar la cookie de sesión, endurecer acciones de asistentes, visor de bitácora, subir/reemplazar fotos, tocar el webhook de Stripe.

## Decisions

1. **`requireAdmin()` explícito al inicio de cada acción** (`src/lib/admin-auth.ts`): lee `getSessionUser()`, lanza `Error("No autorizado")` si no hay sesión o `role !== "admin"`, y devuelve el admin (su `id` alimenta la bitácora). Alternativa: envolver acciones con un HOF `adminAction(fn)` → los archivos `"use server"` sólo exportan funciones async declaradas y el wrapper oculta la firma; una línea explícita es más legible. Alternativa: middleware de ruta → las Server Actions no pasan por rutas protegidas, no sirve.
2. **Clasificación de `admin.ts`**: públicas (sin guardia): `getLocalities`, `getSettings` (proyección sin `telegramToken`/`telegramChatId`), `getVenue`, `getAgendaDays`, `getEvents`, `getCartaResponsivaTemplate`, `getSupportInfo`. Todas las demás (usuarios, admins, estadísticas, pagos, mutaciones de localidades/settings/sede/agenda/avisos/carta/soporte) llevan guardia. `/admin/soporte` sigue leyendo la fila completa en su server component (protegido por el layout), así que no se agrega `getAdminSettings()`. En `support.ts` se guardan las acciones del admin y `sendSupportMessage` con `sender = "admin"`. Alternativa: dividir en archivos público/admin → mueve imports de todas las páginas; sólo se hará con los archivos nuevos (`admin-attendees.ts`, `admin-payments.ts`, `admin-stats.ts`).
3. **Estatus por SQL en el mismo batch**: tras escribir el pago, un `UPDATE users SET registration_status = CASE WHEN (SELECT COALESCE(SUM(amount),0) FROM payments WHERE user_id = $1 AND payment_status = 'completado') >= $required THEN 'completado' WHEN … > 0 THEN 'parcial' ELSE 'pendiente' END::registration_status` va como sentencia posterior dentro de `db.batch`; al ejecutarse en orden ve el pago ya modificado y evita carreras con el webhook. Se expone como `recomputeStatusStatement(userId, required)` en `src/lib/registration-status.ts` y se usa también en `validatePayment`. Alternativa: leer pagos en la app, calcular y escribir → ventana de carrera y dos viajes. El webhook y `createRegistration` conservan su cálculo (el primero por estar `fix-registration-payment-failures` en curso).
4. **Bitácora**: tabla `admin_audit_log` (`id`, `admin_id` uuid, `user_id` uuid del asistente afectado, `entity` text `user|payment`, `entity_id` text, `action` text `update|create|delete`, `changes` jsonb `{campo: {from, to}}` o snapshot en altas/bajas, `created_at`). Sin FK a `users` para que sobreviva a borrados. La entrada se inserta en el mismo `db.batch` que el cambio.
5. **`updateAttendee(userId, input)`** (`src/app/actions/admin-attendees.ts`): `requireAdmin` → `validateAttendeeEdit` (función pura en `src/lib/attendee-edit.ts`, reglas del registro) → leer actual (users + emergency + health) → `diffChanges` (si vacío: `{success:true, changed:false}` sin escribir) → si cambia `phone`, `isPhoneTaken` excluyendo al propio y capturar `23505` con `pgCode` → si cambia la bolsa de edad y el usuario está `completado`, `checkCapacity(newAge)` → `db.batch([update users, upsert emergency_contacts, upsert health_info, insert audit])`. Se **elimina** `updateUserDetails`.
6. **Pagos** (`src/app/actions/admin-payments.ts`): `createPayment`, `updatePayment`, `deletePayment`; validan monto entero > 0, enums y motivo si `rechazado` (se limpia si ya no lo es); cada una arma `db.batch([cambio, recomputeStatusStatement, auditoría])`. `deletePayment` borra el comprobante de R2 después del batch (mejor esfuerzo, se registra el error si falla, no se revierte la BD).
7. **Límites de cupo en `src/lib/capacity.ts`** (`REGULAR_LIMIT = 500`, `ADULT_COMPANION_LIMIT = 50`), usados por `checkCapacity` y el dashboard, para que ambos coincidan.
8. **Estadísticas** (`getAdminStats` ampliado, `admin-stats.ts`): consultas agregadas pequeñas en `Promise.all` (conteos por estatus, cupos reutilizando `ocr.ts`, ingresos por estatus y método, saldo por cobrar = `SUM(GREATEST(full − pagado_validado, 0))` de asistentes no completados, registros por día agrupados con `AT TIME ZONE 'America/Mexico_City'` y rellenados con ceros en JS, top 5 localidades). Cabe en ~6 consultas para el tamaño esperado (≤ ~600 asistentes). Devuelve un tipo explícito `AdminStats` (hoy `any`).
9. **UI del dashboard** sin librerías: barras de progreso y de serie con `div`/SVG y clases Tailwind. `AdminDashboardClient` se parte en componentes bajo `src/components/admin/dashboard/` (`StatCards`, `CapacityCard`, `FinanceCard`, `RegistrationsChart`, `TopLocalities`, `PendingPaymentsCard`, `RejectedPaymentsCard`, `CostsPanel`, `TermsPanel`, `CartaPanel`); los paneles de configuración se mueven tal cual.
10. **UI de edición**: `EditAttendeeModal` y `PaymentEditorModal` (con `Modal`/`Input`/`Select` existentes); país/estado/localidad como `<input list>` con `<datalist>` (suggestiones de `ESTADOS_POR_PAIS` y de las localidades en BD, texto libre permitido). `AdminUsersClient` guarda `selectedId` y deriva el usuario de `initialUsers` para refrescarse tras `router.refresh()`; la sección de pagos del drawer se extrae a `AttendeePaymentsSection` y pierde los controles de estatus manual. `/admin/users` acepta `?status=` y muestra un filtro por estatus. Los pagos con método `tarjeta` muestran la advertencia de que editarlos no modifica Stripe.

## Risks / Trade-offs

- [La guardia rompe una página no admin que usaba una lectura clasificada mal] → Tabla de la Decisión 2 y verificación manual de registro (visitante), `/dashboard` y `/dashboard/agenda`/`venue` con sesión de asistente.
- [La sesión es el UUID en claro: quien conozca el UUID de un admin pasa la guardia] → Riesgo previo, no empeora; el UUID no se expone fuera del panel admin. Seguimiento recomendado: firmar la cookie.
- [Editar un pago de tarjeta lo desalinea de Stripe] → Se permite con advertencia visible y queda en bitácora.
- [Mover un completado entre bolsas de edad puede sobrepasar el cupo] → Validación con `checkCapacity` sólo cuando cambia la bolsa y el usuario está `completado`; hay una ventana de carrera entre la verificación y el batch, aceptada por el volumen (un solo admin editando).
- [Quitar el estatus manual cambia el flujo del admin] → El reemplazo es agregar/editar un pago (p. ej. efectivo completado); anotado como **BREAKING** en el proposal.
- [`validatePayment` pasa al nuevo cálculo] → Misma regla; se verifica aprobar y rechazar un pago antes y después.
- [Gráficas por día dependen de la zona horaria] → Fija `America/Mexico_City`; si hay asistentes de otras zonas el corte por día puede desfasarse unas horas.

## Migration Plan

1. `npx drizzle-kit generate` crea `0003` (`admin_audit_log`). `npx drizzle-kit migrate` aplica también la `0002` pendiente de `fix-registration-payment-failures` si aún no se ha aplicado. Ambas son sólo creación de tablas.
2. Desplegar el código; no hay datos que migrar.
3. Rollback: revertir el despliegue; la tabla `admin_audit_log` puede quedarse sin uso.

## Open Questions

- ¿Quieres un visor de la bitácora en el expediente? (se puede añadir después sin cambiar el esquema)
- ¿Debe poder reemplazarse la foto de perfil desde el expediente? (hoy sólo la carta responsiva)
