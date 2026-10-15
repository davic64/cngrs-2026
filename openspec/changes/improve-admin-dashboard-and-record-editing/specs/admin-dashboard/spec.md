# Spec Delta

## Purpose

Dar al administrador una vista rápida del estado del congreso: cupos, avance de registros, dinero cobrado y por cobrar, tendencia de registros y distribución por localidad, con accesos directos a los listados.

## ADDED Requirements

### Requirement: Resumen de cupos
El sistema SHALL mostrar los asistentes con registro completado de cada bolsa contra su límite: generales (edad ≤ 29, límite 500) y acompañantes adultos (edad > 29, límite 50), con lugares disponibles. Los conteos MUST coincidir con los que usa el registro para cerrar cupo.

#### Scenario: Cupo parcialmente ocupado
- **WHEN** hay 120 asistentes completados de 29 años o menos y 10 mayores de 29
- **THEN** el panel muestra 120/500 generales y 10/50 acompañantes

#### Scenario: Bolsa llena
- **WHEN** los acompañantes completados llegan a 50
- **THEN** el panel indica 50/50 y cero lugares disponibles

### Requirement: Asistentes por estatus de registro
El sistema SHALL mostrar cuántos asistentes (excluyendo administradores) están en cada estatus de registro: pendiente, parcial y completado.

#### Scenario: Conteo por estatus
- **WHEN** hay 3 pendientes, 5 parciales y 12 completados
- **THEN** el panel muestra 3, 5 y 12 respectivamente y el total 20

### Requirement: Resumen financiero
El sistema SHALL mostrar el ingreso validado (pagos completados), el monto en revisión (pagos en revisión), el monto por cobrar a asistentes parciales o pendientes (precio de pago completo menos lo validado, nunca negativo) y el ingreso validado por método de pago.

#### Scenario: Por cobrar de un parcial
- **WHEN** el pago completo cuesta 1500 y un asistente tiene 500 validados
- **THEN** su saldo por cobrar es 1000 y se suma al total por cobrar

#### Scenario: Sin pagos
- **WHEN** no existe ningún pago
- **THEN** ingreso validado, en revisión y por método muestran 0 sin error

### Requirement: Registros por día
El sistema SHALL mostrar el número de registros creados por día en los últimos 30 días, incluyendo con 0 los días sin registros.

#### Scenario: Día sin registros
- **WHEN** ayer no se registró nadie
- **THEN** la serie incluye ayer con valor 0

### Requirement: Distribución por localidad
El sistema SHALL mostrar las cinco localidades con más asistentes registrados y su número de asistentes.

#### Scenario: Más de cinco localidades
- **WHEN** existen asistentes de ocho localidades
- **THEN** el panel lista sólo las cinco con más asistentes, de mayor a menor

### Requirement: Accesos a listados filtrados
El sistema SHALL permitir ir desde las tarjetas de estatus y de pagos por validar al listado correspondiente; el listado de asistentes MUST poder abrirse filtrado por estatus de registro.

#### Scenario: Tarjeta de parciales
- **WHEN** el admin hace clic en la tarjeta de asistentes parciales
- **THEN** se abre el listado de asistentes mostrando sólo los de estatus parcial

### Requirement: Configuración del dashboard se conserva
El sistema SHALL mantener en el dashboard, sin cambio de comportamiento, la edición de costos y fecha límite, términos y condiciones y plantilla de carta responsiva, así como las listas de pagos por validar y rechazados.

#### Scenario: Actualizar costos
- **WHEN** el admin cambia el precio de pago completo y guarda
- **THEN** la configuración se actualiza y el registro usa el nuevo precio
