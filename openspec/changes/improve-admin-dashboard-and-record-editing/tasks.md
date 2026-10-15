# Tasks

## 1. Autorización admin

- [x] 1.1 Crear `src/lib/admin-auth.ts` con `requireAdmin()` (devuelve el admin; lanza `Error("No autorizado")` sin sesión o con rol `user`); verificar con `npx tsc --noEmit` y una prueba manual: llamada con sesión de asistente rechazada, con sesión admin aceptada — _tsc limpio; prueba con sesión en 6.2_
- [x] 1.2 Agregar `await requireAdmin()` al inicio de todas las acciones de `src/app/actions/admin.ts` salvo las públicas de la Decisión 2 (`getLocalities`, `getSettings`, `getVenue`, `getAgendaDays`, `getEvents`, `getCartaResponsivaTemplate`, `getSupportInfo`); verificar con `grep -c requireAdmin` igual al número de acciones administrativas — _33 exportaciones: 6 públicas, 27 con guardia; tsc limpio_
- [x] 1.3 Hacer que `getSettings()` no devuelva `telegramToken`/`telegramChatId` (proyección pública). `/admin/soporte` los sigue leyendo en su server component (ya protegido por el layout), por lo que no hace falta `getAdminSettings()`; verificado con `tsc` y `grep` de que ningún componente cliente usa esos campos
- [x] 1.4 Guardar en `src/app/actions/support.ts` `updateTelegramConfig`, `getActiveSupportChats`, `getAllSupportChats`, `closeSupportChat` y `sendSupportMessage` cuando `sender === "admin"`; el widget del visitante (`createSupportChat`, `getChatById`, `getSupportMessages`, `sendSupportMessage` como visitor) queda público; `tsc` limpio

## 2. Base de datos y utilidades compartidas

- [ ] 2.1 Agregar tabla `admin_audit_log` en `src/db/schema.ts` (Decisión 4), `npx drizzle-kit generate` y `npx drizzle-kit migrate`; verificar la tabla en Drizzle Studio
- [x] 2.2 Crear `src/lib/capacity.ts` (`REGULAR_LIMIT`, `ADULT_COMPANION_LIMIT`) y usarlo en `checkCapacity`; verificar que el registro sigue rechazando por cupo con los mismos mensajes y `npx tsc --noEmit` limpio — _registro y Stripe usan las constantes; tsc limpio_
- [x] 2.3 Crear `src/lib/registration-status.ts` con `recomputeStatusStatement()` (Decisión 3) y usarlo en `validatePayment`; verificar aprobar un pago parcial (estatus parcial), uno que completa el total (completado) y rechazar el único pago (pendiente) — _SQL generado verificado; probar aprobar/rechazar en 6.2_
- [x] 2.4 Crear `src/lib/audit.ts` con `auditStatement()` y `diffChanges(before, after)`; verificar con un script de asserts (scratchpad) que `diffChanges` devuelve sólo campos distintos y `{}` si no hay cambios — _`diffChanges` en `src/lib/diff-changes.ts` (puro); asserts pasan_

## 3. Edición de asistentes

- [x] 3.1 Crear `src/lib/attendee-edit.ts` con `validateAttendeeEdit()` (obligatorios, edad ≥ 15, género `M|F|Otro`, teléfono con dígitos); verificar con un script de asserts que edad 14, nombre vacío y género `X` devuelven el campo erróneo — _asserts pasan (edad 14/"abc"/20.5, nombre vacío, género X, contacto vacío)_
- [x] 3.2 Crear `updateAttendee()` en `src/app/actions/admin-attendees.ts` (Decisión 5: validación, diff sin cambios, teléfono único, cupo por bolsa, batch con upsert de contacto/salud y bitácora) y eliminar `updateUserDetails`; verificar un cambio de localidad y contacto, teléfono duplicado rechazado, edad 25→35 con acompañantes llenos rechazada, y que un fallo forzado no deja cambios parciales — _tsc limpio; probar edición, duplicado, cupo y atomicidad en 6.2 (requiere migrar `admin_audit_log`)_
- [x] 3.3 Crear `EditAttendeeModal` y conectarlo al expediente de `AdminUsersClient` (usar `selectedId` derivado de `initialUsers` + `router.refresh()`, quitar los botones de estatus manual); verificar editar un asistente en el navegador, ver el expediente actualizado y que ya no hay control de estatus — _el control de estatus manual era código muerto (`handleUpdateStatus` sin uso) y se eliminó; tsc limpio; probar en el navegador en 6.2_

## 4. Edición de pagos

- [x] 4.1 Crear `createPayment`, `updatePayment` y `deletePayment` en `src/app/actions/admin-payments.ts` (Decisión 6: validaciones, motivo de rechazo, batch con recálculo y bitácora, borrado del comprobante tras el batch); verificar monto 0 rechazado, rechazo sin motivo rechazado y que eliminar el único pago completado pasa al asistente a pendiente — _asserts de `validatePaymentEdit` pasan; SQL de `currval` para la bitácora de altas verificado; tsc limpio; probar contra BD en 6.2_
- [x] 4.2 Extraer la sección de pagos del drawer a `AttendeePaymentsSection` y crear `PaymentEditorModal` (editar, agregar, eliminar con confirmación, advertencia en `tarjeta`); verificar agregar un efectivo completado de 1500 a un pendiente (queda completado) y editar el monto a 500 (queda parcial) — _tsc limpio; `AdminUsersClient` 947→844 líneas; probar en el navegador en 6.2_

## 5. Dashboard

- [x] 5.1 Crear `getAdminStats()` ampliado en `src/app/actions/admin-stats.ts` con tipo `AdminStats` (Decisión 8: cupos, estatus, finanzas, serie de 30 días, top localidades); verificar con datos de prueba que cupos coinciden con `getAdultCompanionCount`/`getRegularRegistrationCount`, por cobrar de un parcial (1500−500=1000) y días sin registros con 0 — _`getAdminStats` movida a `admin-stats.ts` con tipo `AdminStats`; SQL generado revisado (zona horaria inlineada para que `GROUP BY` coincida); ejecutar contra datos en 6.2_
- [x] 5.2 Agregar a `/admin/users` el filtro `?status=` con selector en la tabla; verificar que `/admin/users?status=parcial` sólo lista parciales y que el selector cambia la lista — _tsc limpio; probar `?status=parcial` en 6.2_
- [x] 5.3 Partir `AdminDashboardClient` moviendo, sin cambiar comportamiento, `CostsPanel`, `TermsPanel`, `CartaPanel`, `PendingPaymentsCard` y `RejectedPaymentsCard` a `src/components/admin/dashboard/`; verificar guardar costos, términos y subir/borrar la carta como antes y `AdminDashboardClient` < 200 líneas — _`AdminDashboardClient` 466→72 líneas; tsc/build limpios_
- [x] 5.4 Crear `StatCards` (con enlaces a listados), `CapacityCard`, `FinanceCard`, `RegistrationsChart` y `TopLocalities` y componerlos en el dashboard; verificar en el navegador cada escenario de `admin-dashboard` y el diseño en ancho móvil — _tsc/build limpios; revisar escenarios y ancho móvil en 6.2_

## 6. Verificación integral

- [x] 6.1 `npx tsc --noEmit` limpio, `npm run build` ok, `npm run lint` sin errores nuevos (proyecto 70→69 errores; los restantes de los archivos tocados son previos: a11y de tarjetas clicables, `any` y `<img>`)
- [ ] 6.2 Recorrido de admin con BD de prueba: editar asistente (incluida la bitácora: dos campos cambiados generan una entrada con valores anteriores/nuevos; guardar sin cambios no escribe nada), agregar/editar/eliminar pago (la bitácora registra altas, ediciones de estatus y bajas con el admin correcto), revisar dashboard y bitácora en Drizzle Studio; recorrido de asistente y visitante sin regresiones (registro como visitante, `/dashboard`, `/dashboard/agenda` y `/dashboard/venue` con sesión de asistente, widget de soporte; con sesión de asistente una llamada a una acción admin es rechazada)
