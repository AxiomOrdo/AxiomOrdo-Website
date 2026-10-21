# Sejda → AOPDF V3 Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` for a subsequently authorized execution packet. Steps use checkbox syntax. This document proposes future work; it does not authorize implementation, commits, deployment, or commercial activation.

**Goal:** Turn the ChatGPT comparison into a dependency-gated roadmap that improves task discovery and professional document preparation while preserving browser-local processing.

**Architecture:** Reuse the admitted tool registry, worker execution, PDF operations, download controls, and existing assurance workspace. Add navigation and page-workspace improvements around those interfaces. Qualify new operations individually before admitting them or allowing a composer to execute them.

**Tech Stack:** Existing Next.js, React, TypeScript, pdf-lib, PDF.js, browser workers, Node test runner and Playwright. No dependency addition is authorized by this plan.

**Spec:** ChatGPT text titled “Sejda vs AOPDF: What we should borrow, improve and build”, visible in VS Code as `Untitled-1`. Text was recovered from the editor's unsaved-document backup; no `.pen` design was found. The source remains unmodified. Its product recommendations inform this roadmap; its capability and maturity claims require reconciliation.

## Packet boundary

- packet_name: AOPDF-V3-ROADMAP-DISCOVERY
- lifecycle_stage: DISCOVERY
- status: PROPOSED
- Objective: produce this roadmap only.
- Allowed write scope: this plan file.
- Bounded read scope: the matching editor backup; AO-PDF tool registry, tool routes, workspace, operation entry points, release gates and commercial foundation in the two identified local copies; official Sejda pages.
- Planning checkout: `AOPDF-DOCUMENT-ASSURANCE-V1`, clean detached HEAD `e54b2b6851cf8eac3ba05ce371bdd23b758c5f84` before this document was added.
- Comparison checkout: `AxiomOrdo-Website`, clean `main` at `116adf975617240273277ece69c41152799b6a7e` during inspection.
- Implementation checkout and exact candidate SHA must be established by M3.0. Do not implement on the detached planning checkout by default.

## Global constraints

- One objective and exactly one lifecycle stage per packet. All required dependencies must be PROVEN before execution.
- Preserve the existing release gate: M1 verification is required before subsequent milestone work starts. The inspected record says `M1_STATUS = IMPLEMENTED-UNVERIFIED`; a different current record must be located and verified if one exists.
- Local source presence, registry admission, passing tests, deployed behavior and customer readiness are separate states.
- Preserve admission, worker timeout/cancellation, memory ceilings, metadata, filename and download behavior. Payment must not bypass engineering limits.
- Preserve deterministic governed output: explicit stable ordering, SHA-256 hashing, no random UUIDs, no current-time evidence timestamps, no hidden persistence.
- Source documents and intermediate document bytes stay in memory for the proposed workspace and composer. Existing disclosed session-local history must be assessed before changing retention claims.
- No new runtime authority, schemas, obligations, trace artifacts, verdicts, acceptance records, production imports or dispatch in this DISCOVERY packet.
- Any later admission of new operations or authoritative outputs requires its own explicitly authorized PROMOTION packet.
- Business/compliance outputs must use the shared trace family under `contracts/v1` when applicable. A local processing summary must not be presented as authenticity, certification, admissibility or a complete business outcome.
- Preserve Sejda's intellectual-property boundaries: independently developed code and correctly licensed dependencies; no copied code, branding or assets.
- OCR, Office conversion, full text editing/forms authoring, server uploads and accounts are excluded from the immediate delivery sequence.
- No commit, push, PR, merge, issue change or deployment is authorized.

## Corrected baseline and reuse map

Both inspected copies declare **13 tools**, rather than the source's nine. This is source inspection, not runtime or production verification.

| Source proposal | Inspected source | Planning decision |
| --- | --- | --- |
| Tool directory and task URLs | `components/tools/tools-grid.tsx`, `app/tools/page.tsx`, `app/tools/[slug]/page.tsx` | Extend existing category navigation and static task routes; add search rather than rebuilding the directory. |
| Shared workspace | `components/tools/tool-workspace.tsx` | Extend the existing workspace; assess thumbnail and selected-page interaction separately. |
| Merge/split/rotate/delete | `lib/pdf/operations.ts` | Reuse admitted operations. Arbitrary reorder and selected-page rotation need separate capability assessment. |
| Watermark/page numbers | Already in `lib/pdf-tools.ts` and `governance/tool-limits.ts` | Assess enhancements; do not count these as new tools. |
| Professional assurance | Inspect, compare, evidence-manifest and redact are declared | Reuse only within existing limits; do not duplicate or broaden their authority. |
| Metadata, Bates numbering, bookmarks | Not declared in the inspected tool registry | Candidates for individual qualification, not confirmed absent from every source file. |
| Compression | Existing optimize operation explicitly excludes image recompression | Preserve that limitation; stronger compression is a separate licence/fidelity qualification. |
| Saved workflows | Session-local history exists; reusable workflow execution was not established | Qualify composer and recipe persistence separately. |
| Paid tiers | Disabled commercial foundation exists | Reuse foundation only after external dependencies are proven; activation remains separate. |

Relevant source paths above are relative to `apps/aopdf/`.

## Review focus

1. Invalid, encrypted or unsupported PDFs: reject before mutation, retain source selection and show a bounded error.
2. Empty/invalid page selections and drag/keyboard ordering: stable page identities, predictable order and at least one output page where required.
3. Large inputs, cancellation and stale worker results: retain prior valid state, dispose preview resources and reject results from obsolete jobs.
4. Saved recipes with unknown operations or incompatible versions: reject before processing; do not silently skip steps or load arbitrary code.
5. Network and retention: check document bytes, names, extracted text, hashes and previews against telemetry/network boundaries; assess session storage, denied-storage behavior and resource cleanup separately.

These checks belong in the qualification packet owning each behavior. Do not add implementation-mirroring tests merely for this plan.

## Milestone sequence

Every row below is a proposed packet with one lifecycle stage. EXECUTION, QUALIFICATION and PROMOTION remain separate.

| Order | Packet / stage | One objective | Required predecessor and completion gate |
| --- | --- | --- | --- |
| 1 | M3.0 — Baseline and reuse audit / DISCOVERY | Establish the authoritative candidate and exact existing capability map. | Source is available. Gate: resolve nine-versus-thirteen, checkout provenance, existing tests/licences and current M1 evidence; identify reuse versus true gaps. |
| 2 | M1-Q — Existing release qualification / QUALIFICATION | Establish whether the current release satisfies its existing M1 requirements. | M3.0 identifies exact candidate and governing record. Gate: existing complete evidence record verified, or report BLOCKED with exact missing checks; no gate edits. |
| 3 | M3.1-E — Discovery and navigation / EXECUTION | Improve access to admitted tools. | M3.0 and M1-Q proven. Gate: searchable existing catalogue, direct task links, useful related tools/help, clear limitations and keyboard operation. |
| 4 | M3.1-Q — Navigation qualification / QUALIFICATION | Verify the navigation change against the exact candidate. | M3.1-E source complete. Gate: targeted route/search/accessibility/browser checks; existing routes and tool registry unchanged. |
| 5 | M3.2-D — Page-workspace design / DISCOVERY | Specify shared page identities, previews and selection without expanding operation authority. | M3.1-Q proven. Gate: exact component/interface map, memory policy, supported actions and gap list. |
| 6 | M3.2-E — Page-workspace implementation / EXECUTION | Implement the approved thumbnail and selection experience using admitted operations. | M3.2-D and required operation support proven. Gate: accessible thumbnails/selection, source-output separation and resource cleanup; unsupported reorder/rotation actions remain unavailable. |
| 7 | M3.2-Q — Page-workspace qualification / QUALIFICATION | Verify interactions, cancellation and resource limits. | M3.2-E source complete. Gate: keyboard/touch behavior, large inputs, errors, stale results, preview fidelity and privacy checks on the exact candidate. |
| 8 | M3.3 — One professional operation / QUALIFICATION | Establish feasibility, licence compatibility, output fidelity and determinism for one candidate. | M3.0 identifies a real gap. Start with metadata editing or Bates numbering; one operation per packet. Gate: bounded qualification result and exact remaining implementation scope. |
| 9 | M3.3-E / EXECUTION; then M3.3-Q / QUALIFICATION; then M3.3-P / PROMOTION | Implement, verify, then admit that single operation in three distinct packets. | Each packet requires its predecessor proven. Gate: explicit admission authority, matching validation and registry/limit changes confined to the promotion scope. |
| 10 | M3.4-D — Workflow-composer design / DISCOVERY | Define chaining semantics and recipe compatibility for admitted operations. | M3.2-Q and all required operation promotions proven. Gate: operation sequence, preflight rules, failure behavior and explicit persistence policy. |
| 11 | M3.4-E — Workflow-composer implementation / EXECUTION | Implement one approved document-pack chain. | M3.4-D proven. Initial chain: merge → selected-page preparation supported by admitted operations → existing page numbers → existing watermark → download. Bates is optional only after promotion. |
| 12 | M3.4-Q — Workflow-composer qualification / QUALIFICATION | Verify the chain and recipe behavior end to end. | M3.4-E source complete. Gate: step failure exposes no partial final result, source/prior valid result remain intact, unsupported recipes reject, limits apply at every step and cumulative memory is bounded. |
| 13 | M3.5-D — Commercial packaging / DISCOVERY | Define Free, Task Pass, Pro and Business packaging around proven demand and capabilities. | Technical capability map proven; demand is separately assessed. Gate: proposed entitlement matrix and external dependency inventory; no approved prices or activation claims. |
| 14 | M3.5-Q — Commercial qualification / QUALIFICATION | Verify configured billing, authentication, database recovery, legal inputs and entitlements. | Every external dependency proven. Gate: real end-to-end session, purchase, pass expiry, webhook/idempotency, cancellation and tenant tests; no document-derived durable usage data. |
| 15 | Release-P — Release or commercial activation / PROMOTION | Promote one explicitly authorized, qualified candidate. | Exact source, CI, deployment authority and applicable technical/commercial gates proven. Gate: candidate-bound promotion and live verification under a separately authorized packet. |

The numbered sequence is dependency order, not calendar dates. Row 9 names three separate future packets; it grants no combined-stage authorization. A technical release and commercial activation require separate promotion packets if both are requested.

## Immediate next packet: M3.0

**Stage:** DISCOVERY. **Objective:** establish the baseline and reuse map. No runtime changes.

**Read scope:** the selected checkout's `apps/aopdf/lib/pdf-tools.ts`, `governance/tool-limits.ts`, `governance/release-gates.md`, `governance/document-assurance-v1.md`, `governance/commercial-foundation.md`, existing tool routes/workspace, PDF/worker entry points and directly matching tests. CI collection is limited to explicit candidate-bound evidence collection. Do not search unrelated repositories or corpus files.

- [ ] Resolve which checkout/branch/SHA owns the next change and record its Git state; preserve the detached planning copy and any unrelated work.
- [ ] Reconcile all 13 declared slugs against implementation entry points and existing tests; record source presence separately from successful verification.
- [ ] Map source recommendations to reuse, UX enhancement, new operation, deferred capability or blocked authority change.
- [ ] Locate the current M1 record and determine whether it supersedes the inspected unverified record. If proof is incomplete, report BLOCKED for further execution.
- [ ] Map exact allowed files for M3.1 and identify the existing validation commands covering catalogue filtering, direct URLs and privacy behavior.
- [ ] Identify protected/authority-bearing paths and dependencies for later operations, composer reports and commercial activation; keep them outside M3.1 scope.
- [ ] Return the dependency table and one next packet. Do not alter release status or create acceptance/evidence/trace artifacts as a shortcut.

**Deliverable:** a reviewable capability/reuse assessment and a bounded M3.1 specification if gates are proven. Otherwise return the exact blockers and the qualification work required to resolve them.

## Proposed implementation file map

| Work | Existing files to reuse | Proposed additions or changes, subject to the owning packet |
| --- | --- | --- |
| Navigation | `components/tools/tools-grid.tsx`, `app/tools/page.tsx`, `app/tools/[slug]/page.tsx`, `lib/pdf-tools.ts` | Search/filter behavior in the existing grid; related-tool/help UI using registry metadata. No new admission. |
| Page workspace | `components/tools/tool-workspace.tsx`, `lib/assurance/pdfjs-browser-loader.ts`, `lib/pdf/page-ranges.ts`, existing worker and download interfaces | Focused page-preview and selection components, with interfaces settled by M3.2-D. Do not split/refactor unrelated workspace behavior. |
| Professional operations | `lib/pdf/operations.ts`, relevant admitted interfaces | Qualification determines operation-specific files. Registry, limits or schema promotion is separately authorized. |
| Composer | Existing PDF/worker execution and `lib/assurance/workspace-history.ts` | Focused recipe/preflight/execution modules and UI, with exact interfaces settled by M3.4-D. No new manifest schema or trace family. |
| Validation | `tests/pdf-operations.test.ts`, `tests/worker-client.test.ts`, `tests/browser/workflows.spec.ts` and directly relevant existing tests | Extend the tests owning the changed behavior. New test files are proposals until the execution specification names them. |

This is a milestone roadmap, not an execution-ready specification for unqualified interfaces. Each execution packet needs exact signatures, state transitions and meaningful verification commands from its preceding discovery/qualification.

## Verification policy

- Documentation packet: inspect source coverage, stage separation, dependency classifications and diff scope. No runtime tests are required for this plan alone.
- Future code packets: targeted tests first; then applicable typecheck/lint/build. Broaden only for runtime, registry, contract or release-gate changes, under the owning packet.
- Browser qualification: test supported browsers and existing engineering limits. Verify document-byte network behavior and retention independently from local processing.
- Final merge-readiness: GitHub CI for the exact candidate when applicable. Local checks alone do not establish deployment or production readiness.

## Dependency table

| Dependency | Classification | Consequence |
| --- | --- | --- |
| Source comparison text | PROVEN | Read from the matching editor backup. |
| Local planning checkout and clean starting state | PROVEN | Plan may be saved here; detached SHA is known. |
| Declared registry and reusable source components | PROVEN | 13 slugs and existing routes/workspace observed; runtime status remains separate. |
| Official Sejda task/workflow/processing references | PROVEN | Official pages inspected; UX lesson is a product inference. |
| Authoritative implementation checkout and candidate | UNCLEAR | Resolve in M3.0 before implementation. |
| Complete candidate-bound M1 verification | UNCLEAR | Inspected status is unverified; further milestone execution is blocked until proof is established. |
| New-operation fidelity/licence/determinism proof | MISSING | Individual qualification required before implementation/admission. |
| Reusable recipe/composer specification | MISSING | M3.4-D required. |
| Authority for a new processing manifest or trace changes | MISSING | No such output authorized by this plan; assess reuse and shared trace requirements separately. |
| Live commercial configuration, approved pricing/legal inputs | MISSING | No activation authorized; absence is asserted by the inspected foundation record, not verified against external accounts. |

## Benchmark references

Sejda exposes a searchable task catalogue and task-specific routes. Reusing those interaction patterns for AOPDF is the plan's design inference. [Official catalogue](https://www.sejda.com/)

Sejda describes chaining tasks and saving the sequence for later files. This supports the composer concept; it does not prove AOPDF can execute that chain. [Official workflows](https://www.sejda.com/workflows)

Sejda distinguishes server processing on the web from local desktop processing. AOPDF browser-local privacy claims require their own network and retention checks. [Official product description](https://www.sejda.com/)

Sejda advertises a one-time seven-day web pass and recurring plans. This informs packaging options only; it establishes no AOPDF price or entitlement. [Official pricing](https://www.sejda.com/upgrade)

## Closeout

- files_changed: this plan only.
- checks_executed: editor/source identification; bounded source and Git inspection; official benchmark lookup; roadmap self-review and document diff checks.
- blockers: none for writing this proposed plan; implementation blockers are listed in the dependency table.
- assumptions: the user's “Sejda vs AOPDF” clarification identifies the open comparison text; the opened AO-PDF folder is the planning-document destination, not established implementation authority.
- scope_compliance: documentation-only change; source comparison and runtime files preserved.
- authority_created: none.
- false_complete_controls: 13 declared tools are not claimed production-verified; M1 gate preserved; commercial and trace authority remain gated; no calendar commitment.
- next_authorized_packet: none beyond this plan; proposed next packet is M3.0 DISCOVERY.
- final git status: `?? docs/superpowers/plans/2026-10-13-sejda-aopdf-v3.md`; no other changes, detached HEAD unchanged.
