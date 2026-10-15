# Proposal

## Why

El panel del admin no permite corregir errores de captura ni de cobro: el expediente de un asistente es de sólo lectura (salvo estado, carta responsiva y contraseña temporal) y los pagos sólo se pueden aprobar o rechazar. Cuando alguien se equivoca en su teléfono, su localidad o el monto de un pago en efectivo, el admin no tiene cómo arreglarlo. Además el dashboard (`AdminDashboardClient`, 466 líneas) sólo muestra 4 contadores, 3 pagos por validar y la configuración de costos; no dice cuánto cupo queda, cuánto falta por cobrar ni cómo avanzan los registros.

Al explorar el código apareció un problema previo que condiciona el cambio: **ninguna acción de `src/app/actions/admin.ts` verifica que quien la invoca sea admin** (sólo el layout de `/admin` lo hace). Las Server Actions son endpoints públicos, así que hoy cualquiera puede llamar `updateUserDetails`, `deleteUser`, `generateTemporaryPassword` (obtiene la contraseña temporal de cualquier usuario) o `createAdmin`. `getSettings()` además entrega al navegador el token y chat de Telegram. Agregar más poder de edición sin cerrar esto lo agravaría.

## What Changes

- **Autorización admin**: toda acción que sólo debe usar un admin exige sesión con `role = 'admin'`; `getSettings()` deja de exponer credenciales de Telegram (el admin las lee por una acción protegida).
- **Edición de asistentes**: el admin edita desde el expediente nombre, apellido, teléfono, edad, género, talla, país/estado/localidad, contacto de emergencia y datos de salud, con las mismas validaciones del registro y teléfono único.
- **Edición de pagos**: el admin edita monto, tipo, método, estatus y motivo de rechazo de un pago, agrega pagos manuales (p. ej. efectivo recibido en persona) y elimina pagos. El estatus de registro del asistente se recalcula siempre desde los pagos validados.
- **BREAKING**: se quita el cambio manual de `registrationStatus` en el expediente (`updateUserDetails` con estatus); ahora se obtiene editando o agregando pagos, para que estatus y pagos nunca se contradigan.
- **Bitácora**: cada edición queda registrada (quién, qué asistente/pago, campo, valor anterior y nuevo) en la nueva tabla `admin_audit_log`.
- **Dashboard**: añade cupos (general ≤29 y acompañantes >29 contra sus límites), asistentes por estatus de registro, ingresos validados / en revisión / por cobrar y por método de pago, registros por día (últimos 30), top localidades, y tarjetas que enlazan a la lista de asistentes filtrada por estatus. Se parte `AdminDashboardClient` en componentes; los paneles de costos, términos y carta responsiva se conservan sin cambio de comportamiento.

## Capabilities

### New Capabilities
- `admin-authorization`: sólo sesiones admin pueden ejecutar operaciones administrativas; las credenciales de Telegram no llegan a clientes no admin.
- `admin-dashboard`: métricas del congreso (cupos, estatus, ingresos, tendencia, localidades) y accesos a listas filtradas.
- `attendee-record-editing`: edición por el admin de los datos personales, de contacto y de salud de un asistente, con validación, unicidad de teléfono, control de cupo y bitácora.
- `payment-record-editing`: alta, edición y baja de pagos por el admin, con recálculo del estatus de registro y bitácora.

### Modified Capabilities
<!-- Ninguno: `openspec/specs/` está vacío. La capability `registration` vive en el change fix-registration-payment-failures y no cambia. -->

## Impact

- `src/app/actions/support.ts`: guardia admin en las acciones del lado admin (p. ej. `updateTelegramConfig`).
- `src/app/actions/admin.ts` (725 líneas): guardia admin en las acciones administrativas; nuevas acciones de edición; `getAdminStats()` ampliado; `validatePayment()` pasa a usar el recálculo de estatus compartido. Probable partición por dominio (`admin-users`, `admin-payments`, `admin-stats`) para no crecer el archivo.
- `src/lib/`: nuevo helper `admin-auth` (`requireAdmin`), `registration-status` (recálculo compartido) y `audit`.
- `src/db/schema.ts` + migración Drizzle: tabla `admin_audit_log`.
- `src/components/admin/`: `AdminDashboardClient` partido; `AdminUsersClient` (947 líneas) gana formularios de edición de asistente y de pago.
- `getSettings()` (consumida por `RegisterClient`, `/dashboard` y páginas admin) devuelve la proyección pública.
- Sin cambios: flujo de registro y pagos de asistentes, webhook de Stripe (queda con su propio cálculo de estatus; unificarlo se deja para después porque `fix-registration-payment-failures` sigue en curso).
- Fuera de alcance: reemplazar foto de perfil, editar contraseña, firmar la cookie de sesión (hoy es el UUID en claro: la guardia admin es tan fuerte como la sesión), endurecer acciones de asistentes o públicas (`auth.ts`, `stripe.ts`, `venue.ts`), visor de la bitácora en la UI, edición masiva, exportaciones nuevas, gráficas con librería externa.
