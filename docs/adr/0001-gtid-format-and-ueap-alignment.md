# ADR-0001: GTID format resolution and UEAP alignment scope

Status: Accepted
Date: 2026-08-03

## Context

The GuardDrive Verification Resolver MVP (`GET /v/:gtid`) needed a public,
high-entropy, non-sequential identifier for physical GuardTags (NFC seals).
Rather than inventing a second identity format, GuardDrive evaluated the
external, third-party **UEAP / GuardTag Protocol (GTP)** specification
(`symbeon-labs/universal-event-attestation-protocol`, `protocols/guardtag/spec.md`)
and adopted its identifier layout — `GTID` — as the format for this column,
without adopting any of its other primitives (Registry, OFP, Trust Score,
Read Events, RF authentication, blockchain/ZK anchoring).

This resolver is **not** a UEAP/GTP-compliant implementation. Internally,
it is described as:

> GuardDrive Verification Resolver v0.1 is an experimental implementation
> aligned with the GTID identity model defined by the UEAP GuardTag Protocol.
> It does not claim UEAP/GTP compliance.

This sentence, and the word "UEAP", must never appear in the public-facing
`/v/:gtid` HTML. It is documentation-only (this ADR, code comments, and the
internal report).

## Decision 1 — GTID bit layout resolves a normative ambiguity in the spec

The GuardTag Protocol spec defines the GTID layout as:

```
[version(2b)][issuer(32b)][random(80-96b)]
Length: 26 chars (130 bits effective entropy recommended)
```

The spec gives the random segment as a **range** (80–96 bits) but separately
states a **fixed** total length (26 Base32-Crockford chars = 130 bits). These
two statements only agree at one point in the range:

```
2 (version) + 32 (issuer) + 96 (random) = 130 bits = 26 chars
2 (version) + 32 (issuer) + 80 (random) = 114 bits ≈ 22.8 chars (not integral, doesn't fit 26 chars)
```

Additionally, the spec's own illustrative example
(`0Z7F-4K2M-9Q1D-8J5S-3H6R-1N2T`) has only 24 alphanumeric characters once
dashes are stripped — inconsistent with its own stated 26-char length. This
is a second, independent inconsistency in the spec text, not something we
can resolve by re-reading more carefully.

**Decision:** use the high end of the random range — 96 bits — because it is
the only value in the stated range consistent with the spec's own stated
26-char/130-bit total. This is implemented in `lib/gtid.ts`.

**This is a finding, not a confirmed interpretation.** Before any *real,
physical-tag* GTIDs are generated (as opposed to the DEV/test fixtures
covered by this MVP), this interpretation should be confirmed against
Symbeon Labs / a newer version of the spec. If wrong, the fix is additive:
regenerating affected DEV fixtures, not a breaking schema change, since the
bit layout is not persisted as separate columns (see Decision 2).

## Decision 2 — issuer and version are not persisted as separate columns

The spec's `issuer(32b)` and `version(2b)` fields are encoded **inside** the
generated GTID string itself. GuardDrive does not persist `issuer_code` or
`gtid_version` as separate `guard_tags` columns:

- There is no operational need yet: GuardDrive is the sole issuer in this
  pilot, and there is no live multi-issuer scenario to disambiguate.
  Persisting `issuer_code` separately would create a second source of truth
  that could drift from the value actually embedded in `gtid`.
- The GTP *document* version (as opposed to the identifier's own 2-bit
  structural version field) is recorded here, in this ADR, rather than as a
  database column — it is metadata about the implementation, not about any
  individual row.

If a real multi-issuer or protocol-version-migration need arises, add the
column then, via a new additive migration — not preemptively.

## Decision 3 — `guard_tags` is a GuardDrive-local operational table, not a UEAP Registry

No UEAP on-chain/off-chain Registry exists or is reachable today (the
external repo is an early-stage stub with no deployed Registry, no GTID
issuance service, and mocked proof generation only). `guard_tags` is
GuardDrive's own Postgres table, scoped to exactly:

```
id, gtid, status, activated_at, replaced_by_gtid, created_at, updated_at
```

No asset/vehicle linkage, no RF/OFP columns, no trust-score columns. It must
never be described as a "UEAP Registry" or "Attestation Registry" in any
comment, doc, or UI copy.

## Decision 4 — hardware honesty

NTAG213 in this MVP is exclusively an NDEF/URL carrier. The resolver makes
no claim of NFC cryptographic authentication, secure UID, RF signature,
SUN (Secure Unique NFC) messaging, proof-of-presence, or anti-cloning
protection anywhere — not in code comments, not in the public page, not in
this ADR. The UID is not treated as a credential; the GTID in the URL is
the only identifier the resolver trusts, and it is a public identifier, not
a secret.

## Consequences

- Adding real multi-issuer support, a formal signed Read Event, or a GTP
  document-version migration are all additive changes layered on top of
  this table and this ADR — no existing column needs to change.
- Anyone who later authors "real" physical-tag GTIDs (not DEV fixtures)
  must first re-validate Decision 1 against the current UEAP GuardTag spec
  revision at that time.

## Stage 4.5 addendum — independent re-audit against the live spec source

Decision 1 above was originally derived by reading the spec text during
Stage 2. For Stage 4.5, the spec was re-fetched directly from
`symbeon-labs/universal-event-attestation-protocol` (`protocols/guardtag/spec.md`,
main branch) as the primary source — this ADR was deliberately **not** used
to validate itself. The re-fetch reproduced both inconsistencies
independently:

- `[version(2b)][issuer(32b)][random(80-96b)]` stated as a range, alongside
  a separately stated fixed `26 chars (130 bits effective entropy
  recommended)` total — the two only agree at random=96b.
- The worked example `0Z7F-4K2M-9Q1D-8J5S-3H6R-1N2T` has 24 alphanumeric
  characters once dashes are stripped, not 26.

The repository's commit history for that file (`git log -- protocols/guardtag/spec.md`
via the GitHub API) shows exactly one commit since the file's creation
(2026-04-28, "docs: sync GuardTag Protocol spec v0.1 to local UEAP repo").
No clarifying revision has landed upstream. **Decision 1 therefore still
stands as a provisional, GuardDrive-side resolution — not a normatively
confirmed one** — and continues to require confirmation from Symbeon Labs
before any real physical-tag GTID is generated. A proposed fix for the
external spec text itself (not applied to that repository — out of this
project's scope/authorization) is drafted at
`docs/proposals/ueap-guardtag-gtid-length-fix.md`.

The full SPEC SAYS / IMPLEMENTATION DOES / MATCH-CONFLICT-AMBIGUOUS
comparison table produced for this re-audit is recorded in the Stage 4.5
delivery report, not duplicated here, to avoid this ADR drifting out of
sync with the report as the single source of truth for the comparison.

See also `docs/adr/0002-trust-boundary.md` for what a successful GTID
resolution does and does not prove about the physical seal.
