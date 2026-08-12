# AO-PDF commercial foundation

Lifecycle state: implemented, disabled, and not live-verified.

The foundation supplies durable user/workspace records, workspace-scoped
memberships, configurable entitlements, idempotent operation identifiers,
subscription state, and Stripe event receipts. It does not alter the
browser-local processing boundary. The production static artifact has no upload
or document-processing API.

## Privacy allowlist

Durable usage history accepts only operation ID, workspace ID, actor user ID,
admitted tool, bounded outcome and occurrence time. It rejects additional
properties. In particular, it cannot accept document bytes, filenames,
extracted text, hashes, redaction rectangles, output content, billing metadata
derived from a document, or arbitrary telemetry payloads.

## Tenant boundary

Every subscription and usage event belongs to a workspace. A caller must obtain
the workspace through its authenticated membership; request bodies never select
the authoritative actor or workspace. Database uniqueness protects operation
and webhook idempotency. Stripe customer IDs bind billing events to workspaces,
and older subscription events cannot overwrite a newer recorded state.

## External dependencies

| Dependency | Repository state | Activation requirement |
| --- | --- | --- |
| PostgreSQL | schema and additive migration present | verified database and recovery rehearsal |
| Authentication | NextAuth credential adapter foundation present | secret, server artifact and end-to-end session checks |
| Entitlements | strict JSON configuration parser present | approved plan codes and limits |
| Stripe | checkout, portal and signed webhook foundation present | newly issued keys, verified products/prices and endpoint |
| Legal/pricing copy | absent by design | separate approved source before paid activation |

No external dependency is claimed live by this implementation.

## Dependency and licence decision

| Package | Version | Licence | Use | Decision |
| --- | --- | --- | --- | --- |
| `next-auth` | `4.24.15` | ISC | session and credential adapter foundation | admitted only to disabled server source |
| `@next-auth/prisma-adapter` | `1.0.7` | ISC | durable account adapter | admitted only to disabled server source |
| `@prisma/client` / `prisma` | `6.19.3` | Apache-2.0 | schema, client and migration validation | admitted; pinned below the v7 breaking change |
| `stripe` | `22.5.0` | MIT | checkout, portal and signature verification | admitted only to disabled server source |
| `bcryptjs` | `3.0.3` | BSD-3-Clause | password verification | admitted only to disabled server source |
| `@electric-sql/pglite` | `0.5.4` | Apache-2.0 | apply/rollback test runtime | development-only; not shipped |

The production dependency scan also reports existing dual-licensed `jszip`
under its MIT option, Sharp/libvips runtime binaries under LGPL-3.0-or-later,
and `caniuse-lite` data under CC-BY-4.0. No package was added under a prohibited
licence, and the audit reports no known vulnerabilities at the recorded lockfile.
