# Proposal

## Why

`src/app/auth/register/page.tsx` tiene 1991 líneas en un único componente cliente: 30+ `useState`, 9 pasos de JSX inline (~970 líneas), `handleFinalAction` de ~160 líneas y ~28 líneas de una constante `_LOCALIDADES` que ya no se usa (las localidades vienen de BD vía `getLocalities()`). La lógica de subida de archivos a R2 está copiada tres veces (`saveFormAndFiles`, rama tarjeta y rama transferencia de `handleFinalAction`) y la persistencia en `localStorage` se maneja con funciones sueltas y claves sueltas. Cada cambio al registro (como `fix-registration-payment-failures`) obliga a editar este archivo a ciegas y con riesgo alto de regresión, y no hay pruebas automatizadas que lo detecten.

El resto de la app sigue la convención `page.tsx` (servidor) → `*Client.tsx` (cliente) → `components/ui/*`; el registro es la única pantalla que la rompe.

## What Changes

- Partir `page.tsx` en un `RegisterClient` orquestador más un componente por paso (`StepDatos`, `StepDocumento`, `StepUbicacion`, `StepSalud`, `StepFoto`, `StepPlayera`, `StepPago`, `StepConfirmacion`, `StepExito`) bajo `src/components/auth/register/`. `page.tsx` queda como wrapper delgado.
- Extraer el estado del formulario, la derivación de edad/responsiva y las validaciones por paso a un hook `useRegistrationForm` con una tabla `stepValidators` en lugar de `isStep1Valid … isStep8Valid` sueltos.
- Unificar la persistencia (`cngrs_reg_data` / `cngrs_reg_expiry`, TTL 24 h) en `src/lib/registration-storage.ts`, con tipo explícito del objeto guardado.
- Unificar la subida de archivos en una sola función `ensureUploadedFiles()` y partir `handleFinalAction` en `submitCard()` y `submitProof()`; `buildRegistrationData()` pasa a módulo puro.
- Eliminar la constante muerta `_LOCALIDADES` y los `any` del archivo (`config`, `dbLocalities`, objeto restaurado).
- **Sin cambios de comportamiento**: mismos pasos, textos, validaciones, claves y forma de `localStorage`, llamadas a server actions y redirecciones. Quien tenga un registro a medias en `localStorage` lo retoma igual tras el despliegue.

## Capabilities

### New Capabilities
<!-- Ninguna: refactor interno sin cambio de comportamiento visible. -->

### Modified Capabilities
<!-- Ninguna. El comportamiento del registro queda definido por la capability `registration` del change `fix-registration-payment-failures`; este change no altera sus requirements. `.openspec.yaml` declara `skip_specs: true`. -->

## Impact

- `src/app/auth/register/page.tsx` — reducido a wrapper; su contenido se mueve.
- Nuevos: `src/components/auth/register/*` (orquestador, pasos, hooks), `src/lib/registration-storage.ts`.
- Server actions (`auth.ts`, `stripe.ts`), webhook, esquema de BD y migraciones: **sin cambios**.
- **Dependencia de orden**: `fix-registration-payment-failures` (1/14 tareas marcadas, código ya implementado en `c16538e`) también modifica `handleFinalAction` y `completeStripeRegistration`. Cerrar su verificación (tareas 3.4, 3.5, 4.x) antes de aplicar este change, para no mezclar un refactor con un arreglo aún sin verificar.
- Fuera de alcance: partir `admin.ts`/`auth.ts`, mover la contraseña fuera de `localStorage`, reemplazar `alert()` por UI propia, rediseño visual, introducir un framework de pruebas.
