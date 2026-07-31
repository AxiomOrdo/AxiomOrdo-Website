# AOPDF Production Verification Checklist

> LEGAL REVIEW REQUIRED BEFORE PAID ACTIVATION

Record the candidate branch, candidate SHA, merged SHA, preview URL, production
deployment ID, verifier, UTC time and evidence link for every checked item.

## Candidate

- [ ] `npm ci` succeeds from the AOPDF lockfile without lifecycle generation.
- [ ] Typecheck, lint, unit, browser, responsive and accessibility suites pass.
- [ ] Static export contains only admitted routes and assets.
- [ ] `npm audit --audit-level=high` passes.
- [ ] CodeQL passes on the exact candidate SHA.
- [ ] The hardening matrix contains exactly 54 governed cases.
- [ ] No secret, credential, customer document or generated fixture is committed.
- [ ] Worktree is clean.

## Preview

- [ ] Preview resolves `/aopdf`, `/aopdf/tools`, every admitted tool, `/limits`
  and all three legal routes.
- [ ] CSP contains no `unsafe-inline` or `unsafe-eval` in `script-src`.
- [ ] Next.js flight payloads are externalized and the remaining static inline script hash matches the exact export.
- [ ] `worker-src 'self' blob:` permits the generated PDF worker.
- [ ] `nosniff`, `no-referrer`, COOP, CORP and Permissions Policy are present.
- [ ] Native save and browser fallback wording are accurate.
- [ ] Network capture shows no document bytes or document-derived values.
- [ ] Analytics custom events are received using only the governed allowlist.
- [ ] All nine workflows are manually verified against the candidate SHA.

## Production

- [ ] Merge only the verified candidate.
- [ ] Deploy the exact merged SHA.
- [ ] Confirm deployment SHA before smoke testing.
- [ ] Smoke every admitted route and one representative workflow.
- [ ] Inspect production headers again.
- [ ] Scan deployment errors and analytics failures after smoke testing.
- [ ] Lock the evidence record before updating a milestone status.
