# ServiceCall (DTO v27) — SAP Field Service Management

## Field Service Management - Domain Model

Generated on: 2025-12-16 20:29:15 GMT+0000

SAP Field Service Management\nCloud\nPublic

Original content: https://help.sap.com/docs/SAP_FIELD_SERVICE_MANAGEMENT/fsm_data_model?locale=en-US&state=PRODUCTION&version=Cloud

> **Advertencia**: Este documento fue generado desde SAP Help Portal y es una versión incompleta de la documentación oficial del producto. No debe usarse en producción. Más información: https://help.sap.com/docs/disclaimer


## ServiceCall DTO v27

**Descripción**: Llamada de servicio o ticket que indica una solicitud del cliente frente a un problema o servicio.

| Campo | Tipo | Requerido | Restricción / Referencia | Descripción |
|---|---|---|---|---|
| businessPartner | Identifier | Opcional | **BusinessPartner** v16–v25 | Socio de negocio al que pertenece esta llamada de servicio. |
| changelog | String | Opcional | longitud ≥ 1 y ≤ 2147483647 | Registro de cambios de la llamada de servicio (usuario, fecha, campo, valor anterior/nuevo). |
| chargeableEfforts | boolean | Opcional | — | Indica si los esfuerzos son cobrables por defecto. |
| chargeableExpenses | boolean | Opcional | — | Indica si los gastos son cobrables por defecto. |
| chargeableMaterials | boolean | Opcional | — | Indica si los materiales son cobrables por defecto. |
| chargeableMileages | boolean | Opcional | — | Indica si los kilometrajes son cobrables por defecto. |
| code | String | Opcional | longitud ≥ 1 y ≤ 512 | Código de sistema del objeto, normalmente correlaciona con el ID ERP. |
| contact | Identifier | Opcional | **Contact** v12–v18 | Contacto del socio de negocio. |
| dueDateTime | DateTime | Opcional | — | Fecha/hora límite hasta la que debe completarse/cerrarse la llamada. |
| durationInMinutes | Integer | Opcional | — | Duración de la llamada de servicio (minutos). |
| endDateTime | DateTime | Opcional | — | Fecha/hora de fin de la llamada. |


| Campo | Tipo | Requerido | Restricción / Referencia | Descripción |
|---|---|---|---|---|
| equipments | List<Identifier> | Opcional | **Equipment** v14–v24 | Equipos relacionados con esta llamada. |
| incident | Identifier | Opcional | **Incident** v8–v13 | Incidente que pertenece a esta llamada de servicio. |
| leader | Identifier | Opcional | **Person** v15–v25 | Referencia a la persona líder en sitio. |
| objectGroup | Identifier | Opcional | **ObjectGroup** v11–v16 | Grupo de objetos al que pertenece esta llamada. |
| orderDateTime | DateTime | Opcional | — | Fecha/hora de orden de compra de la llamada. |
| orderReference | String | Opcional | longitud ≥ 1 y ≤ 512 | Referencia de la orden de compra. |
| originCode | String | Opcional | longitud ≥ 1 y ≤ 512 | Código del sistema del objeto de origen de la llamada. |
| originName | String | Opcional | longitud ≥ 1 y ≤ 512 | Nombre del sistema del objeto de origen de la llamada. |
| partOfRecurrenceSeries | Boolean | Opcional | — | Indica si es parte de una serie recurrente. |
| priority | String | Opcional | longitud ≥ 1 y ≤ 255; valores definidos en enumeración enumType = SERVICE_CALL_PRIORITY | Prioridad de la llamada (puede depender de SLA/cliente/definiciones internas). |
| problemTypeCode | String | Opcional | longitud ≥ 1 y ≤ 512 | Código del sistema del tipo de problema. |
| problemTypeName | String | Opcional | longitud ≥ 1 y ≤ 512 | Nombre del sistema del tipo de problema. |
| project | Identifier | Opcional | **Project** v8–v13 | Proyecto por el cual se creó la llamada (proceso de release). |
| projectPhase | Identifier | Opcional | **ProjectPhase** v8–v13 | Fase del proyecto por la cual se creó la llamada (proceso de release). |
| remarks | String | Opcional | longitud ≥ 1 y ≤ 2147483647 | Observaciones o notas relacionadas. |


| Campo | Tipo | Requerido | Restricción / Referencia | Descripción |
|---|---|---|---|---|
| resolution | String | Opcional | longitud ≥ 1 y ≤ 2147483647 | Resolución del problema de la llamada. |
| responsibles | Set<Identifier> | Opcional | **Person** v15–v25 | Personas responsables (impacta permisos OWN). |
| salesOrder | Identifier | Opcional | **SalesOrder** v13–v19 | Orden de venta adjunta a esta llamada. |
| salesQuotation | Identifier | Opcional | **SalesQuotation** v12–v18 | Cotización de venta adjunta a esta llamada. |
| serviceContract | Identifier | Opcional | **ServiceContract** v8–v14 | Referencia a contrato de servicio. |
| startDateTime | DateTime | Opcional | — | Fecha/hora de inicio de la llamada. |
| statusCode | String | Opcional | longitud ≥ 1 y ≤ 512 | Código del sistema del estado de la llamada. |
| statusName | String | Opcional | longitud ≥ 1 y ≤ 512 | Nombre del sistema del estado de la llamada. |
| subject | String | Opcional | longitud ≥ 1 y ≤ 512 | Asunto/título corto de la llamada. |
| team | Identifier | Opcional | **Team** v8–v15 | Referencia a un equipo. |
| technicians | Set<Identifier> | Opcional | **Person** v15–v25 | Técnicos asignados (impacta permisos OWN). |
| typeCode | String | Opcional | longitud ≥ 1 y ≤ 512 | Código del sistema del tipo de llamada. |
| typeName | String | Opcional | longitud ≥ 1 y ≤ 512 | Nombre del sistema del tipo de llamada. |

---

**Fuente original**: SAP Help Portal – SAP Field Service Management, Data Model (ServiceCall DTO).

**Notas**: Este markdown resume el contenido del PDF proporcionado y conserva la estructura de campos con sus tipos y restricciones.
