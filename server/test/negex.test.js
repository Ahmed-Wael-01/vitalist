import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findMentions } from '../src/engine/matcher.js';

const FEVER = { id: 'fever', englishTerms: ['fever', 'high temperature'], arabicTerms: ['حمى', 'حرارة'] };
const COUGH = { id: 'cough', englishTerms: ['cough'], arabicTerms: ['كحة', 'سعال'] };
const statusOf = (text, item = FEVER) => findMentions(text, [item]).map((m) => m.status);

test('affirmed mention', () => {
  assert.deepEqual(statusOf('Do you have a fever?'), ['AFFIRMED']);
});

test('negation before the concept within the window', () => {
  assert.deepEqual(statusOf('Patient denies any fever'), ['NEGATED']);
  assert.deepEqual(statusOf('no high temperature'), ['NEGATED']);
  assert.deepEqual(statusOf("He doesn't have fever"), ['NEGATED']);
});

test('negation after the concept within the window', () => {
  assert.deepEqual(statusOf('fever is absent'), ['NEGATED']);
});

test('negation outside the ±3 window is ignored', () => {
  assert.deepEqual(statusOf('no history of travel and also had a fever'), ['AFFIRMED']);
});

test('negation does not cross sentence boundaries or "but"', () => {
  assert.deepEqual(statusOf('No cough. Fever?'), ['AFFIRMED']);
  assert.deepEqual(statusOf('no cough but fever'), ['AFFIRMED']);
  assert.deepEqual(findMentions('no fever but cough', [COUGH]).map((m) => m.status), ['AFFIRMED']);
});

test('Arabic affirmed and negated with diacritics/article variations', () => {
  assert.deepEqual(statusOf('هل عندك حُمّى؟'), ['AFFIRMED']);
  assert.deepEqual(statusOf('ما عنده حرارة'), ['NEGATED']);
  assert.deepEqual(statusOf('بدون الحرارة'), ['NEGATED']);
  assert.deepEqual(statusOf('ينفي وجود الحمى'), ['NEGATED']);
});

test('multi-word synonym is matched once, not also as its sub-term', () => {
  const item = { id: 'cp', englishTerms: ['chest pain', 'pain'], arabicTerms: [] };
  assert.equal(findMentions('any chest pain?', [item]).length, 1);
});

test('"non" prefix negates (e.g. non-ST elevation)', () => {
  const stemi = { id: 'stemi', englishTerms: ['st elevation myocardial infarction'], arabicTerms: [] };
  assert.deepEqual(findMentions('non-ST elevation myocardial infarction', [stemi]).map((m) => m.status), ['NEGATED']);
});
