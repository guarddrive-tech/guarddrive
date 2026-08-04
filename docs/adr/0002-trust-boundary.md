# ADR-0002: Trust boundary of the Verification Resolver

Status: Accepted
Date: 2026-08-03

## Context

The `/v/:gtid` resolver (see ADR-0001) renders "IDENTIDADE VERIFICADA" when
a GTID resolves to a `guard_tags` row with `status = 'active'`. Before
Stage 5 (physical provisioning) is authorized, it must be documented,
precisely, what that headline does and does not claim — so no later reader
of the code, the public page, or a support conversation overstates it.

## Decision — what a resolution proves, and what it does not

At this stage, the chain of trust is:

```
Physical NTAG213 tag --[NDEF URL, unauthenticated]--> https://.../v/{GTID} --[DB lookup]--> guard_tags row
```

The NTAG213 in this MVP is exclusively an NDEF/URL carrier (ADR-0001,
Decision 4). It has no RF authentication, no signed UID, no SUN messaging,
no anti-cloning protection. The resolver never claims otherwise.

**A GTID resolving to `active` proves exactly one thing:**

> The GTID that was read out of the URL matches a `guard_tags` row that
> GuardDrive's own records currently mark `active`.

**It does not prove:**

- that the physical tag being scanned is genuine, rather than a clone or a
  copy of the URL printed/encoded elsewhere;
- cryptographic authenticity of the chip;
- physical uniqueness of the NTAG (no anti-cloning mechanism exists yet);
- absence of clonability of the NDEF payload — it is a plain URL, copyable
  by anyone who can read an NFC tag or see the URL;
- optical/physical integrity of the seal itself;
- presence of any vehicle, driver, or asset — no such linkage exists in
  `guard_tags` (ADR-0001, Decision 3).

## Consequence — required phrasing

Internally and in any future documentation, "IDENTIDADE VERIFICADA" must be
understood, and described, as:

> "O GTID consultado corresponde a um registro GuardDrive ativo."

and never as:

> "o selo físico é criptograficamente autêntico."

Any future capability that would justify the stronger claim (RF
authentication, SUN messaging, a real UEAP Read Event, OFP, Trust Score) is
explicitly out of scope until implemented, reviewed, and its own ADR is
written — see the "not implemented" list in the Stage 4.5 report. This ADR
should be revisited (not silently reinterpreted) the day any such capability
is added, since it changes what the headline is entitled to claim.
