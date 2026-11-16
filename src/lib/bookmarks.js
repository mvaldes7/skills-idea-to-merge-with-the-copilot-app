const SLUG_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SLUG_PATTERN = /^mona-[0-9A-Za-z]{4}$/;

export function normalizeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError('A URL is required.');
  }

  const input = value.trim();
  let candidate;
  if (input.startsWith('//')) {
    candidate = `https:${input}`;
  } else if (/^https?:\/\//i.test(input)) {
    candidate = input;
  } else if (/^[a-z][a-z\d+.-]*:\/\//i.test(input)) {
    throw new TypeError('Only HTTP and HTTPS URLs are supported.');
  } else {
    candidate = `https://${input}`;
  }

  const parsed = new URL(candidate);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new TypeError('Only HTTP and HTTPS URLs are supported.');
  }

  const path = parsed.pathname === '/' ? '' : parsed.pathname;
  return `${parsed.origin}${path}${parsed.search}${parsed.hash}`;
}

export function generateSlug(random = Math.random) {
  let suffix = '';
  for (let index = 0; index < 4; index += 1) {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
      throw new RangeError('Random values must be between 0 and 1.');
    }
    suffix += SLUG_ALPHABET[Math.floor(sample * SLUG_ALPHABET.length)];
  }
  return `mona-${suffix}`;
}

export function parseStoredBookmarks(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((entry) => {
      if (
        entry === null ||
        typeof entry !== 'object' ||
        typeof entry.url !== 'string' ||
        typeof entry.slug !== 'string' ||
        !SLUG_PATTERN.test(entry.slug)
      ) {
        return [];
      }

      try {
        return [{ url: normalizeUrl(entry.url), slug: entry.slug }];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}
