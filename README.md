# Vitalist

A bilingual (English / Arabic) clinical simulation and OSCE evaluation platform for medical students and interns. Trainees interview an AI standardized patient, commit to a differential diagnosis, examine and investigate, then submit a final diagnosis and handoff. A **100% deterministic** engine scores the encounter against OSCE rubrics.

See [`vitalist_master_blueprint.md`](./vitalist_master_blueprint.md) for the full specification.

## Stack

| Layer | Tech |
|---|---|
| Database | MongoDB + Mongoose |
| API | Node.js (ES modules) + Express, zod validation |
| Auth | JWT access token (15 min) + rotating refresh token (7 days), both in httpOnly cookies, with refresh-token reuse detection |
| Client | React 19 + Vite + Tailwind CSS v4 + React Router + i18next (full RTL for Arabic) |
| Patient AI | Groq (`groq-sdk`, default model `openai/gpt-oss-120b`) — optional; scripted replies are used when no key is set |

## Getting started

Prerequisites: Node.js 20.6+ and a running MongoDB (default `mongodb://127.0.0.1:27017/vitalist`).

```bash
npm install
cp server/.env.example server/.env   # then fill in the JWT secrets (and optionally GROQ_API_KEY)
npm run seed                          # admin account + demo student + 3 sample cases
npm run dev                           # API on :5000, client on http://localhost:5173
```

Seeded accounts:

| Role | Email | Password |
|---|---|---|
| Faculty (admin) | value of `ADMIN_EMAIL` (default `admin@vitalist.local`) | value of `ADMIN_PASSWORD` |
| Student (dev only) | `student@vitalist.local` | `Student123!` |

Other scripts: `npm test` (engine unit tests), `npm run build` (client production build), `npm start` (API; serves `client/dist` when `NODE_ENV=production`).

## How an encounter is scored

```
chat ──► normalize (EN/AR) ──► NegEx ±3 window ──► concept matcher ──► checklist + protocol order
commit differential ──► gate engine (unlocks Exam / Investigation / Management panels)
panel actions ──► relevance / harm log
final form ──► gold-standard match, disposition, handoff watch-list, SBAR order
                                   └──► OSCE score = (Σ earned / Σ total) × 100 − safety penalties
```

| Domain | Weight | Source |
|---|---|---|
| History taking & communication | 25 | Chat concepts (70%) + SPIKES order (30%) when the case requires SPIKES |
| Diagnostic gate reasoning | 15 | Accepted differentials matched in the committed differential ÷ required count |
| Examination & investigations | 20 | Relevant actions performed − 0.25 × irrelevant actions, ÷ relevant actions |
| Final diagnosis | 25 | Gold-standard synonym present and not negated |
| Handoff & disposition | 15 | Disposition (0.4) + watch-list concepts (0.6) + SBAR order (0.4), renormalized |
| Safety | −5 to 0 | Sum of penalties of harmful actions performed, capped at 5 |

Key rules:
- Protocol steps earn full credit only if every lower-order step was already done (half credit if done out of order).
- Negation never crosses sentence boundaries or words like *but* / *لكن*.
- Each concept has an `expectedStatus`: `ANY`, `AFFIRMED`, or `NEGATED` (for rule-outs).

### Isolation of the AI

`server/src/engine/` is pure and never imports from `server/src/ai/`. The patient model only receives the transcript and the case persona. It never sees the rubric or scoring state, and scoring runs *before* the patient replies.

## Project layout

```
server/src
  engine/        normalize · negex · matcher · evaluator · scoring (pure, unit-tested)
  ai/            patient persona (Groq) + scripted fallback
  models/        User, RefreshToken, Scenario, Session, ChatMessage, ActionLog
  controllers/   auth · scenario · session · admin
  seed/          sample scenarios (dementia, SPIKES bad news, chest pain/SBAR)
client/src
  pages/         Login, Register, Dashboard, Simulation, Scorecard, admin/*
  components/    simulation/* (chat, action panel, gate + final modals), admin/* form fields
  i18n/          en.json, ar.json
```

## Authoring cases

Faculty can create and edit cases at **Faculty → New scenario**. A case has these parts:

- Bilingual brief and patient details.
- The persona prompt for the AI patient. Never put the diagnosis name in it.
- Scripted fallback replies.
- The gold-standard diagnosis and accepted differentials, each with EN and AR synonyms.
- The concept dictionary.
- Panel actions, each marked relevant or harmful with its findings.
- The protocol steps.
- Disposition options.
- Guideline references.

A JSON tab allows bulk editing. The admin API and the seed script use the same validation.
