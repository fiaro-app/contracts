# Changelog

Todos los cambios relevantes de `@fiaro-app/contracts`. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versionado según [SemVer](https://semver.org/lang/es/) (ver "Versionado" en el README).

## [Sin publicar]

## [0.1.0] - 2026-09-23

### Agregado
- Paquete publicado solo como ES module (compilado con `tsdown`), con tipos y source map. Requiere Node 24 o superior y `zod` ^4.6.5 como *peer dependency*.
- Tipos base en `common`: `IdSchema`, `CopAmountSchema`, `PositiveCopAmountSchema`, `CopTotalSchema`, `PhoneSchema`, `MobilePhoneSchema`, `NationalIdSchema`, `BusinessDateSchema`, `TimestampSchema`, `WeekdaySchema`, `DateRangeSchema`, textos, paginación (`PageQuerySchema`, `paginated`) y errores (`ErrorCodeSchema`, `ApiErrorSchema`).
- Funciones de entrada: `toColombianE164`, `normalizeNationalId`, `toBusinessDate`.
- Helper de endpoints: `defineEndpoint`, `buildPath` y los tipos `EndpointParams`, `EndpointRequestBody`, `EndpointParsedBody`, `EndpointResponse`, `PathParams`.
- Endpoints de sistema: `GET /health` y `GET /mobile/version`, con `compareAppVersions`.
- Enums y entidades del dominio: `User`, `Tenant`, `Subscription`, `Lender`, `NonWorkingDay`, `Membership`, `Portfolio`, `Client`, `Loan`, `CollectionAssignment`, `CollectionVisit`, `Payment`, `PaymentReversal`, `DailySettlement` y `Notification`.
