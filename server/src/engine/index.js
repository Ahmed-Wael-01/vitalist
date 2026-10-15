// Public surface of the deterministic evaluation engine.
// This module must never import from ../ai — scoring is fully isolated from the patient persona.
export * from './normalize.js';
export * from './negex.js';
export * from './matcher.js';
export * from './evaluator.js';
export * from './scoring.js';
