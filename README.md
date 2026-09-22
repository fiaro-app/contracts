# @fiaro-app/contracts

Schemas de [Zod](https://zod.dev) compartidos entre [`api`](https://github.com/fiaro-app/api), [`web`](https://github.com/fiaro-app/web) y (opcionalmente) [`mobile`](https://github.com/fiaro-app/mobile). No es una aplicación — es una librería versionada con semver que las demás instalan como dependencia normal.

Repo privado. Software propietario — ver [LICENSE](./LICENSE).

## Instalación

Requiere autenticación contra GitHub Packages (paquete privado del scope `@fiaro-app`). En el proyecto que lo consume:

```ini
# .npmrc del proyecto (sí se commitea)
@fiaro-app:registry=https://npm.pkg.github.com
```

```ini
# ~/.npmrc global (nunca en el repo) — token con permiso read:packages
//npm.pkg.github.com/:_authToken=TU_TOKEN
```

```bash
pnpm add @fiaro-app/contracts
```

## Uso

```typescript
import { /* ... */ } from '@fiaro-app/contracts';
```

(Aún no hay schemas publicados — `src/index.ts` está vacío a la espera del primer contrato real.)

## Desarrollo

```bash
pnpm install
pnpm build       # tsup → dist/ (ESM + CJS + .d.ts)
pnpm typecheck
pnpm lint
pnpm test
pnpm docs         # TypeDoc → docs/
```

## Publicar una versión

1. Sube `version` en `package.json` (semver) por PR normal a `dev` → `main`.
2. Desde `main`, con el cambio de versión ya mergeado:
   ```bash
   git tag vX.Y.Z && git push origin vX.Y.Z
   ```
3. El workflow `.github/workflows/publish.yml` valida que el tag coincida con `package.json`, corre typecheck + build y publica en GitHub Packages usando el `GITHUB_TOKEN` del propio workflow — no se necesita un token personal con `write:packages`.
4. La primera vez que se publique una versión, hay que dar acceso de lectura al paquete desde el package settings en GitHub a los repos `api` y `web`, para que su CI pueda instalarlo.

## Ramas y flujo de trabajo

- `dev` es la rama de integración y la rama por defecto — todo PR apunta aquí.
- `main` es producción (y la base de los tags de publicación) — se actualiza vía PR desde `dev`.
- Merge siempre por squash; la rama de origen se borra automáticamente al mergear.
- Sin protección de rama activa (equipo de una persona por ahora).

## Repos relacionados

| Repo | Contenido |
|---|---|
| [fiaro-app/api](https://github.com/fiaro-app/api) | Backend (NestJS) |
| [fiaro-app/web](https://github.com/fiaro-app/web) | Panel de Owner/Lender (Next.js) |
| [fiaro-app/mobile](https://github.com/fiaro-app/mobile) | App del Collector (Expo) |
