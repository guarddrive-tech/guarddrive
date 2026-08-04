# GTID normative test vectors

These vectors are **independent of the DEV/preview fixtures** used in Stage
4 (`A78HB31T5G0TXCCNY9WZVA66XX` and friends) — those remain disposable
preview data, never to be treated as canonical. The vectors below are
deterministic (constructed from fixed version/issuer/random values, not from
`crypto.randomBytes`), so any independent implementation (TypeScript,
Python, mobile, firmware) can reproduce them exactly and compare against the
same expected outputs.

They encode GuardDrive's current pilot parameters: structural version `1`,
issuer `0x47445630` ("GDV0" in ASCII), 96-bit random field, Base32-Crockford
alphabet `0123456789ABCDEFGHJKMNPQRSTVWXYZ` (I, L, O, U excluded), 26-char
fixed length, no separators in canonical form. See
`docs/adr/0001-gtid-format-and-ueap-alignment.md` for why these parameters
were chosen and their provisional status pending upstream spec confirmation.

## 1. Minimum valid GTID (random = 0)

```
version = 1, issuer = 0x47445630, random = 0
GTID: A78HB300000000000000000000
```

Expect `isValidGtid` → `true`.

## 2. Maximum valid GTID (random = all-ones, 2^96 − 1)

```
version = 1, issuer = 0x47445630, random = 0xFFFFFFFFFFFFFFFFFFFFFFFF
GTID: A78HB31ZZZZZZZZZZZZZZZZZZZ
```

Expect `isValidGtid` → `true`.

## 3. Mid-range example (arbitrary non-trivial random value)

```
version = 1, issuer = 0x47445630, random = 0x0123456789ABCDEF
GTID: A78HB30000000028T5CY4TQKFF
```

Expect `isValidGtid` → `true`. Useful as a "typical-looking" fixture that
isn't all-zero or all-one.

## 4. Valid Crockford alphabet (all 32 characters, in order)

```
0123456789ABCDEFGHJKMNPQRSTVWXYZ
```

Every character a well-formed GTID may contain. Notably **absent**: `I`,
`L`, `O`, `U` — any of these appearing in an input string makes it invalid
Base32-Crockford for this scheme (see vector 6).

## 5. Lowercase, normalizable input

```
Input:  a78hb300000000000000000000
normalizeGtid(input) = A78HB300000000000000000000
isValidGtid(normalizeGtid(input)) = true
```

Lowercase is normalizable (case is not semantically meaningful). Internal
whitespace/trim is also normalized (`"  a78hb3...  "` → same result).

## 6. Forbidden characters (ambiguous Crockford letters)

```
A78HB30000000000000000000I   -- contains 'I' -> isValidGtid = false
A78HB30000000000000000000L   -- contains 'L' -> isValidGtid = false
A78HB30000000000000000000O   -- contains 'O' -> isValidGtid = false
A78HB30000000000000000000U   -- contains 'U' -> isValidGtid = false
```

These are **not** normalized/substituted (e.g. `O` is never silently
treated as `0`) — GuardDrive's implementation fails closed on ambiguous
input rather than guessing. See ADR-0001 for why: this identifier is
security-relevant, and a mis-scanned/mistyped character should never be
silently reinterpreted into a different, valid-looking GTID.

## 7. Incorrect length

```
A78HB30000000000000000000    -- 25 chars -> isValidGtid = false
A78HB3000000000000000000000  -- 27 chars -> isValidGtid = false
""                            -- empty   -> isValidGtid = false
```

## 8. Invalid structural version

```
version = 2 (not the accepted structural version 1), issuer = 0x47445630, random = 0
GTID: J78HB300000000000000000000
isValidGtid = false (decodeGtid succeeds structurally, but version != 1)

version = 0, issuer = 0x47445630, random = 0
GTID: 278HB300000000000000000000
isValidGtid = false
```

## 9. Invalid issuer

```
version = 1, issuer = 0x00000001 (not GuardDrive's issuer code), random = 0
GTID: 80000020000000000000000000
isValidGtid = false (decodeGtid succeeds structurally, but issuer != GuardDrive's)
```

GuardDrive is the sole issuer in this pilot (ADR-0001, Decision 2) — there
is no live multi-issuer scenario yet, so any other issuer value is rejected
rather than accepted as "some other valid issuer."

## Reproducing these vectors

Any implementation can regenerate vector N by bit-packing
`(version << 128) | (issuer << 96) | random` into a 130-bit big-endian
integer, then reading off 5-bit groups MSB-first, each mapped through the
Crockford alphabet above (26 groups total, no padding needed since
130 = 26 × 5 exactly). `lib/gtid.ts`'s `decodeGtid`/`isValidGtid` implement
the inverse and the acceptance check respectively, and
`lib/gtid.test.ts` exercises vectors 6–9 programmatically (constructed
in-test, not copy-pasted from DEV fixtures).
