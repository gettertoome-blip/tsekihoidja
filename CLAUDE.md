# CLAUDE.md

## Project

Web app deployed automatically to a cloud platform (Railway, unless told otherwise) from the `main` branch of this GitHub repo.

## Rules

- **Database:** PostgreSQL, available only through the `DATABASE_URL` environment variable. Do not set up a local database or a local server.
- **Receipt images:** stored in PostgreSQL, never on disk.
- **Portability:** keep the code portable; no Railway-specific code.
- **Before every push:** run `npm run build` to make sure the app builds.
- **After each finished task:** commit and push to GitHub.
