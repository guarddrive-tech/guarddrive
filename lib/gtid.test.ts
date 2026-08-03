import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateGtid, normalizeGtid, isValidGtid, decodeGtid, GTID_LENGTH } from './gtid.ts';

// Local re-implementation of the bit-packing, used only to construct
// deliberately-invalid structural vectors (wrong version / wrong issuer).
// Kept independent of lib/gtid.ts's internals so these tests exercise the
// public decode/validate contract, not a shared private helper.
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const VERSION_BITS = 2n;
const ISSUER_BITS = 32n;
const RANDOM_BITS = 96n;
const TOTAL_BITS = VERSION_BITS + ISSUER_BITS + RANDOM_BITS;
const GUARDDRIVE_ISSUER_CODE = 0x47445630n;

function encode(version: bigint, issuer: bigint, random: bigint): string {
  const value = (version << (ISSUER_BITS + RANDOM_BITS)) | (issuer << RANDOM_BITS) | random;
  let out = '';
  for (let shift = TOTAL_BITS - 5n; shift >= 0n; shift -= 5n) {
    out += CROCKFORD_ALPHABET[Number((value >> shift) & 0b11111n)];
  }
  return out;
}

test('generateGtid produces the expected length and character set', () => {
  const gtid = generateGtid();
  assert.equal(gtid.length, GTID_LENGTH);
  assert.equal(gtid.length, 26);
  assert.match(gtid, /^[0-9A-HJKMNP-TV-Z]{26}$/);
});

test('generateGtid output is accepted by isValidGtid', () => {
  assert.equal(isValidGtid(generateGtid()), true);
});

test('normalizeGtid trims whitespace and uppercases', () => {
  const gtid = generateGtid();
  assert.equal(normalizeGtid(`  ${gtid.toLowerCase()}  `), gtid);
});

test('normalizeGtid does not substitute ambiguous characters', () => {
  // "O" must stay "O", not become "0" — ambiguity is rejected, never resolved silently.
  assert.equal(normalizeGtid('o'), 'O');
});

test('isValidGtid rejects disallowed/ambiguous characters (I, L, O, U)', () => {
  const base = generateGtid().slice(0, 25);
  assert.equal(isValidGtid(base + 'I'), false);
  assert.equal(isValidGtid(base + 'L'), false);
  assert.equal(isValidGtid(base + 'O'), false);
  assert.equal(isValidGtid(base + 'U'), false);
});

test('isValidGtid rejects incorrect length', () => {
  const gtid = generateGtid();
  assert.equal(isValidGtid(gtid.slice(0, 25)), false); // too short
  assert.equal(isValidGtid(gtid + '0'), false); // too long
  assert.equal(isValidGtid(''), false);
});

test('isValidGtid rejects an unrecognized structural version', () => {
  const wrongVersion = encode(2n, GUARDDRIVE_ISSUER_CODE, 0n);
  assert.equal(decodeGtid(wrongVersion)?.version, 2n);
  assert.equal(isValidGtid(wrongVersion), false);
});

test('isValidGtid rejects an unrecognized issuer', () => {
  const wrongIssuer = encode(1n, 0x00000001n, 0n);
  assert.equal(decodeGtid(wrongIssuer)?.issuer, 1n);
  assert.equal(isValidGtid(wrongIssuer), false);
});

test('decodeGtid round-trips version/issuer/random exactly', () => {
  const version = 1n;
  const issuer = GUARDDRIVE_ISSUER_CODE;
  const random = 0x123456789abcdefn;
  const gtid = encode(version, issuer, random);
  const decoded = decodeGtid(gtid);
  assert.ok(decoded);
  assert.equal(decoded.version, version);
  assert.equal(decoded.issuer, issuer);
  assert.equal(decoded.random, random);
});

test('decodeGtid returns null for malformed input', () => {
  assert.equal(decodeGtid('not-a-real-gtid!!'), null);
  assert.equal(decodeGtid(''), null);
});

test('generateGtid produces unique values across a reasonable sample', () => {
  const sample = new Set<string>();
  const size = 5000;
  for (let i = 0; i < size; i++) {
    sample.add(generateGtid());
  }
  // Deterministic invariant (no duplicate collisions in this sample size),
  // not a statistical claim about cryptographic entropy strength.
  assert.equal(sample.size, size);
});
