# AGENTS.md — ukl-back (NestJS 11 + Prisma + MySQL)

## Quick start

```bash
npm install
# ensure .env has DATABASE_URL pointing to a MySQL instance
npx prisma migrate deploy          # apply existing migrations
npm run prisma:seed                 # creates admin@mail.com / user@mail.com
npm run start:dev                   # http://localhost:3000, Swagger at /docs
```

## Commands

| Script | Purpose |
|---|---|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Build to `./dist` |
| `npm run start:prod` | Run built app from `dist/main` |
| `npm run lint -- --fix` | ESLint + Prettier |
| `npm test` | Unit tests (`*.spec.ts` in `src/`) |
| `npm run test:e2e` | E2E tests (`test/*.e2e-spec.ts`) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:cov` | Unit tests with coverage |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate:dev` | Create & apply a new migration |
| `npm run prisma:migrate:deploy` | Apply pending migrations (CI/prod) |
| `npm run prisma:seed` | Seed DB using `tsx prisma/seed.ts` |
| `npm run prisma:studio` | Launch Prisma Studio |

## Architecture

- **`src/`** — source root, NestJS modules with standard structure (controller, service, module, dto/, entities/)
- **`prisma/schema.prisma`** — single data model (MySQL via `DATABASE_URL` env var)
- **`src/main.ts`** — entrypoint: CORS (origin from env), global ValidationPipe (whitelist + transform), Swagger at `/docs`
- **`src/app.module.ts`** — root module; imports ConfigModule (global), ScheduleModule, PrismaModule (global), AuthModule, ProductModule, CategoryModule, OrderModule
- **`src/prisma/prisma.module.ts`** — global module, exports `PrismaService` everywhere without re-import
- **`src/auth/`** — JWT auth (7d expiry, secret from `JWT_SECRET` env or `'dev-secret'`); register (admin/customer), login
- **`src/product/`** — products + SKUs + inventory; images uploaded to Cloudinary
- **`src/order/`** — checkout, payment proof upload, status transitions, PDF receipt generation, scheduled auto-cancel (every 1 min, expires unpaid orders after 1h)
- **`src/cloudinary/`** — image upload service (configured via `src/helper/cloudinary.config.ts`)
- **`src/helper/`** — `RolesGuard`, `Roles` decorator, JWT strategy is in `src/auth/strategies/` (the `src/helper/jwt-strategy.ts` is unused)
- **`src/bcrypt/`** — `BcryptService` is a stub; real bcrypt usage is inline in `AuthService`

## Notable quirks

- **Two JWT strategy files exist**: the active one is `src/auth/strategies/jwt.strategy.ts`. The file `src/helper/jwt-strategy.ts` is orphaned.
- **Import style inconsistency**: most modules use relative imports (`../prisma/prisma.service`), but `auth.service.ts` uses absolute `src/prisma/prisma.service`. Prefer relative when adding new files.
- **`BcryptService`** at `src/bcrypt/` is empty — bcrypt is called directly, not through the service.
- **Swagger plugin** in `nest-cli.json` enables `classValidatorShim` — DTO decorators (`@IsString`, etc.) are reflected into OpenAPI spec.
- **Admin routes** use `@UseGuards(AuthGuard('jwt'), RolesGuard)` + `@Roles('ADMIN')`. Customer routes use `@UseGuards(AuthGuard('jwt'))` alone.
- **PrismaService extends PrismaClient** directly (no `onModuleInit`/`$connect` call — auto-connects on first query via lazy connect).
- **`.env` contains real Cloudinary credentials** — do not commit or expose.

## Seeds

| Email | Password | Role |
|---|---|---|
| admin@mail.com | admin12345 | ADMIN |
| user@mail.com | user12345 | CUSTOMER |

Run `npm run prisma:seed` to apply.
