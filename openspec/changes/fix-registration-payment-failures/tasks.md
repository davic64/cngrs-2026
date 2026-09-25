## 1. Base

- [ ] 1.1 Extraer `notifyAdmin(text)` a `src/lib/telegram.ts` (lee `settings`, nunca lanza) y hacer que `password-reset.ts` lo use; verificar que la solicitud de cambio de contraseña sigue llegando a Telegram — _implementado; falta verificar con BD/Stripe_
- [ ] 1.2 Agregar tabla `pending_registrations` en `src/db/schema.ts` (Decisión 4), `npx drizzle-kit generate` y `migrate`; verificar la tabla en Drizzle Studio — _migración generada (`drizzle/0002_fair_blonde_phantom.sql`); falta `migrate`_

## 2. Registro atómico y errores específicos (transferencia/efectivo)

- [x] 2.1 Implementar `validateRegistration()` con los campos del requirement "Validación previa"; verificar con un `assert` rápido (script en scratchpad) que falta de contacto y género inválido devuelven el error correcto
- [ ] 2.2 Implementar `createRegistration()` con `db.batch` y `userId` generado en la app (Decisión 1); verificar que un pago con `type` nulo forzado no deja usuario huérfano en BD — _implementado; falta verificar con BD/Stripe_
- [ ] 2.3 Reescribir `registerUser()`: validar → subir comprobante → `createRegistration()`, con seguimiento de etapa, log con código de error, `notifyAdmin` y mensaje por etapa; quitar el rollback manual; verificar un registro por transferencia exitoso y uno con contacto vacío mostrando el mensaje específico — _implementado; falta verificar con BD/Stripe_
- [ ] 2.4 Verificar que reintentar tras un fallo con el mismo teléfono no responde "teléfono ya registrado"

## 3. Tarjeta: pendiente + finalización idempotente

- [ ] 3.1 Implementar action `savePendingRegistration()` (validación, teléfono libre, cupos, upsert con `password_hash`); verificar que un teléfono existente devuelve el error sin crear fila — _implementado; falta verificar con BD/Stripe_
- [ ] 3.2 Implementar `finalizeCardRegistration(checkoutSessionId)` (Decisión 5) incluyendo manejo de `23505`, estado `failed` + `notifyAdmin`, y cookie de sesión para el caso navegador; verificar que llamarla dos veces con la misma sesión deja un solo usuario y un solo pago — _implementado; falta verificar con BD/Stripe_
- [ ] 3.3 Webhook `registration_pending`: llamar la finalización, responder `500` en fallo y `200` en éxito/ya completado; verificar con `stripe trigger`/`stripe listen` en local — _implementado; falta verificar con BD/Stripe_
- [ ] 3.4 `register/page.tsx`: llamar `savePendingRegistration()` antes de `createCheckoutSession()` y abortar con `alert` si falla; verificar que con teléfono duplicado no se abre Stripe — _implementado; falta verificar con BD/Stripe_
- [ ] 3.5 `completeStripeRegistration()`: usar sólo `finalizeCardRegistration(session_id)` (elimina el `tipoPago = "tarjeta"` erróneo y la dependencia de `localStorage`); verificar pago de prueba completo que termina en `/dashboard` con estatus correcto — _implementado; falta verificar con BD/Stripe_

## 4. Verificación integral

- [ ] 4.1 Pago de prueba con tarjeta cerrando la pestaña antes del redirect: verificar que el webhook crea el usuario y se puede iniciar sesión
- [ ] 4.2 Regreso de Stripe en una ventana privada (sin `localStorage`): verificar que el registro se completa
- [ ] 4.3 `npm run lint` sin errores nuevos
