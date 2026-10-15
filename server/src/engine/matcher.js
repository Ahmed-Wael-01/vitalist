// Concept & OSCE matcher (DFD 4.0).
// Finds dictionary concepts in free text and tags each occurrence AFFIRMED / NEGATED.

import { segment, tokenize } from './normalize.js';
import { negationStatus } from './negex.js';

/** Turn a concept's EN/AR synonym lists into token patterns (longest first). */
export function compilePatterns(englishTerms = [], arabicTerms = []) {
  const seen = new Set();
  const patterns = [];
  for (const term of [...englishTerms, ...arabicTerms]) {
    const tokens = tokenize(term);
    const key = tokens.join(' ');
    if (tokens.length && !seen.has(key)) {
      seen.add(key);
      patterns.push(tokens);
    }
  }
  return patterns.sort((a, b) => b.length - a.length);
}

function findOccurrences(tokens, pattern) {
  const hits = [];
  for (let i = 0; i + pattern.length <= tokens.length; i++) {
    let ok = true;
    for (let j = 0; j < pattern.length; j++) {
      if (tokens[i + j] !== pattern[j]) {
        ok = false;
        break;
      }
    }
    if (ok) hits.push(i);
  }
  return hits;
}

/**
 * Scan text for a list of matchable items ({ id, englishTerms, arabicTerms }).
 * @returns {Array<{ id, status: 'AFFIRMED'|'NEGATED', pos: number }>} every occurrence, ordered by position.
 */
export function findMentions(text, items) {
  const segments = segment(text);
  const mentions = [];
  for (const item of items) {
    const patterns = item.patterns ?? compilePatterns(item.englishTerms, item.arabicTerms);
    for (const { tokens, offset } of segments) {
      const claimed = new Set(); // avoid a short synonym re-matching inside a longer one
      for (const pattern of patterns) {
        for (const start of findOccurrences(tokens, pattern)) {
          if (claimed.has(start)) continue;
          for (let k = start; k < start + pattern.length; k++) claimed.add(k);
          mentions.push({
            id: item.id,
            status: negationStatus(tokens, start, start + pattern.length),
            pos: offset + start,
          });
        }
      }
    }
  }
  return mentions.sort((a, b) => a.pos - b.pos);
}

/** Convenience wrapper for scenario concept dictionaries. */
export function findConceptMentions(text, concepts) {
  return findMentions(
    text,
    concepts.map((c) => ({ id: c.conceptId, englishTerms: c.englishTerms, arabicTerms: c.arabicTerms })),
  );
}

/** Does a mention status satisfy the concept's expectation? */
export function satisfies(expectedStatus = 'ANY', status) {
  if (status === 'NOT_MENTIONED') return false;
  return expectedStatus === 'ANY' || expectedStatus === status;
}
