# Spec Delta

## Purpose

Permite al administrador corregir los datos personales, de contacto y de salud de un asistente ya registrado, conservando las reglas del registro y dejando constancia de cada cambio.

## ADDED Requirements

### Requirement: Edición de datos del asistente
El sistema SHALL permitir al administrador editar de un asistente: nombre, apellido, teléfono, edad, género, talla, país, estado, localidad, nombre y teléfono del contacto de emergencia, alergias, padecimientos, medicamentos y dosis/frecuencia. Los cambios MUST guardarse juntos o ninguno.

#### Scenario: Corregir localidad y contacto
- **WHEN** el admin cambia la localidad y el teléfono de contacto y guarda
- **THEN** el expediente muestra ambos valores nuevos y el resto de campos queda igual

#### Scenario: Falla al guardar
- **WHEN** ocurre un error de base de datos a mitad de la edición
- **THEN** ningún campo del asistente queda modificado y el admin ve un mensaje de error

### Requirement: Validación de la edición
El sistema SHALL aplicar a la edición las mismas reglas del registro: campos obligatorios no vacíos, edad numérica mínima 15 y género `M`, `F` u `Otro`. Si algo es inválido MUST rechazar la edición indicando qué campo corregir y sin guardar nada.

#### Scenario: Edad menor al mínimo
- **WHEN** el admin guarda una edad de 14
- **THEN** el sistema rechaza la edición mencionando la edad y no cambia ningún dato

#### Scenario: Campo obligatorio vacío
- **WHEN** el admin deja vacío el nombre
- **THEN** el sistema rechaza la edición mencionando el nombre

### Requirement: Teléfono único
El sistema MUST NOT permitir que dos usuarios compartan teléfono. Si el teléfono editado ya pertenece a otro usuario, SHALL rechazar la edición con un mensaje específico.

#### Scenario: Teléfono de otro asistente
- **WHEN** el admin guarda un teléfono que ya tiene otro usuario
- **THEN** el sistema responde que el teléfono ya está registrado y no cambia nada

#### Scenario: Mismo teléfono del propio asistente
- **WHEN** el admin guarda sin cambiar el teléfono
- **THEN** la edición continúa sin error de duplicado

### Requirement: Cupo al cambiar de edad
El sistema SHALL rechazar un cambio de edad que mueva a un asistente con registro completado de la bolsa de edad ≤ 29 a la de > 29 (o al revés) cuando la bolsa destino esté llena, indicando que el cupo está lleno. Si la edad se mantiene en la misma bolsa, o el registro no está completado, no se valida cupo.

#### Scenario: Acompañantes llenos
- **WHEN** hay 50 acompañantes completados y el admin cambia de 25 a 35 la edad de un asistente completado
- **THEN** el sistema rechaza el cambio por cupo lleno y la edad no cambia

#### Scenario: Cambio dentro de la misma bolsa
- **WHEN** el admin cambia la edad de 31 a 40
- **THEN** el cambio se guarda sin consultar cupo

### Requirement: Bitácora de ediciones
El sistema SHALL registrar cada edición exitosa con el administrador, el asistente, la fecha y, por cada campo cambiado, el valor anterior y el nuevo. Una edición que no cambia ningún valor MUST NOT escribir datos ni bitácora.

#### Scenario: Edición con dos campos
- **WHEN** el admin cambia la talla de M a L y la localidad
- **THEN** la bitácora guarda una entrada con ambos campos, sus valores anteriores y nuevos y el admin que la hizo

#### Scenario: Sin cambios
- **WHEN** el admin guarda sin modificar nada
- **THEN** no se escribe bitácora y se informa que no hubo cambios

### Requirement: Estatus de registro no se edita directamente
El sistema SHALL derivar el estatus de registro de los pagos validados y MUST NOT permitir fijarlo manualmente desde el expediente.

#### Scenario: Expediente del asistente
- **WHEN** el admin abre el expediente
- **THEN** el estatus se muestra pero no ofrece controles para cambiarlo
