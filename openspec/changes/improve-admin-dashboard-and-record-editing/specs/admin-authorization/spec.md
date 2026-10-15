# Spec Delta

## Purpose

Garantiza que las operaciones administrativas del congreso sólo las pueda ejecutar un administrador autenticado y que las credenciales internas no lleguen a navegadores de visitantes o asistentes.

## ADDED Requirements

### Requirement: Operaciones administrativas exigen sesión admin
El sistema SHALL ejecutar cualquier operación administrativa (editar o eliminar asistentes y pagos, generar contraseñas temporales, gestionar administradores, configuración, agenda, avisos y sede, y métricas del panel) únicamente cuando la sesión pertenezca a un usuario con rol administrador. En cualquier otro caso MUST rechazarla sin leer ni modificar datos.

#### Scenario: Visitante sin sesión
- **WHEN** una petición sin sesión invoca una operación administrativa
- **THEN** el sistema la rechaza como no autorizada y no modifica ni devuelve datos

#### Scenario: Asistente con sesión de usuario
- **WHEN** un asistente con rol `user` invoca editar a otro asistente o generar una contraseña temporal
- **THEN** el sistema la rechaza como no autorizada y no cambia ningún dato

#### Scenario: Administrador
- **WHEN** un administrador invoca una operación administrativa válida
- **THEN** el sistema la ejecuta normalmente

### Requirement: Lecturas públicas permanecen disponibles
El sistema SHALL seguir permitiendo sin sesión admin las lecturas que usan el registro y el panel del asistente: precios y términos, localidades, plantilla de carta responsiva, sede, agenda e información de soporte.

#### Scenario: Registro sin sesión
- **WHEN** un visitante abre el formulario de registro
- **THEN** recibe precios, términos, localidades y plantilla de carta responsiva sin error de autorización

### Requirement: Credenciales de Telegram no se exponen
El sistema MUST NOT incluir el token ni el chat de Telegram en ninguna respuesta pública de configuración. Sólo un administrador autenticado SHALL poder leerlos, para editarlos en el panel de soporte.

#### Scenario: Configuración pública
- **WHEN** el formulario de registro o el panel del asistente pide la configuración
- **THEN** la respuesta no contiene token ni chat de Telegram

#### Scenario: Panel de soporte del admin
- **WHEN** un administrador abre el panel de soporte
- **THEN** ve el token y el chat de Telegram configurados
