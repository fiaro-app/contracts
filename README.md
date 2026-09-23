# @fiaro-app/contracts

Contratos compartidos de Fiaro: los **schemas de [Zod](https://zod.dev)**, los **tipos** y la **definición de cada endpoint** que usan [`api`](https://github.com/fiaro-app/api), [`mobile`](https://github.com/fiaro-app/mobile) y [`web`](https://github.com/fiaro-app/web).

Es la única fuente de verdad sobre la forma de los datos que viajan entre las apps y la API. Si un campo cambia aquí, TypeScript señala en cada repo el código que hay que ajustar, en lugar de que el error aparezca en producción.

No es una aplicación: es una librería versionada con SemVer que las demás instalan como una dependencia normal.

Repo privado. Software propietario — ver [LICENSE](./LICENSE). Documento de dominio y producto: [api/PRODUCT.md](https://github.com/fiaro-app/api/blob/dev/PRODUCT.md).

---

## Cómo encaja en el proyecto

`contracts` no es un servicio: no se despliega ni recibe peticiones. Es código que cada repo instala como dependencia, igual que `zod`. Las apps siguen llamando directamente a la API por HTTP; lo que comparten es la **descripción** de esas llamadas: qué rutas existen, qué se envía y qué se recibe.

```
Mientras programas                     En producción

   @fiaro-app/contracts                ┌────────┐   HTTP + JSON   ┌─────┐
   ┌────────┼────────┐                 │ mobile │ ──────────────▶ │ api │
   ▼        ▼        ▼                 │  web   │ ◀────────────── │     │
  api     mobile    web                └────────┘                 └─────┘
(se instala como dependencia)       (contracts va compilado dentro de cada uno)
```

### ¿Por qué no escribir las llamadas a mano en cada app?

A mano, cada repo tiene su propia copia de los nombres de campos, las rutas y las validaciones. Si la API renombra un campo, la app sigue compilando y el error aparece en producción (por ejemplo, una cuota que se muestra como `$NaN`). Con el contrato compartido:

- **Un cambio se define en un solo lugar.** Al actualizar la versión de `contracts`, TypeScript marca en `api`, `mobile` y `web` cada línea que hay que ajustar. No se corrige solo, pero el error aparece al compilar, no en el celular de un cobrador.
- **La misma validación en ambos lados.** La app valida el formulario para responder al instante y la API vuelve a validar porque nunca puede confiar en lo que recibe. Las dos usan el mismo schema, así que sus reglas no pueden contradecirse.
- **Tipos y autocompletado** (`Loan`, `Client`...) en cada repo, sin redefinirlos.
- **Rutas y métodos sin errores de tipeo**: cada endpoint se declara una sola vez.

Lo que **no** hace: no reemplaza la llamada HTTP, no contiene lógica de negocio (el saldo y la mora los calcula la API) y no sincroniza nada en tiempo real. Cada repo decide cuándo actualiza la versión del contrato.

## Contenido

| Módulo | Qué exporta |
|---|---|
| `common` | Tipos base: IDs, dinero, teléfono, cédula, fechas, textos, paginación y errores |
| `http` | `defineEndpoint`, `buildPath` y los tipos derivados de cada endpoint |
| `system` | `GET /health` y `GET /mobile/version` (version-gate de la app) |
| `auth` | `User` |
| `tenants` | `Tenant` |
| `subscriptions` | `Subscription` y su estado |
| `lenders` | `Lender`, `NonWorkingDay` |
| `memberships` | `Membership`, roles, `Portfolio` |
| `clients` | `Client` |
| `loans` | `Loan`, frecuencia y estado |
| `collections` | `CollectionAssignment`, `CollectionVisit` y su resultado |
| `payments` | `Payment`, medio de pago, `PaymentReversal` |
| `settlements` | `DailySettlement` (cuadre) |
| `notifications` | `Notification` |

Los módulos replican los de la API (`api/src/modules/*`): el contrato de `loans` está en `src/loans`.

## Instalación

El paquete es privado y vive en GitHub Packages. En el proyecto que lo consume:

```ini
# .npmrc del proyecto (sí se commitea)
@fiaro-app:registry=https://npm.pkg.github.com
```

```ini
# ~/.npmrc global (nunca en el repo): token con permiso read:packages
//npm.pkg.github.com/:_authToken=TU_TOKEN
```

```bash
pnpm add @fiaro-app/contracts zod
```

`zod` se instala aparte porque es una *peer dependency* (ver [decisión 1](#1-zod-es-peer-dependency)).

## Uso

### Validar lo que escribe el usuario

```typescript
import { MobilePhoneSchema, toColombianE164 } from '@fiaro-app/contracts';

const phone = toColombianE164('300 123 4567'); // '+573001234567', o null si no es válido
const result = MobilePhoneSchema.safeParse(phone);
if (!result.success) showError(result.error.issues[0]?.message);
```

### Usar los tipos

```typescript
import { LoanStatusSchema, type Loan } from '@fiaro-app/contracts';

function isOpen(loan: Loan): boolean {
  return loan.status === LoanStatusSchema.enum.ACTIVE;
}
```

### Llamar un endpoint con tipos

```typescript
import { buildPath, endpoints, type EndpointResponse } from '@fiaro-app/contracts';

const endpoint = endpoints.system.mobileVersion;
const response = await fetch(`${API_URL}${buildPath(endpoint.path, {})}`, {
  method: endpoint.method,
});
const version: EndpointResponse<typeof endpoint> = endpoint.response.parse(await response.json());
```

### Mensajes de validación en español

Los mensajes propios del dominio (teléfono, cédula, montos) ya están en español. Para los genéricos de Zod ("demasiado corto", etc.), cada app activa el idioma una vez al arrancar:

```typescript
import { z } from 'zod';

z.config(z.locales.es());
```

La librería no lo hace por su cuenta a propósito (ver [decisión 5](#5-importar-el-paquete-no-tiene-efectos)).

## Estructura

```
src/
├── index.ts          # Único punto de entrada: todo lo que exporta es API pública
├── endpoints.ts      # Registro de todos los endpoints, agrupados por módulo
├── common/           # Tipos base reutilizados por todos los módulos
├── http/             # defineEndpoint, buildPath y tipos derivados
├── system/           # Endpoints de infraestructura
└── <módulo>/         # Uno por módulo de la API
    ├── index.ts
    ├── <entidad>.schema.ts
    └── <módulo>.endpoints.ts   # Se agrega al construir cada funcionalidad
```

## Convenciones

| Tema | Regla |
|---|---|
| Nombres | Schema `LoanSchema` y tipo `Loan` (`z.infer`). Enums: `LoanStatusSchema`, con valores en `MAYÚSCULAS_CON_GUION_BAJO`; se usan como `LoanStatusSchema.enum.ACTIVE` |
| JSON | Claves en `camelCase`. La base de datos usa `snake_case`; Prisma traduce entre ambos |
| Ausencia de valor | En las respuestas, `null` explícito: el campo siempre está presente |
| Requests | `z.strictObject`: rechazan campos desconocidos |
| Respuestas | `z.object`: ignoran campos desconocidos |
| Fechas | `BusinessDateSchema` (`AAAA-MM-DD`) para días de calendario; `TimestampSchema` (ISO 8601 con zona) para instantes |
| Dinero | Pesos colombianos en enteros, sin centavos |
| Teléfono | E.164: `+57` seguido de 10 dígitos |
| IDs | UUID; la API genera UUIDv7 |
| Qué va aquí | Schemas, tipos, endpoints y funciones puras que convierten entrada del usuario al formato del contrato. El formato visual (`$35.000`, `300 123 4567`) vive en cada app |

---

## Decisiones y por qué

### Cómo está empaquetada la librería

#### 1. Zod es *peer dependency*

**Qué:** `zod` está en `peerDependencies` (y en `devDependencies` para compilar y probar), no en `dependencies`.

**Por qué:** los schemas son objetos de Zod que la API y las apps usan con **su propio** Zod (`schema.parse`, `z.infer`, `.extend`). Si la librería trajera su copia, podrían convivir dos versiones distintas en el mismo proyecto: los tipos dejarían de coincidir y verificaciones como `instanceof` fallarían. Como *peer dependency*, cada proyecto instala Zod una sola vez y la librería usa esa copia.

#### 2. Solo ESM, compilado con tsdown

**Qué:** [`tsdown`](https://tsdown.dev) genera `dist/index.js` (ES modules), sus tipos (`index.d.ts`) y el source map. No se publica versión CommonJS. El campo `exports` es la entrada oficial del paquete.

**Por qué:**
- **ESM es el estándar actual de JavaScript** y lo cargan de forma nativa los tres consumidores: la API (`"type": "module"`), Metro en Expo y Next.js. Desde Node 22, incluso el código CommonJS puede cargar ESM con `require()`.
- **Una sola salida es más simple y más segura**: publicar ESM y CommonJS a la vez duplica archivos y puede terminar con dos copias del paquete cargadas en la misma app (*dual package hazard*).
- **`tsdown` es el sucesor mantenido de `tsup`**, que dejó de recibir mantenimiento activo. Lo desarrolla el equipo de Rolldown, el bundler que usa Vite, y ya soporta TypeScript 7.

**A tener en cuenta:** las pruebas de `mobile` corren con Jest, que no transforma por defecto los paquetes ESM de `node_modules`. Cuando mobile empiece a usar el paquete, hay que agregar `@fiaro-app/contracts` a la lista de excepciones de `transformIgnorePatterns`.

#### 3. Solo se publica lo compilado

**Qué:** `"files": ["dist"]`. El paquete contiene `dist/`, `package.json`, `README.md` y `LICENSE`, y nada más.

**Por qué:** quien instala no necesita el código fuente, las pruebas ni la configuración. Publicar solo lo necesario hace el paquete más liviano y evita exponer archivos internos. Se comprueba con `pnpm pack --dry-run`.

#### 4. `sideEffects: false`

**Qué:** declara que importar el paquete no ejecuta nada con efectos.

**Por qué:** le permite al bundler de `web` descartar los schemas que no se usan (*tree shaking*). Es cierto solo gracias al punto 5.

#### 5. Importar el paquete no tiene efectos

**Qué:** la librería no configura nada global (por ejemplo, no llama `z.config()` para el idioma de los mensajes).

**Por qué:** una librería que cambia estado global al importarse sorprende a quien la usa y puede pisar la configuración de la app. Esas decisiones son de cada app (ver "Mensajes de validación en español").

#### 6. Un solo punto de entrada = API pública explícita

**Qué:** todo se exporta desde `src/index.ts`. Lo que no se exporta ahí es interno.

**Por qué:** cada export es una promesa: quitarlo o cambiarlo rompe a quien lo usa. Tener un único lugar hace visible qué es público y qué se puede cambiar libremente.

#### 7. El paquete se valida antes de publicarse

**Qué:** `pnpm check:package` corre [`publint`](https://publint.dev) (revisa `package.json` y `exports`) y [`@arethetypeswrong/cli`](https://github.com/arethetypeswrong/arethetypeswrong.github.io) con el perfil `esm-only` (revisa que los tipos resuelvan en Node ESM y en bundlers). Corre en el CI de cada PR y en `prepublishOnly`, que pnpm ejecuta justo antes de publicar.

**Por qué:** los errores de empaquetado no aparecen en las pruebas de la librería, solo cuando otro proyecto la instala. Estas herramientas los detectan antes.

#### 8. Pruebas de comportamiento y de tipos

**Qué:** Vitest prueba qué acepta y qué rechaza cada schema. Además, `expectTypeOf` y `@ts-expect-error` fijan los tipos públicos, y el `typecheck` los verifica porque incluye los archivos de prueba.

**Por qué:** en una librería de contratos, un cambio de tipos puede romper a los consumidores sin que falle ninguna prueba en tiempo de ejecución. Las pruebas de tipos lo detectan aquí.

#### 9. Source maps y `engines`

**Qué:** se publican `.map` con el código fuente embebido, y `engines.node` declara Node 24 o superior.

**Por qué:** los source maps hacen que un error dentro de la librería apunte a la línea real de TypeScript en el stack trace de la API. `engines` declara Node 24 porque es la LTS actual, la que usan todos los repos y la única con la que se prueba.

#### 10. Herramientas siempre en su última versión compatible

**Qué:** todas las dependencias de desarrollo y las GitHub Actions están en su última versión. La excepción es TypeScript, fijado en `~6.0.3`.

**Por qué:** el proyecto no acumula herramientas viejas. TypeScript 7 (el compilador nativo) ya salió, pero typescript-eslint y TypeDoc todavía no lo soportan (sus rangos llegan a la 6.0), y subirlo rompería el lint y la documentación. Por eso se usa la versión más nueva que funciona con todas las herramientas, igual que en `api` y `mobile`. El `~` impide que una actualización salte a la 6.1 antes de que esas herramientas la soporten. En cuanto lo hagan, se sube a TypeScript 7.

#### 11. SemVer y CHANGELOG

**Qué:** cada versión publicada es inmutable y su número comunica el tipo de cambio (ver [Versionado](#versionado)). `CHANGELOG.md` registra qué cambió en cada una.

**Por qué:** `api`, `mobile` y `web` dependen de una versión concreta. El número indica si actualizar es seguro, y el changelog dice qué ajustar.

### Cómo se definen los contratos

#### 12. JSON en camelCase

**Por qué:** los tipos se usan directamente en TypeScript, donde la convención es camelCase; así no hay que traducir nombres en cada app. La traducción a `snake_case` ocurre en un solo lugar: el esquema de Prisma (`@map`).

#### 13. Dos tipos de fecha, siempre como texto

**Qué:** `BusinessDateSchema` (`2026-09-23`) para días de calendario del negocio y `TimestampSchema` (`2026-09-23T10:15:00-05:00`) para instantes exactos.

**Por qué:** JSON no tiene tipo fecha. Además, convertir un día de calendario a instante introduce errores de zona horaria: el préstamo que empieza "el 23" puede terminar guardado como el 22 si el servidor está en UTC. Un día de calendario nunca se convierte; `toBusinessDate` calcula el día en hora de Colombia a partir de un instante.

#### 14. Dinero en enteros

**Por qué:** los decimales en JavaScript (`0.1 + 0.2 !== 0.3`) producen errores de redondeo en sumas de dinero, y el negocio no maneja centavos. El límite de un registro coincide con una columna `INTEGER` de Postgres. Las sumas grandes, como la cartera total, usan `CopTotalSchema`.

#### 15. Teléfono en E.164

**Qué:** `+57` seguido de los 10 dígitos nacionales. El usuario escribe `300 123 4567` y `toColombianE164` lo convierte.

**Por qué:** es el estándar internacional y el formato que exigen WhatsApp y Twilio para los recordatorios de fase 2. Guardarlo así desde el inicio evita una migración de datos.

#### 16. UUIDv7 y el `id` de la visita como llave de idempotencia

**Por qué:** los UUID se pueden generar en el celular sin conexión. La versión 7 se ordena por fecha, lo que mantiene compactos los índices de Postgres. Como el dispositivo genera el `id` de cada visita, reenviarla después de un corte de señal no la duplica: la API reconoce el mismo `id`.

#### 17. Requests estrictos, respuestas tolerantes

**Qué:** los requests rechazan campos desconocidos; las respuestas los ignoran.

**Por qué:** la app se distribuye como APK y siempre habrá teléfonos con versiones viejas. Si la API agrega un campo a una respuesta, una app vieja debe seguir funcionando: por eso la respuesta tolera lo que no conoce. En cambio, un campo desconocido en un request casi siempre es un error de programación, y conviene que falle en lugar de ignorarse en silencio. El mismo criterio explica por qué `ApiErrorSchema.code` es texto libre: una app vieja no debe romperse al recibir un código de error nuevo.

#### 18. `null` en lugar de campos ausentes

**Por qué:** si un campo siempre está presente, quien lo lee distingue "no tiene valor" (`null`) de "no me lo enviaron" (un error). También simplifica la base de datos, donde una columna es `NULL` o tiene valor.

#### 19. Mapa de endpoints propio

**Qué:** `defineEndpoint` declara método, ruta, body y respuesta una sola vez; la API valida con esa definición y las apps arman sus llamadas con `buildPath` y los tipos derivados.

**Por qué:** evita duplicar rutas y métodos en cada repo. Es un helper propio de pocas líneas porque las librerías de contratos más usadas (ts-rest, oRPC) no contemplan el método `QUERY` que usa la API para búsquedas y reportes.

#### 20. Las entidades son la forma pública, no la tabla

**Qué:** cada `*Schema` de entidad describe lo que la API expone, no la tabla de la base de datos. Por ejemplo, `User` no tiene contraseña, y solo `Membership` y `Notification` llevan `lenderId`, porque son las únicas entidades que una persona puede ver de varios prestamistas a la vez.

**Por qué:** la base de datos puede cambiar (índices, columnas técnicas, `lender_id` en todas las tablas) sin romper el contrato con las apps. Los datos calculados, como el saldo o los días de mora, se agregan en los schemas de respuesta de cada endpoint.

---

## Cómo agregar al contrato

**Un endpoint nuevo** (al construir cada funcionalidad):

1. En `src/<módulo>/<módulo>.schemas.ts`, crea el schema del body con `z.strictObject` (o extiende `PageQuerySchema` si es una búsqueda) y el de la respuesta con `z.object`.
2. En `src/<módulo>/<módulo>.endpoints.ts`, declara el endpoint con `defineEndpoint` y agrégalo al registro de `src/endpoints.ts`.
3. Exporta todo desde el `index.ts` del módulo.
4. Agrega pruebas: un ejemplo válido y los casos que deben fallar.
5. Anota el cambio en `CHANGELOG.md`, en "Sin publicar".

**Un código de error del dominio:** agrégalo a `ErrorCodeSchema` con un comentario que indique su status HTTP.

## Versionado

Mientras la versión sea `0.x`, el MVP todavía no está en producción:

| Cambio | Versión |
|---|---|
| Cualquier cambio en un schema, tipo o endpoint | *minor* (`0.1.0` → `0.2.0`) |
| Correcciones internas o de documentación, sin cambiar el contrato | *patch* (`0.1.0` → `0.1.1`) |

Con el lanzamiento se publica `1.0.0`, y desde ahí se sigue SemVer estricto: *major* para cambios incompatibles, *minor* para agregados y *patch* para correcciones.

**Cambios incompatibles** (exigen *major* desde `1.0.0`):
- Quitar o renombrar un export, un campo o un endpoint.
- Agregar un campo obligatorio a un request.
- Hacer más estricta una validación.
- Agregar un valor a un enum que llega en una respuesta: una app vieja no lo conoce. Si es necesario, se sube también la `minimumSupportedVersion` de la app.

## Publicar una versión

1. Mueve lo que está en "Sin publicar" del `CHANGELOG.md` a una sección con el número y la fecha de la versión.
2. Sube la versión sin crear el tag todavía:
   ```bash
   pnpm version minor --no-git-tag-version
   ```
3. Abre el PR a `dev` y luego de `dev` a `main`, como cualquier cambio.
4. Desde `main`, con la versión ya mergeada, crea y sube el tag:
   ```bash
   git tag v0.2.0 && git push origin v0.2.0
   ```
5. El workflow `.github/workflows/publish.yml` verifica que el tag coincida con `package.json`, compila y publica en GitHub Packages con el `GITHUB_TOKEN` del propio workflow. `prepublishOnly` vuelve a validar el paquete antes de subirlo.
6. Solo la primera vez: en la configuración del paquete en GitHub, da acceso de lectura a los repos `api`, `mobile` y `web` para que su CI pueda instalarlo.

Luego, en cada repo que lo consume: `pnpm add @fiaro-app/contracts@0.2.0`.

## Desarrollo

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Compila en modo watch |
| `pnpm build` | `tsdown` → `dist/` (ESM + tipos + source map) |
| `pnpm typecheck` | `tsc --noEmit`, incluidas las pruebas de tipos |
| `pnpm lint` | ESLint |
| `pnpm test` | Pruebas con Vitest |
| `pnpm test:cov` | Pruebas con reporte de cobertura; falla por debajo del 80 %, el mismo mínimo que exige SonarCloud |
| `pnpm check:package` | `publint` + `attw` sobre el paquete tal como se publicaría |
| `pnpm docs` | Documentación con TypeDoc → `docs/` |

### Probar cambios en `api` o `mobile` sin publicar

El flujo normal es **contrato primero**: definir el contrato de la funcionalidad, publicarlo y luego implementarlo en `api` y `mobile`. Para iterar rápido antes de publicar:

```bash
# en contracts
pnpm dev

# en api o mobile
pnpm link ../contracts
```

`pnpm link` modifica `package.json`, `pnpm-workspace.yaml` y `pnpm-lock.yaml` del proyecto consumidor, y `pnpm unlink` no revierte todos esos cambios. Antes de commitear allá, restaura los archivos e instala la versión publicada:

```bash
git checkout -- package.json pnpm-workspace.yaml pnpm-lock.yaml && pnpm install
```

## Ramas y flujo de trabajo

- `dev` es la rama de integración y la rama por defecto: todo PR apunta aquí.
- `main` es producción y la base de los tags de publicación; se actualiza vía PR desde `dev`.
- **PR de funcionalidad** (rama → `dev`): merge por **squash**, un commit por PR.
- **PR de release** (`dev` → `main`): **merge commit**. Así `main` y `dev` comparten historia y el siguiente release no tiene conflictos; con squash, `main` quedaría con un commit que `dev` no tiene.
- La rama de origen se borra automáticamente al mergear (`dev` nunca, porque es la rama por defecto).

## Repos relacionados

| Repo | Contenido |
|---|---|
| [fiaro-app/api](https://github.com/fiaro-app/api) | Backend (NestJS) |
| [fiaro-app/mobile](https://github.com/fiaro-app/mobile) | App móvil para administradores y cobradores (Expo) |
| [fiaro-app/web](https://github.com/fiaro-app/web) | Panel web (Next.js, fase 2) |
