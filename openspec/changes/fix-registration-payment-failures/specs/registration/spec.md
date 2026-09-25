## Purpose

Registro de asistentes al congreso con su pago inicial (tarjeta vía Stripe o comprobante de transferencia/efectivo), garantizando que ningún pago quede sin cuenta y que los errores sean comprensibles y diagnosticables.

## ADDED Requirements

### Requirement: Validación previa de datos de registro
El sistema SHALL validar en el servidor, antes de subir archivos o crear registros, que estén presentes y sean válidos: nombre, apellido, teléfono, contraseña, edad numérica ≥ 15, género (`M`, `F` u `Otro`), talla, país, estado, localidad, nombre y teléfono del contacto de emergencia, datos de salud, tipo de pago y método de pago. Si algo falta o es inválido, el sistema MUST rechazar el registro con un mensaje que indique qué dato corregir, sin crear ningún registro.

#### Scenario: Falta el contacto de emergencia
- **WHEN** se envía un registro sin nombre o teléfono de contacto de emergencia
- **THEN** el sistema responde con un error que menciona el contacto de emergencia y no crea usuario, contacto, datos de salud ni pago

#### Scenario: Género inválido tras restaurar sesión
- **WHEN** se envía un registro con género vacío o fuera de `M`, `F`, `Otro`
- **THEN** el sistema responde con un error que menciona el género y no crea registros

### Requirement: Creación atómica del registro
El sistema SHALL crear el usuario, su contacto de emergencia, sus datos de salud y su pago inicial como una sola operación: o se crean todos, o ninguno.

#### Scenario: Falla al insertar el pago
- **WHEN** la inserción del pago inicial falla
- **THEN** no queda usuario, contacto de emergencia ni datos de salud del intento

#### Scenario: Reintento tras un fallo
- **WHEN** un registro falla y el usuario lo reintenta con el mismo teléfono
- **THEN** el reintento no es rechazado por "teléfono ya registrado" a causa del intento fallido

### Requirement: Errores de registro específicos y reportados
Cuando un registro falla por una causa no prevista, el sistema SHALL mostrar al usuario un mensaje que indique la etapa que falló (p. ej. subida del comprobante o guardado de datos) y cómo proceder, SHALL registrar en el log del servidor la causa técnica con la etapa y el código de error, y SHALL notificar al administrador por Telegram con el nombre, teléfono, método de pago y causa.

#### Scenario: Falla la subida del comprobante
- **WHEN** falla el almacenamiento del comprobante de pago
- **THEN** el usuario ve un mensaje indicando que no se pudo subir el comprobante y que lo intente de nuevo, y no se crea ningún registro

#### Scenario: Error inesperado de base de datos
- **WHEN** falla la creación del registro por un error no previsto
- **THEN** el log contiene la etapa y el código del error, y el administrador recibe una notificación de Telegram con los datos del intento

#### Scenario: Telegram no configurado
- **WHEN** falla un registro y Telegram no está configurado en ajustes
- **THEN** el usuario recibe su mensaje de error igualmente y el fallo queda en el log

### Requirement: Validación antes de cobrar con tarjeta
Antes de redirigir a Stripe, el sistema SHALL validar los datos del registro, que el teléfono no esté registrado y que haya cupo en la categoría correspondiente, y SHALL guardar el registro pendiente en el servidor. Si alguna validación falla, el sistema MUST NOT iniciar el cobro.

#### Scenario: Teléfono ya registrado
- **WHEN** un usuario elige pagar con tarjeta con un teléfono ya registrado
- **THEN** el sistema muestra "El número telefónico ya está registrado" y no lo redirige a Stripe

#### Scenario: Cupo lleno
- **WHEN** la categoría del usuario (adulto acompañante o asistente general) no tiene cupo
- **THEN** el sistema muestra el mensaje de cupo lleno y no lo redirige a Stripe

### Requirement: Finalización garantizada del registro pagado con tarjeta
Cuando Stripe confirma un pago de registro, el sistema SHALL crear el usuario y su pago completado a partir del registro pendiente guardado, sin depender del navegador del usuario. La finalización MUST ser idempotente: si se ejecuta más de una vez para el mismo pago (webhook, regreso del navegador, reintentos), MUST existir exactamente un usuario y un pago.

#### Scenario: El usuario cierra el navegador tras pagar
- **WHEN** Stripe confirma el pago y el usuario nunca regresa al sitio
- **THEN** el webhook crea la cuenta y el pago completado, y el usuario puede iniciar sesión con su teléfono y contraseña

#### Scenario: Webhook y navegador llegan a la vez
- **WHEN** el webhook y el regreso del navegador procesan el mismo pago
- **THEN** existe un solo usuario y un solo pago, y el navegador inicia la sesión de ese usuario

#### Scenario: Regreso sin datos locales
- **WHEN** el usuario regresa de Stripe en un navegador sin los datos de registro guardados localmente
- **THEN** el sistema completa o recupera el registro usando sólo el identificador de la sesión de pago y lo lleva a su panel

#### Scenario: Estatus según monto
- **WHEN** se finaliza un registro pagado con tarjeta
- **THEN** el estatus del usuario es `completado` si el monto pagado es ≥ al precio completo vigente, y `parcial` en otro caso

### Requirement: Fallo en la finalización de un pago con tarjeta
Si la finalización de un registro pagado falla, el sistema SHALL conservar el registro pendiente marcado como fallido con la causa, SHALL responder al webhook con error para que Stripe reintente, y SHALL notificar al administrador por Telegram con nombre, teléfono, monto y el identificador de la sesión de Stripe.

#### Scenario: Error de base de datos al finalizar
- **WHEN** falla la creación del usuario después de un pago confirmado
- **THEN** el webhook responde con un estado de error, el registro pendiente conserva la causa y el administrador recibe la notificación con el identificador de Stripe

#### Scenario: Reintento exitoso de Stripe
- **WHEN** Stripe reintenta el webhook después de un fallo transitorio
- **THEN** el registro se finaliza normalmente y no se duplica el usuario ni el pago
