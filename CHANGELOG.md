# Changelog

Todos los cambios relevantes de `@fiaro-app/contracts`. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versionado según [SemVer](https://semver.org/lang/es/) (ver "Versionado" en el README).

## [Sin publicar]

### Agregado
- Código de error de préstamos en `ErrorCodeSchema`: `LOAN_NOT_CANCELABLE` (422: el préstamo ya no está `ACTIVE`, así que no se puede cancelar).

## [0.5.0] - 2026-09-30

### Agregado
- Código de error de clientes en `ErrorCodeSchema`: `CLIENT_NATIONAL_ID_TAKEN` (409: ya existe un cliente con esa cédula para este prestamista).

## [0.4.0] - 2026-09-28

### Agregado
- Códigos de error de gestión de usuario en `ErrorCodeSchema`: `PASSWORD_RESET_CODE_INVALID` (400), `PASSWORD_RESET_CODE_EXPIRED` (400), `CONTACT_EMAIL_NOT_SET` (409), `CONTACT_EMAIL_ALREADY_VERIFIED` (409), `CONTACT_EMAIL_VERIFICATION_CODE_INVALID` (400), `CONTACT_EMAIL_VERIFICATION_CODE_EXPIRED` (400) y `ACCOUNT_DEACTIVATED` (403).

## [0.3.0] - 2026-09-25

### Agregado
- Códigos de error de autenticación en `ErrorCodeSchema`: `SIGN_IN_LOCKED` (429: demasiados intentos fallidos de inicio de sesión con ese celular; se puede reintentar pasado el tiempo de `Retry-After`) y `PASSWORD_TOO_WEAK` (400: la contraseña es demasiado fácil de adivinar, porque está entre las más usadas o se deduce del celular o de la cédula).

## [0.2.0] - 2026-09-25

### Agregado
- Mensajes de validación por idioma: `CONTRACT_MESSAGES` (hoy `es`), `contractMessage(idioma, mensaje)`, `DEFAULT_CONTRACT_LANGUAGE` y los tipos `ContractLanguage` y `ContractMessageKey`. Un idioma nuevo es un archivo de textos en `src/i18n/`; si le falta una clave, no compila.
- Códigos de error de dominio de autenticación en `ErrorCodeSchema`: `INVALID_PHONE` (400), `INVALID_PASSWORD_LENGTH` (400) y `PHONE_ALREADY_REGISTERED` (409).

### Cambiado
- **Los mensajes propios de los schemas ahora son claves, no texto.** `MobilePhoneSchema`, `PhoneSchema`, `NationalIdSchema`, `IdSchema`, `CopAmountSchema`, `PositiveCopAmountSchema`, `BusinessDateSchema`, `TimestampSchema`, `DateRangeSchema` y `AppVersionSchema` rechazan con `contracts.<grupo>.<nombre>` (por ejemplo, `contracts.phone.invalid_mobile`) en lugar del texto en español. Quien muestre `issue.message` debe pasarlo por `contractMessage(idioma, message)`; la API lo traduce al responder según `Accept-Language`.

## [0.1.0] - 2026-09-23

### Agregado
- Paquete publicado solo como ES module (compilado con `tsdown`), con tipos y source map. Requiere Node 24 o superior y `zod` ^4.6.5 como *peer dependency*.
- Tipos base en `common`: `IdSchema`, `CopAmountSchema`, `PositiveCopAmountSchema`, `CopTotalSchema`, `PhoneSchema`, `MobilePhoneSchema`, `NationalIdSchema`, `BusinessDateSchema`, `TimestampSchema`, `WeekdaySchema`, `DateRangeSchema`, textos, paginación (`PageQuerySchema`, `paginated`) y errores (`ErrorCodeSchema`, `ApiErrorSchema`).
- Funciones de entrada: `toColombianE164`, `normalizeNationalId`, `toBusinessDate`.
- Helper de endpoints: `defineEndpoint`, `buildPath` y los tipos `EndpointParams`, `EndpointRequestBody`, `EndpointParsedBody`, `EndpointResponse`, `PathParams`.
- Endpoints de sistema: `GET /health` y `GET /mobile/version`, con `compareAppVersions`.
- Enums y entidades del dominio: `User`, `Tenant`, `Subscription`, `Lender`, `NonWorkingDay`, `Membership`, `Portfolio`, `Client`, `Loan`, `CollectionAssignment`, `CollectionVisit`, `Payment`, `PaymentReversal`, `DailySettlement` y `Notification`.
