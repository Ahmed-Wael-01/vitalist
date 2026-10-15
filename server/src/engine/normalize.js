// Bilingual normalization layer (Blueprint §5.A).
// Every string that reaches the matcher — trainee text AND dictionary terms — goes
// through the same pipeline so both sides are always compared in the same form.

const ARABIC_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭ]/g; // Tashkeel & Quranic marks
const TATWEEL = /ـ/g;
const ALEF_VARIANTS = /[أإآٱ]/g;
const TA_MARBUTA = /ة/g;
const ALEF_MAQSURA = /ى/g;
const ARABIC_INDIC_DIGITS = /[٠-٩]/g;
const ARABIC_LETTER = /[؀-ۿ]/;

// Sentence boundaries limit the negation scope so "No fever. Headache?" doesn't negate headache.
const SENTENCE_BOUNDARY = /[.!?؟;؛\n\r]+/;

export function normalizeArabic(text) {
  return text
    .replace(ARABIC_DIACRITICS, '')
    .replace(TATWEEL, '')
    .replace(ALEF_VARIANTS, 'ا')
    .replace(TA_MARBUTA, 'ه')
    .replace(ALEF_MAQSURA, 'ي')
    .replace(ARABIC_INDIC_DIGITS, (d) => String(d.charCodeAt(0) - 0x0660));
}

export function normalizeEnglish(text) {
  return text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/'/g, ''); // doesn't -> doesnt, patient's -> patients
}

/** Full normalization of a free-text string (no tokenization). */
export function normalizeText(text = '') {
  const cleaned = normalizeEnglish(normalizeArabic(String(text).normalize('NFKC')));
  return cleaned
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isArabicToken(token) {
  return ARABIC_LETTER.test(token);
}

/**
 * Light, deterministic stemming applied identically to text and dictionary terms.
 * Arabic: strip a leading conjunction (و/ف) and definite article forms (ال/بال/لل/كال).
 * English: strip a simple plural "s".
 */
export function stemToken(token) {
  if (isArabicToken(token)) {
    let t = token;
    if (t.length >= 4 && (t.startsWith('و') || t.startsWith('ف'))) t = t.slice(1);
    for (const article of ['بال', 'كال', 'ال', 'لل']) {
      if (t.startsWith(article) && t.length - article.length >= 2) {
        t = t.slice(article.length);
        break;
      }
    }
    return t;
  }
  if (token.length > 3 && token.endsWith('s') && !/(ss|us|is)$/.test(token)) {
    return token.slice(0, -1);
  }
  return token;
}

/** Normalize and tokenize into stemmed tokens. */
export function tokenize(text) {
  const normalized = normalizeText(text);
  return normalized ? normalized.split(' ').map(stemToken) : [];
}

/**
 * Split raw text into sentence segments, each tokenized.
 * Returns [{ tokens, offset }] where offset is the global index of the segment's first token,
 * so positions are comparable across segments (used for protocol ordering).
 */
export function segment(text = '') {
  const segments = [];
  let offset = 0;
  for (const part of String(text).split(SENTENCE_BOUNDARY)) {
    const tokens = tokenize(part);
    if (tokens.length) {
      segments.push({ tokens, offset });
      offset += tokens.length;
    }
  }
  return segments;
}

/** Detect the dominant script of a message — used only to choose the patient's reply language. */
export function detectLanguage(text = '') {
  const arabic = (text.match(/[؀-ۿ]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  return arabic > latin ? 'ar' : 'en';
}
