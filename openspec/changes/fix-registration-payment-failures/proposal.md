## Why

Dos fallas en producción durante el registro con pago:

1. **Transferencia/efectivo**: al enviar el comprobante, el usuario ve `"Error interno al procesar el registro"` (catch genérico de `registerUser()` en `src/app/actions/auth.ts:257`). No hay forma de saber la causa real sin logs del servidor, y el mensaje no le dice al usuario qué hacer.
2. **Tarjeta**: una persona fue cobrada por Stripe pero su cuenta nunca se creó. Durante el registro el webhook no hace nada (`userId = "registration_pending"`); el usuario y el pago sólo se crean si el navegador regresa a `/auth/register?stripe=success` y aún conserva los datos en `localStorage`. Si el navegador se cierra, es un navegador in-app (WhatsApp/Facebook), se pierde `localStorage`, o `registerUser()` falla después del cobro (cupo lleno, teléfono duplicado, error de BD), el cobro queda huérfano.

Además, `registerUser()` hace inserts separados sin transacción (driver `neon-http`) con un "rollback" manual, por lo que un fallo parcial puede dejar datos inconsistentes o un reintento que responde "teléfono ya registrado".

## What Changes

- Validar en servidor todos los campos requeridos del registro **antes** de subir archivos o insertar, devolviendo un mensaje específico (qué campo falta / qué salió mal) en lugar del error genérico.
- Crear usuario + contacto de emergencia + salud + pago en **una sola operación atómica** (`db.batch`, que en `neon-http` corre como transacción), con el `id` del usuario generado en la app. Se elimina el rollback manual.
- Registrar en logs la causa real con etapa y código de error, y notificar al admin por Telegram (config ya existente en `settings`) cuando un registro falla, para diagnosticar sin acceso a logs.
- **Tarjeta**: antes de redirigir a Stripe, guardar el registro pendiente en BD (nueva tabla `pending_registrations`, contraseña ya hasheada) y validar cupos y teléfono **antes de cobrar**. La sesión de Checkout lleva el id del registro pendiente en `metadata`.
- **Tarjeta**: el webhook `checkout.session.completed` finaliza el registro (crea usuario + pago) de forma idempotente. El regreso del navegador llama a la misma función; quien llegue primero crea, el otro sólo lee el resultado. Si la finalización falla, el webhook responde error para que Stripe reintente y se avisa al admin por Telegram.
- El regreso de Stripe ya no depende de `localStorage`: basta el `session_id` de la URL.

## Capabilities

### New Capabilities
- `registration`: registro de asistentes con pago inicial (tarjeta vía Stripe o comprobante de transferencia/efectivo), incluyendo validación, atomicidad, finalización garantizada de pagos con tarjeta y reporte de errores.

### Modified Capabilities
<!-- No hay specs existentes en openspec/specs/. -->

## Impact

- `src/app/actions/auth.ts` — `registerUser()` (validación, batch atómico, errores específicos).
- `src/app/actions/stripe.ts` — `createCheckoutSession()` (registro pendiente en metadata), nueva acción de finalización; `recordNewRegistrationPayment()` queda sin uso en el registro.
- `src/app/api/webhook/stripe/route.ts` — rama `registration_pending` finaliza el registro.
- `src/app/auth/register/page.tsx` — flujo tarjeta: guarda registro pendiente antes de Stripe; `completeStripeRegistration()` llama a la finalización con `session_id`.
- `src/db/schema.ts` + nueva migración Drizzle — tabla `pending_registrations`.
- Helper de Telegram reutilizable (hoy la lógica vive inline en `password-reset.ts`).
- Fuera de alcance: pagos desde el dashboard (usuarios existentes), el cobro huérfano ya ocurrido (se resuelve manualmente: reembolso o alta por admin), y quitar la contraseña en claro de `localStorage` del flujo de transferencia.
