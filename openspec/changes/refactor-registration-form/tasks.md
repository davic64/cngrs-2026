# Tasks

## 0. Prerrequisito

- [ ] 0.1 Cerrar la verificación de `fix-registration-payment-failures` (tareas 3.4, 3.5, 4.1–4.3) y archivar o congelar ese change; verificar con `openspec status --change fix-registration-payment-failures`

## 1. Base y código muerto

- [x] 1.1 Crear `src/lib/registration-storage.ts` con `saveRegText`/`loadRegText`/`clearRegStorage` y tipo `SavedRegistration` (mismas claves y TTL); importar desde `page.tsx`; verificar con `npx tsc --noEmit` y que la clave `cngrs_reg_data` sigue escribiéndose igual al llegar al paso 8
- [x] 1.2 Eliminar `_LOCALIDADES` (sólo esa; `ESTADOS_POR_PAIS` sí se usa y se conserva) de `page.tsx` tras `grep -n "_LOCALIDADES" src` sin otras referencias; verificar `npm run lint` y que el selector de localidades sigue mostrando las de BD
- [x] 1.3 Renombrar el tipo local `FormData` a `RegistrationFormData` y tipar `config`/`dbLocalities` con tipos de Drizzle (sin `any`); verificar `npx tsc --noEmit`

## 2. Lógica extraída

- [x] 2.1 Crear `useRegistrationForm()` (`formData`, `setFormData`, `edadInt`, `needsResponsiva`, `isStepValid(step)` con tabla `stepValidators` copiada de `isStep1Valid…isStep8Valid`); verificar que cada botón "Siguiente" se habilita/deshabilita igual que antes en los pasos 1–8
- [ ] 2.2 Crear `registration-form-data.ts` con `buildRegistrationData()` puro y `ensureUploadedFiles()`, reemplazando los tres bloques de subida duplicados; verificar que en un registro con tarjeta y otro con transferencia se sube un solo juego de archivos a R2 (un `sessionId` en `localStorage`) — _implementado, tsc/lint limpios; falta verificación manual (4.2)_
- [ ] 2.3 Crear `useRegistrationSubmit()` con `submitCard()`, `submitProof()` y `completeStripeRegistration()` moviendo el código sin reescribirlo; verificar un registro completo por transferencia (llega al paso 9) y uno con tarjeta hasta la redirección a Stripe — _implementado, tsc/lint limpios; falta verificación manual (4.2)_

## 3. Componentes por paso

- [x] 3.1 Extraer `StepDatos`, `StepDocumento` (OCR/`verifyIsIdDocument`, modal de edad) y `StepUbicacion` a `src/components/auth/register/steps/`; verificar paso 1–3 idénticos y que `idAttempts`/`idCheckError` siguen funcionando — _extraído, tsc/lint/build limpios; recorrido manual en 4.2_
- [x] 3.2 Extraer `StepSalud`, `StepFoto` y `StepPlayera` (términos y responsiva para 15–17 años); verificar que con edad 16 se pide la carta responsiva y con 20 no — _extraído, tsc/lint/build limpios; recorrido manual en 4.2_
- [x] 3.3 Extraer `StepPago`, `StepConfirmacion` (paso 8, comprobante) y `StepExito` (paso 9); verificar que los tres métodos de pago llegan al resultado correcto — _extraído, tsc/lint/build limpios; recorrido manual en 4.2_
- [x] 3.4 Crear `RegisterClient` (estado de paso, `AnimatePresence`, modales, `useEffect` de init con retorno de Stripe/restauración) y dejar `page.tsx` como wrapper; verificado: `page.tsx` 5 líneas; `RegisterClient` 339 líneas (no <300: el resto es cableado de props de los pasos y `restoreFromStorage`; el resto de archivos <300); HTML SSR del paso 1 idéntico al de `HEAD`

## 4. Verificación integral

- [x] 4.1 `npx tsc --noEmit` limpio, `npm run build` ok, `npm run lint` sin errores nuevos (proyecto 74→70 errores, 108→103 warnings; los restantes del registro son previos: init effect y estados sin uso)
- [ ] 4.2 Recorrido manual: registro con tarjeta (incl. `?stripe=cancel` y reintento), transferencia, efectivo, edad 15 y 14 (bloqueo), y cierre de pestaña en el paso 8 con restauración desde `localStorage`; verificar que no hay diferencia observable con `main`
