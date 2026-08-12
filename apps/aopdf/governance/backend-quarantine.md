# Commercial foundation activation boundary

Status: implemented as disabled source; excluded from the deployed static AO-PDF
package until every activation dependency is verified.

The browser-local PDF product remains a static export. The `server/`, `prisma/`,
account UI, dashboard UI and server-only support modules do not create routes
beneath `app/` and are not copied into the public AO-PDF artifact. Document
bytes, filenames, extracted text, hashes, redaction rectangles and generated
content have no commercial persistence column or accepted usage-event field.

## Activation gates

`AOPDF_COMMERCIAL_ENABLED=true` fails closed unless all of the following exist:

- a verified PostgreSQL `DATABASE_URL`;
- a newly issued `NEXTAUTH_SECRET`;
- an explicit `AOPDF_PLAN_ENTITLEMENTS_JSON` value;
- an explicit `AOPDF_DEFAULT_PLAN_CODE` contained in that plan configuration;
- the additive migration has passed apply and recovery rehearsal;
- the server routes are deployed in a reviewed server-capable artifact rather
  than the current static export.

Billing additionally requires `AOPDF_BILLING_ENABLED=true`, verified Stripe
secret and webhook keys, `AOPDF_STRIPE_PRICE_MAP_JSON`, and an HTTPS
`AOPDF_APP_ORIGIN`. No plan price, price ID, retention promise, or legal term is
provided by repository defaults.

The migration rollback file is recovery evidence, not standing authority to
destroy an activated database. Authentication, billing, database and webhook
behavior must be verified against the exact server artifact before activation.
