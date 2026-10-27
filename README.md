# Tšekihoidja (Receipt Keeper)

Web app for storing receipts digitally so they can be found quickly later (e.g. for a warranty claim).
Next.js (App Router) + TypeScript, Tailwind CSS, Prisma and PostgreSQL. UI language: Estonian.

## Environment variables

| Variable       | Required | Description                                                        |
| -------------- | -------- | ------------------------------------------------------------------ |
| `DATABASE_URL` | yes      | PostgreSQL connection string                                       |
| `DEMO_MODE`    | no       | `true` (default) or `false`. See "Demo mode" below                 |
| `PORT`         | no       | Port to listen on (set automatically by most hosting platforms)    |

Copy `.env.example` to `.env` for local use. Never commit `.env`.

## Scripts

- `npm run build` – `prisma generate && next build`
- `npm start` – `prisma migrate deploy && next start` (applies migrations, listens on `PORT`)
- `npm run db:seed` – idempotent demo data seed

## Demo mode

`DEMO_MODE` defaults to `true`. While it is on:

- the login page shows the demo credentials,
- the upload step offers sample receipt images,
- the "Käivita aegumiskontroll kohe" button is available,
- on first start, if the database has no households, the demo household "Tamme pere" is seeded.

**To turn demo mode off**, set `DEMO_MODE=false` in your hosting platform's environment variables and
redeploy. The demo credentials, sample receipts and expiry button are then unreachable, and the manual
expiry endpoint returns 404. Individual users can also hide the demo UI in their own browser from the
settings, but only the environment variable disables it on the server.

## Automatic deletion

Receipts are deleted permanently (images included) once their "Säilita kuni" date has arrived.
The server checks on startup and then every day at 03:15 (`node-cron`, started from `instrumentation.ts`).
In demo mode the settings page has a "Käivita aegumiskontroll kohe" button that runs the check
immediately for your own household only. An optional setting (off by default) shows a notice on the
home page for receipts deleted within 30 days, with a link to extend the retention date.

## Notes

- Receipt images are stored in PostgreSQL (`Bytes`), never on disk. Images are resized client-side to
  about 1600 px and limited to 5 MB.
- The mock extractor in `lib/extract.ts` does no real OCR; it returns realistic sample data.
- The sample receipts in `public/samples/` are static demo assets.
