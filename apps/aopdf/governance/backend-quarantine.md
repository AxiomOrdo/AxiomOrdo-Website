# Dormant backend quarantine

Status: excluded from the deployed AOPDF static package.

The `server/`, `prisma/`, account UI, dashboard UI and backend-only support
modules are retained only as dormant historical source. They are excluded from
TypeScript compilation and have no route beneath `app/`.

The live AOPDF package must not depend on NextAuth, Prisma, Stripe, bcrypt,
database credentials, API keys, server-side document uploads or persistent
document history.

Re-admitting any quarantined capability requires a separately governed
milestone. It must not be introduced through a Milestone 1 or Milestone 2
change.
