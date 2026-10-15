// NegEx window scan (Blueprint §5.B).
// When a concept is found, the ±3 tokens around it are scanned for negation triggers.
// Scope stops at sentence boundaries (handled by segmentation) and at pseudo-terminators like "but".

import { tokenize } from './normalize.js';

export const WINDOW_SIZE = 3;

export const ENGLISH_NEGATION_TRIGGERS = [
  'no', 'not', 'non', 'denies', 'without', 'never', 'free of', 'absent',
  // Contracted forms after apostrophe stripping
  'dont', 'doesnt', 'didnt', 'isnt', 'wasnt', 'hasnt', 'havent',
];

export const ARABIC_NEGATION_TRIGGERS = [
  'لا', 'ليس', 'ليست', 'بدون', 'ينفي', 'تنفي', 'عدم', 'غير', 'ما عنده', 'بلا',
];

// Words that close a negation's scope: "no fever but cough" must not negate cough.
export const SCOPE_TERMINATORS = ['but', 'however', 'although', 'except', 'لكن', 'بس', 'الا'];

const compile = (phrases) => phrases.map(tokenize).filter((t) => t.length);

const NEGATION_PATTERNS = compile([...ENGLISH_NEGATION_TRIGGERS, ...ARABIC_NEGATION_TRIGGERS]);
const TERMINATOR_TOKENS = new Set(compile(SCOPE_TERMINATORS).map((t) => t.join(' ')));

function containsSequence(haystack, needle) {
  outer: for (let i = 0; i + needle.length <= haystack.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

/**
 * Determine whether a concept occurrence at tokens[start, end) is negated.
 * @returns {'AFFIRMED' | 'NEGATED'}
 */
export function negationStatus(tokens, start, end, windowSize = WINDOW_SIZE) {
  // Left window: walk back up to windowSize tokens, stopping at a terminator.
  const before = [];
  for (let i = start - 1; i >= 0 && before.length < windowSize; i--) {
    if (TERMINATOR_TOKENS.has(tokens[i])) break;
    before.unshift(tokens[i]);
  }
  // Right window
  const after = [];
  for (let i = end; i < tokens.length && after.length < windowSize; i++) {
    if (TERMINATOR_TOKENS.has(tokens[i])) break;
    after.push(tokens[i]);
  }
  const negated = NEGATION_PATTERNS.some(
    (pattern) => containsSequence(before, pattern) || containsSequence(after, pattern),
  );
  return negated ? 'NEGATED' : 'AFFIRMED';
}
