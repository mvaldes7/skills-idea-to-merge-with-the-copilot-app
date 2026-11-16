import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatBookmark,
  generateSlug,
  normalizeUrl,
  parseStoredBookmarks,
} from '../src/lib/bookmarks.js';

test('normalizes a URL with or without https to the same value', () => {
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com');
  assert.equal(
    normalizeUrl('https://www.example.com'),
    'https://www.example.com',
  );
  assert.equal(
    normalizeUrl('www.example.com'),
    normalizeUrl('https://www.example.com'),
  );
});

test('recovers empty, corrupted, legacy, and non-array storage values', () => {
  for (const raw of [
    null,
    '',
    '   ',
    '{not-json',
    JSON.stringify({ url: 'https://example.com', slug: 'mona-7fk2' }),
    JSON.stringify(['https://example.com']),
  ]) {
    assert.deepEqual(parseStoredBookmarks(raw), []);
  }
});

test('drops malformed entries without rejecting valid stored bookmarks', () => {
  const raw = JSON.stringify([
    { url: 'https://www.example.com', slug: 'mona-7fk2' },
    { url: 'javascript:alert(1)', slug: 'mona-8abc' },
    { url: 'https://example.org', slug: 'not-a-slug' },
    { url: 42, slug: 'mona-1xyz' },
  ]);

  assert.deepEqual(parseStoredBookmarks(raw), [
    { url: 'https://www.example.com', slug: 'mona-7fk2' },
  ]);
});

test('generates a four-character base62 slug with the mona prefix', () => {
  assert.equal(generateSlug(() => 0), 'mona-0000');
  assert.equal(generateSlug(() => 0.99), 'mona-zzzz');
});

test('formats a saved bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});
