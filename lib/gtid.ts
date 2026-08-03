import { randomBytes } from 'node:crypto';

// GTID (GuardTag Identifier) — GuardDrive's local, spec-following implementation.
// This is an independent re-implementation of the format described in the
// GuardTag Protocol (GTP) spec — it does not import or depend on any UEAP/GTP
// package. See ADR-0001 for the full derivation and the normative ambiguity
// it resolves (spec.md gives the random segment as a range, "80-96b", and
// separately states "26 chars (130 bits)" without reconciling the two; we use
// the high end of the range — 96b — because 2+32+96=130 bits is the only
// value consistent with the spec's own stated 26-char/130-bit length).
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const VERSION_BITS = 2n;
const ISSUER_BITS = 32n;
const RANDOM_BITS = 96n;
const TOTAL_BITS = VERSION_BITS + ISSUER_BITS + RANDOM_BITS; // 130n -> 26 Base32-Crockford chars

export const GTID_LENGTH = Number(TOTAL_BITS / 5n); // 26

// 2-bit field for the *identifier structure* version (distinct from the GTP
// spec/document version, which is not persisted — see ADR-0001).
const GTID_STRUCTURAL_VERSION = 1n;

// 32-bit issuer segment. GuardDrive is the sole issuer in this pilot; there is
// no formal UEAP issuer registry yet, so this is a provisional placeholder
// constant, not a registered value. Not persisted as a separate column — it
// only exists embedded inside the GTID itself, per the corrected schema.
const GUARDDRIVE_ISSUER_CODE = 0x47445630n; // ASCII "GDV0"

const GTID_PATTERN = new RegExp(`^[0-9A-HJKMNP-TV-Z]{${GTID_LENGTH}}$`);

const RANDOM_MASK = (1n << RANDOM_BITS) - 1n;
const ISSUER_MASK = (1n << ISSUER_BITS) - 1n;
const VERSION_MASK = (1n << VERSION_BITS) - 1n;

function encodeStructure(version: bigint, issuer: bigint, random: bigint): string {
  const value = (version << (ISSUER_BITS + RANDOM_BITS)) | (issuer << RANDOM_BITS) | random;

  let out = '';
  for (let shift = TOTAL_BITS - 5n; shift >= 0n; shift -= 5n) {
    const index = Number((value >> shift) & 0b11111n);
    out += CROCKFORD_ALPHABET[index];
  }
  return out;
}

export function generateGtid(): string {
  // Raw CSPRNG bytes are embedded as-is (no modulo reduction on the random
  // segment), so there is no modulo bias: 12 bytes map directly onto the
  // 96-bit random field with no rejection sampling required.
  const randomBits = BigInt('0x' + randomBytes(Number(RANDOM_BITS / 8n)).toString('hex'));
  return encodeStructure(GTID_STRUCTURAL_VERSION, GUARDDRIVE_ISSUER_CODE, randomBits);
}

export function normalizeGtid(input: string): string {
  // Deliberately no Crockford ambiguous-character substitution (o->0, i/l->1):
  // this identifier is treated as security-relevant, so a mistyped/mis-scanned
  // character must fail closed rather than being silently reinterpreted.
  return input.trim().toUpperCase();
}

export interface GtidStructure {
  version: bigint;
  issuer: bigint;
  random: bigint;
}

// Decodes the Base32-Crockford string into its structural fields without
// asserting anything about whether those fields are ones GuardDrive accepts.
// Returns null only for inputs that aren't well-formed Base32-Crockford of
// the expected length (wrong length or disallowed/ambiguous characters).
export function decodeGtid(input: string): GtidStructure | null {
  if (!GTID_PATTERN.test(input)) return null;

  let value = 0n;
  for (const char of input) {
    const index = CROCKFORD_ALPHABET.indexOf(char);
    if (index === -1) return null;
    value = (value << 5n) | BigInt(index);
  }

  return {
    version: (value >> (ISSUER_BITS + RANDOM_BITS)) & VERSION_MASK,
    issuer: (value >> RANDOM_BITS) & ISSUER_MASK,
    random: value & RANDOM_MASK,
  };
}

// Structural validation, not just "regex + length": a GTID is only accepted
// if it also decodes to the structural version and issuer this pilot issues.
// This is intentionally narrower than "any well-formed GuardTag-Protocol
// identifier" — GuardDrive is the sole issuer today, so any other issuer or
// structural version field, even if well-formed Base32-Crockford, is
// rejected rather than silently accepted (fail closed, see ADR-0001).
export function isValidGtid(input: string): boolean {
  const decoded = decodeGtid(input);
  if (!decoded) return false;
  return decoded.version === GTID_STRUCTURAL_VERSION && decoded.issuer === GUARDDRIVE_ISSUER_CODE;
}
