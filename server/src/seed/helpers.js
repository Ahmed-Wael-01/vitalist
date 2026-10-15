// Compact builders for seed scenario data.
export const t = (en, ar = '') => ({ en, ar });

export const concept = (conceptId, osceDomain, label, englishTerms, arabicTerms, expectedStatus = 'ANY') =>
  ({ conceptId, osceDomain, label, englishTerms, arabicTerms, expectedStatus });

export const action = (actionCode, category, label, finding, { relevant = false, harmful = false, penalty = 0, media = '' } = {}) =>
  ({ actionCode, category, label, finding, isRelevant: relevant, isHarmful: harmful, safetyPenalty: penalty, payloadMediaUrl: media });

export const keyed = (key, label, englishTerms, arabicTerms) => ({ key, label, englishTerms, arabicTerms });

export const reply = (conceptId, en, ar) => ({ conceptId, en, ar });
