// Deterministic offline fallback for the patient persona: replies keyed by the first matched concept.
import { findConceptMentions } from '../engine/matcher.js';

export function scriptedReply(scenario, doctorText, language) {
  const replies = new Map(scenario.scriptedReplies.map((r) => [r.conceptId, r]));
  const mentions = findConceptMentions(doctorText, scenario.conceptDictionary.filter((c) => replies.has(c.conceptId)));
  const reply = mentions.length ? replies.get(mentions[0].id) : scenario.defaultReply;
  return reply?.[language] || reply?.en || (language === 'ar' ? 'لست متأكداً، هل يمكنك إعادة السؤال؟' : "I'm not sure, could you ask that another way?");
}
