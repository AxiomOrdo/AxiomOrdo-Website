# AO-PDF Release Gates

## Status record

```text
M1_STATUS = IMPLEMENTED-UNVERIFIED
M2_STATUS = NOT_STARTED
```

Milestone 2 must not start until the Milestone 1 evidence record is complete,
reviewed and locked with `M1_STATUS = VERIFIED`.

## Milestone 1 evidence

- [ ] Every boundary in `ToolLimits` has automated positive and negative tests.
- [ ] Every stable error is reachable without exposing a raw library error.
- [ ] Worker timeout, cancellation, memory failure and stale-response behavior pass.
- [ ] Native save, picker cancellation and browser fallback paths pass.
- [ ] Telemetry rejects prohibited and unknown fields.
- [ ] Document-byte exfiltration assertion passes in each governed browser.
- [ ] Legal routes are present in the production-equivalent preview.
- [ ] AO-PDF CSP and response headers are inspected on that preview.
- [ ] Exact install, typecheck, lint, unit, browser and static-build jobs pass.
- [ ] Dependency audit and CodeQL pass for the exact candidate SHA.
- [ ] All thirteen workflows are manually verified against that exact SHA.
- [ ] Inspection, comparison and manifest outputs match their V1 schemas.
- [ ] Redaction output passes bounded residual-content verification and independent-reader reopening.
- [ ] The 54-case hardening matrix has linked evidence.
- [ ] Candidate worktree is clean.
- [ ] The exact merged SHA is deployed.
- [ ] Production smoke tests and the post-deployment error scan pass.

## Milestone 2 evidence

- [ ] No visible or metadata occurrence of legacy product naming.
- [ ] Canonical output-name contract passes.
- [ ] Every operation state is reachable, announced and keyboard accessible.
- [ ] Local summaries are excluded from telemetry.
- [ ] Material limitations appear before execution.
- [ ] 320, 375 and 768 pixel layouts pass.
- [ ] Touch targets, reduced motion and live regions pass.
- [ ] Browser-local privacy wording is consistent for every admitted tool.

## Scope lock

Accounts, databases, Stripe, server-side document uploads, cross-session
document history, OCR, Office conversion, password protection or unlocking,
unlisted PDF operations and document-derived telemetry remain outside the live
static product. The four document-assurance operations are bounded by
`document-assurance-v1.md`. Disabled commercial source creates no activation or
production authority; apply `commercial-foundation.md` separately.
