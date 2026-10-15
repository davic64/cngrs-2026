# Design

## Context

Estado actual (observado en `register/page.tsx`, 1991 líneas, `"use client"`):

- L56-88 helpers de `localStorage`; L90-117 `_LOCALIDADES` (sin referencias); L119-278 `ESTADOS_POR_PAIS` (en uso, se conserva); L280 tipo `FormData`.
- L306-478 ~30 `useState`, `useEffect` de init (carga `getSettings`, `getLocalities`, plantilla de carta; detecta `?stripe=success|cancel`; restaura sesión guardada).
- L484-567 persistencia/restauración y `completeStripeRegistration`.
- L618-777 `handleFinalAction`: rama tarjeta (subida → `savePendingRegistration` → `createCheckoutSession` → redirect) y rama transferencia/efectivo (subida → `registerUser` → `setRegistrationSession`).
- L883-1853 JSX de los 9 pasos dentro de `AnimatePresence`; L1860+ modales.
- `FormData` (DOM) y el tipo local `FormData` colisionan en nombre.

Restricciones: no hay pruebas automatizadas (CLAUDE.md); el comportamiento debe quedar idéntico; el registro en curso de usuarios reales vive en `localStorage` con claves y forma fijas. Ver proposal.md para la motivación.

## Goals / Non-Goals

**Goals:**
- Ningún archivo del registro por encima de ~300 líneas.
- Cada paso es un componente que recibe `formData`, `setField` y lo que necesite, sin lógica de envío.
- Una sola implementación de subida de archivos y una sola de persistencia local.
- Comportamiento, claves de `localStorage` y llamadas a server actions idénticas.

**Non-Goals:**
- Cambiar server actions, BD, webhook o flujo de pago.
- Introducir librerías (react-hook-form, zod, zustand, framer ya está) o un framework de pruebas.
- Cambios de UX/diseño o de textos.

## Decisions

1. **`page.tsx` delgado + `RegisterClient`** en `src/components/auth/register/`, igual que `LoginClient`. Alternativa: dejar todo en `page.tsx` y sólo extraer hooks → deja el JSX de 970 líneas, que es el problema principal.
2. **Un componente por paso**, props `{ formData, setField, ... }` (sin context). Con 9 pasos y un solo nivel de anidación, prop drilling es más simple y trazable que un Context. Alternativa: Context de formulario → indirección sin beneficio a este tamaño.
3. **`useRegistrationForm()`** devuelve `formData`, `setFormData`, `edadInt`, `needsResponsiva`, `isStepValid(step)`. Validadores en una tabla `stepValidators: Record<number, (f: RegistrationFormData) => boolean>` copiando literalmente las condiciones actuales (`isStep1Valid…isStep8Valid`). Renombrar el tipo local a `RegistrationFormData` para no chocar con el `FormData` del DOM.
4. **`src/lib/registration-storage.ts`**: `saveRegText`, `loadRegText`, `clearRegStorage` con el mismo `REG_KEY`, `REG_EXPIRY_KEY` y TTL, y tipo `SavedRegistration` (campos de texto + `profilePhotoUrl`, `documentUrl`, `sessionId`, `baseAmount`). Misma forma serializada ⇒ compatible con sesiones ya guardadas.
5. **`ensureUploadedFiles(formData)`** → `{ profileUrl, docUrl, sessionId }`: si `loadRegText()` ya trae `profilePhotoUrl` y `sessionId`, los reutiliza; si no, llama `uploadRegistrationFiles` y guarda. Reemplaza los tres bloques duplicados. Mantiene la semántica actual: `saveFormAndFiles` (paso 7→8) la invoca sin bloquear la navegación.
6. **`useRegistrationSubmit()`** expone `submitCard()` y `submitProof()` (cuerpo de las dos ramas de `handleFinalAction`) más `completeStripeRegistration(sessionId)`. `buildRegistrationData(formData, extras)` es una función pura en `registration-form-data.ts`. Los `alert()` se conservan tal cual.
7. **Borrar `_LOCALIDADES`** y tipar `config`/`dbLocalities` con los tipos de Drizzle (`typeof settings.$inferSelect`, `typeof localities.$inferSelect`) en vez de `any`.
8. **Orden de extracción** (de menor a mayor riesgo): lib/storage → borrar código muerto → hook de formulario → `buildRegistrationData` + `ensureUploadedFiles` → submit → pasos uno por uno → `RegisterClient`. Cada commit deja la app compilando.

## Risks / Trade-offs

- [Regresión sin pruebas automatizadas] → Recorrido manual completo de los tres métodos de pago (tarjeta, transferencia, efectivo), retorno `?stripe=success`/`cancel` y restauración desde `localStorage`; `npx tsc --noEmit`, `npm run lint` y `npm run build` limpios tras cada grupo de tareas.
- [Conflicto con `fix-registration-payment-failures`, que toca las mismas funciones y aún está sin verificar] → Aplicar este change después de cerrar aquél; mover el código sin reescribirlo.
- [Cambio sutil de ciclo de vida de estado al mover `useState` a hooks/pasos] → El estado del formulario vive sólo en `RegisterClient`/`useRegistrationForm`; los pasos no guardan estado propio salvo UI efímera (modales, previews) que ya era local.
- [Props demasiado largas en pasos como Documento (OCR) o Pago] → Aceptable; si un paso necesita >8 props se agrupa en un objeto, no se introduce Context.

## Migration Plan

Despliegue normal, sin migración de BD ni de datos. Rollback: revertir el commit. Los registros a medias en `localStorage` siguen siendo válidos porque claves y forma no cambian.

## Notas de implementación

- Además de lo previsto se extrajeron `useCartaTemplate`, `useDocumentCheck` (estado del OCR del paso 2), `ProgressDots`, `ContactoEmergenciaModal`, `AgeRestrictedModal`, `CompletingRegistrationScreen` y `locations.ts` (`ESTADOS_POR_PAIS`) para acercar los archivos al objetivo de tamaño.
- `RegisterClient` queda en ~340 líneas, sobre el objetivo de ~300: lo ocupa el cableado de props a los pasos y `restoreFromStorage`.
- Código muerto detectado y **conservado** (fuera de alcance): `AgeRestrictedModal`/`detectedAge` nunca se abren (sus setters no se llaman), `setPaymentStatus("success")` nunca se invoca, y `getSettings()` entrega al cliente toda la fila de `settings` (incluye `telegramToken`).
