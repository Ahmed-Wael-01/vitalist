import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeArabic, normalizeText, tokenize, detectLanguage, segment } from '../src/engine/normalize.js';

test('strips Arabic diacritics and tatweel', () => {
  assert.equal(normalizeArabic('صُدَاعٌ'), 'صداع');
  assert.equal(normalizeArabic('ألـــم'), 'الم');
});

test('unifies alef forms and ta marbuta', () => {
  assert.equal(normalizeArabic('إسهال'), 'اسهال');
  assert.equal(normalizeArabic('آلام'), 'الام');
  assert.equal(normalizeArabic('ذاكرة'), 'ذاكره');
});

test('English lowercases and strips punctuation', () => {
  assert.equal(normalizeText("Any CHEST-pain? Doesn't radiate!"), 'any chest pain doesnt radiate');
});

test('tokenize stems Arabic articles and English plurals consistently', () => {
  assert.deepEqual(tokenize('والصداع'), ['صداع']);
  assert.deepEqual(tokenize('Headaches'), ['headache']);
  assert.deepEqual(tokenize('dizziness'), ['dizziness']);
});

test('segment keeps global token offsets across sentences', () => {
  const segs = segment('No fever. Any cough?');
  assert.equal(segs.length, 2);
  assert.equal(segs[1].offset, 2);
});

test('detectLanguage', () => {
  assert.equal(detectLanguage('هل عندك صداع؟'), 'ar');
  assert.equal(detectLanguage('Do you have a headache?'), 'en');
});
