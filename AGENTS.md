# AGENTS.md — ukl-back (NestJS 11 + Prisma + MySQL)

## Quick start

```bash
npm install
npx prisma migrate deploy          # apply existing migrations
npm run prisma:seed                 # creates admin@mail.com / user@mail.com
npm run start:dev                   # http://localhost:3000, Swagger at /docs
```

## Commands

| Script | Purpose |
|---|---|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Build to `./dist` |
| `npm run start:prod` | Run built from `dist/main` |
| `npm run lint` | ESLint (always `--fix`, includes Prettier) |
| `npm run format` | Prettier format write |
| `npm test` | Unit tests (`*.spec.ts` in `src/`) |
| `npm run test:e2e` | E2E tests (`test/*.e2e-spec.ts`) |
| `npm run test:watch` | Unit tests watch mode |
| `npm run test:cov` | Unit tests coverage |
| `npm run prisma:generate` | Regenerate client after schema changes |
| `npm run prisma:migrate:dev` | Create & apply new migration |
| `npm run prisma:migrate:deploy` | Apply pending migrations (CI/prod) |
| `npm run prisma:seed` | Seed via `tsx prisma/seed.ts` |
| `npm run prisma:studio` | Launch Prisma Studio |

## Architecture

- **`src/main.ts`** — entrypoint: CORS (hardcoded origins, **not** env), global ValidationPipe (whitelist + transform + implicit conversion), Swagger at `/docs`
- **`src/app.module.ts`** — root module; imports ConfigModule (global `.env`), ScheduleModule, PrismaModule (global), AuthModule, ProductModule, CategoryModule, OrderModule
- **`src/prisma/prisma.module.ts`** — `@Global()`, exports `PrismaService` everywhere without re-importing
- **`src/prisma/prisma.service.ts`** — extends `PrismaClient`, implements `OnModuleDestroy` ($disconnect), no explicit `$connect()` (lazy connect on first query)
- **`src/auth/`** — JWT auth (7d expiry, secret from `JWT_SECRET` env or `'dev-secret'`); register (admin/customer), login
- **`src/product/`** — products + SKUs + inventory; images uploaded to Cloudinary (buffer stream or disk path)
- **`src/order/`** — checkout (atomic stock decrement in tx), payment proof upload, status transitions, PDF receipt generation, auto-cancel scheduler (every 1 min, cancels unpaid orders after 1h)
- **`src/cloudinary/`** — image upload service via `src/helper/cloudinary.config.ts` (configured once, guard against hot-reload re-config)
- **`src/helper/`** — `RolesGuard`, `Roles` decorator; JWT strategy lives in `src/auth/strategies/` (the `src/helper/jwt-strategy.ts` is orphaned)
- **`src/bcrypt/`** — `BcryptService` is an empty stub; real bcrypt calls are inline in `AuthService`

## Notable quirks

- **CORS is hardcoded** in `main.ts` (`origin: 'https://ukl-4-fe.vercel.app, http://localhost:3000'`) — not driven by env. The comma-separated string is likely a bug (CORS expects array/string/regex).
- **Two JWT strategy files** — active: `src/auth/strategies/jwt.strategy.ts`; orphaned: `src/helper/jwt-strategy.ts` (uses `ConfigService` for `secret_key`, never wired into any module).
- **Import style inconsistency** — most modules use relative imports (`../prisma/prisma.service`), but `auth.service.ts` uses absolute `src/prisma/prisma.service`. Prefer relative in new files.
- **`npm run lint` always runs `--fix`** — it's baked into the script definition, not optional.
- **Product creation uses a `type` discriminator field** — `CreateProductDto.type` is `'PRODUCT' | 'SKU'`. Similar pattern in update DTO (`'PRODUCT' | 'SKU' | 'STOCK'`). Swagger API docs reflect this via `@ValidateIf`.
- **Order status transitions** (enforced in `order.service.ts`): PENDING→CANCELLED, WAITING_CONFIRMATION→PAID|CANCELLED, PAID→SHIPPED. Cancellation always restores stock. Customer `DELETE` route (`src/order/order.controller.ts:247`) uses `CUSTOMER` role (note: inconsistent casing with admin route which uses `ADMIN`).
- **Swagger plugin** in `nest-cli.json` enables `classValidatorShim` — `@IsString()`, `@IsInt()`, etc. are reflected into OpenAPI schemas automatically.
- **Admin guard pattern**: `@UseGuards(AuthGuard('jwt'), RolesGuard)` + `@Roles('ADMIN')`. Customer-only routes use `@UseGuards(AuthGuard('jwt'))` alone.
- **Seed** uses `tsx prisma/seed.ts` via `prisma:seed` script; creates two users.

## Seeds

| Email | Password | Role |
|---|---|---|
| admin@mail.com | admin12345 | ADMIN |
| user@mail.com | user12345 | CUSTOMER |

Run `npm run prisma:seed` to apply.
