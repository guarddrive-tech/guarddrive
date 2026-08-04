# Proposed fix for `protocols/guardtag/spec.md` (GTID length inconsistency)

Status: **Proposal only — not applied.** GuardDrive does not own or have
write authorization to `symbeon-labs/universal-event-attestation-protocol`.
This document exists so that, if/when someone with authorization over that
repository wants to fix the spec, the diff and rationale are ready to hand
over verbatim. It is not a commit, PR, or patch applied anywhere.

## Problem

`protocols/guardtag/spec.md` (as of the single commit touching this file,
`b73b0a8`, 2026-04-28, "docs: sync GuardTag Protocol spec v0.1 to local UEAP
repo") contains two statements about the GTID that cannot both be exactly
true, plus a worked example inconsistent with either:

1. Bit layout: `[version(2b)][issuer(32b)][random(80-96b)]` — random stated
   as a **range**.
2. Length: `26 chars (130 bits effective entropy recommended)` — a **fixed**
   total.
3. Worked example: `0Z7F-4K2M-9Q1D-8J5S-3H6R-1N2T` — 24 alphanumeric
   characters once the dashes are stripped, not 26.

(1) and (2) only agree when random = 96 bits exactly (2 + 32 + 96 = 130 =
26 × 5 bits/Base32-Crockford char). (3) agrees with neither: 24 chars = 120
bits, which doesn't correspond to any value in the stated 80–96-bit range
for the random field once version+issuer are added (114–130 bits).

## Proposed normative text (replaces the ambiguous range + inconsistent example)

```diff
-**Format:** Base32 (Crockford) string
-**Length:** 26 chars (130 bits effective entropy recommended)
-...
-[version(2b)][issuer(32b)][random(80-96b)]
-...
-Example: GTID: 0Z7F-4K2M-9Q1D-8J5S-3H6R-1N2T
+**Format:** Base32 (Crockford) string
+**Length:** 26 chars, fixed (130 bits total)
+**Bit layout (fixed, not a range):**
+[version(2b)][issuer(32b)][random(96b)]
+Total: 2 + 32 + 96 = 130 bits = 26 Base32-Crockford characters (5 bits/char).
+
+Example (26 chars, ungrouped — canonical form has no separators):
+GTID: A78HB300000000000000000000
+
+If a shorter/variable-length identifier is desired for other reasons (e.g.
+lower-entropy internal test fixtures), it MUST use a distinct, explicitly
+versioned layout — not a "random bits in [80,96]" range against a fixed
+26-char length, which is unsatisfiable outside random=96.
```

## Rationale for choosing 96 (not e.g. 80, or shrinking the total to 24 chars)

- 96 is the only point in the stated 80–96-bit range consistent with the
  spec's own stated fixed 26-char/130-bit length — no other value in the
  range reaches 130 bits once version+issuer are added.
- Shrinking the total to 24 chars (matching the worked example literally)
  would reduce effective entropy from 130 to 120 bits and silently contradict
  the spec's own "130 bits effective entropy recommended" language — worse,
  not better, and it's unclear whether the 24-char example is a typo in the
  *example* or a signal that a real design target is 24 chars; this proposal
  does not attempt to guess which without maintainer input.
- No other public revision, issue, or discussion in the repository
  disambiguates this (single commit touching the file, no related open
  issues visible at review time).

## Additional gaps this proposal flags but does not resolve

The spec is also silent on:

- Whether the canonical string form uses separators (dashes) or not — the
  worked example uses them, but no normative rule requires or forbids them.
- Whether comparison/storage is case-sensitive, or how the Crockford
  ambiguous-character convention (`O`→`0`, `I`/`L`→`1`) should be applied
  during decode, if at all.
- Whether `issuer(32b)` values are drawn from a registry, and if so, where
  that registry lives and how an implementation obtains a code.

GuardDrive's own choices for these (no separators in the canonical form, no
ambiguous-character substitution — reject instead, single hardcoded issuer
placeholder pending a real registry) are documented in
`docs/adr/0001-gtid-format-and-ueap-alignment.md` and `lib/gtid.ts`, but
these are GuardDrive-local defaults, not proposed spec text, since they are
implementation choices rather than things this proposal is confident the
spec must mandate one way or the other.
