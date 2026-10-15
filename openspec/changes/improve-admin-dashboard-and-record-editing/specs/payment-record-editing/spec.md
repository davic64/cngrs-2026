# Spec Delta

## Purpose

Permite al administrador corregir, agregar y eliminar pagos de un asistente, manteniendo siempre consistente su estatus de registro y dejando constancia de cada cambio.

## ADDED Requirements

### Requirement: Edición de un pago
El sistema SHALL permitir al administrador editar de un pago el monto (entero positivo), el tipo (`completo` o `inscripcion`), el método (`tarjeta`, `transferencia` o `efectivo`), el estatus (`pendiente`, `revision`, `completado` o `rechazado`) y el motivo de rechazo.

#### Scenario: Corregir monto
- **WHEN** el admin cambia el monto de 500 a 1500 en un pago completado
- **THEN** el pago muestra 1500 y cuenta con ese monto en el total validado

#### Scenario: Monto inválido
- **WHEN** el admin guarda un monto de 0 o negativo
- **THEN** el sistema rechaza el cambio y el pago no se modifica

### Requirement: Motivo obligatorio al rechazar
El sistema SHALL exigir un motivo de rechazo no vacío cuando el estatus resultante sea `rechazado`. Si el estatus deja de ser `rechazado`, el motivo MUST borrarse.

#### Scenario: Rechazo sin motivo
- **WHEN** el admin cambia un pago a rechazado sin motivo
- **THEN** el sistema rechaza el cambio pidiendo el motivo

#### Scenario: Pago rechazado vuelve a revisión
- **WHEN** el admin cambia un pago rechazado a revisión
- **THEN** el pago queda en revisión sin motivo de rechazo

### Requirement: Alta manual de pagos
El sistema SHALL permitir al administrador agregar un pago a un asistente con monto, tipo, método y estatus (por defecto `completado`), por ejemplo un pago en efectivo recibido en persona.

#### Scenario: Efectivo en persona
- **WHEN** el admin agrega un pago en efectivo completado de 1500 a un asistente pendiente
- **THEN** el asistente queda con estatus completado

### Requirement: Baja de pagos
El sistema SHALL permitir al administrador eliminar un pago, borrando también su comprobante almacenado, tras confirmación explícita.

#### Scenario: Eliminar pago con comprobante
- **WHEN** el admin confirma eliminar un pago que tiene comprobante
- **THEN** el pago y su archivo de comprobante dejan de existir

### Requirement: Estatus de registro recalculado
Tras agregar, editar o eliminar un pago, el sistema SHALL recalcular el estatus del asistente: `completado` si la suma de pagos completados alcanza el precio de pago completo vigente, `parcial` si es mayor a cero pero menor, y `pendiente` si es cero.

#### Scenario: Se elimina el único pago
- **WHEN** el admin elimina el único pago completado de un asistente completado
- **THEN** su estatus pasa a pendiente

#### Scenario: Suma parcial
- **WHEN** el pago completo cuesta 1500 y quedan 500 en pagos completados
- **THEN** el estatus es parcial

### Requirement: Cambios de pago en una operación
El sistema SHALL aplicar el cambio del pago, el recálculo del estatus y la entrada de bitácora juntos o ninguno.

#### Scenario: Falla el recálculo
- **WHEN** falla la actualización del estatus del asistente durante la edición de un pago
- **THEN** el pago conserva sus valores anteriores y no se escribe bitácora

### Requirement: Bitácora de pagos
El sistema SHALL registrar cada alta, edición o baja de pago con el administrador, el asistente, el pago, la fecha y, en ediciones, valor anterior y nuevo de cada campo cambiado.

#### Scenario: Edición de estatus
- **WHEN** el admin cambia un pago de revisión a completado
- **THEN** la bitácora guarda el cambio de estatus con el admin que lo hizo
