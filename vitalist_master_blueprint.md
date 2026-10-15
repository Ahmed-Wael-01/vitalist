# VITALIST: Master Technical Specification & System Blueprint

> **Version:** 1.0.0  
> **Target Audience:** AI Developer Agents & Software Engineering Teams  
> **Project Name:** Vitalist  
> **Description:** A deterministic, bilingual (English and Arabic) clinical simulation and OSCE evaluation platform for medical students and interns.

---

## 1. System Overview & Core Philosophy

**Vitalist** provides medical students and interns with realistic hospital encounter simulations. Unlike traditional LLM-based applications that rely on unpredictable AI grading, Vitalist implements a **100% deterministic evaluation engine based on objective OSCE (Objective Structured Clinical Examination) standards**. 

* **The AI's Role:** Strictly limited to acting as the dynamic patient persona via constrained system prompts. It has zero participation in scoring or grading.
* **The Engine's Role:** Evaluates trainee inputs using concept dictionaries, text normalization, window-scanning negation detection, protocol order checking, and rule-based diagnostic gates.

---

## 2. UI Color Palette & Design Tokens

Vitalist uses a specialized 7-color teal/mint palette optimized for low-fatigue clinical software interfaces:

```css
:root {
  --color-dark-surface: #04222B;  /* App Header, Sidebar & Modal Backdrops */
  --color-card-surface: #0A3D4A;  /* Containers, Panels & Dark Borders */
  --color-muted-teal:   #10606F;  /* Secondary Buttons, Table Headers, Muted Badges */
  --color-primary-brand:#1D8B94;  /* Primary CTA Buttons, Active Tabs & Key Interactive Elements */
  --color-accent-teal:  #4FB8B4;  /* Highlighting, Status Badges & Progress Indicators */
  --color-mint-light:   #98D8D0;  /* Hover States, Success Icons & Section Headlines */
  --color-canvas-light: #E2F4F0;  /* Workspace Background, Text Surfaces & Light Cards */
}
```

---

## 3. Database Schema (Entity-Relationship Blueprint)

```mermaid
erDiagram
    USER ||--o{ SESSION : participates
    SCENARIO ||--o{ SESSION : instantiates
    SCENARIO ||--|{ CONCEPT_DICTIONARY : defines
    SCENARIO ||--o{ PANEL_ACTION : contains

    SESSION ||--o{ CHAT_MESSAGE : logs
    SESSION ||--o{ DIAGNOSTIC_COMMITMENT : requires
    SESSION ||--o{ ACTION_LOG : triggers
    SESSION ||--o{ PROTOCOL_STEP_STATE : tracks
    SESSION ||--o{ CHECKLIST_EVALUATION : updates
    SESSION ||--o{ SCORE_RESULT : generates

    USER {
        int id PK
        string name
        string role "student / intern"
        string preferred_language
    }

    SCENARIO {
        int id PK
        string title
        string specialty
        string gold_standard_diagnosis
        string required_protocol "e.g., SPIKES / SBAR_Handoff"
    }

    SESSION {
        int id PK
        int user_id FK
        int scenario_id FK
        datetime start_time
        datetime end_time
        float final_score
        boolean is_diagnostic_gate_passed
        string status "active / completed"
    }

    CONCEPT_DICTIONARY {
        int id PK
        int scenario_id FK
        string concept_id "e.g., symptom_memory_loss"
        string osce_domain "History / Exam / Reasoning / Management"
        text english_terms "JSON array of synonyms"
        text arabic_terms "JSON array of normalized Arabic variants"
    }

    PANEL_ACTION {
        int id PK
        int scenario_id FK
        string action_code "e.g., EXAM_PUPILS / HISTORY_MEDS"
        string category "PhysicalExam / History / Handoff"
        text payload_media_url "Photo or observation card URL"
        boolean is_relevant "True = reward, False = penalty"
    }

    CHAT_MESSAGE {
        int id PK
        int session_id FK
        string sender "doctor / patient"
        text raw_text
        text normalized_text
        datetime timestamp
    }

    DIAGNOSTIC_COMMITMENT {
        int id PK
        int session_id FK
        text committed_differential
        text reasoning_notes
        datetime committed_at
    }

    ACTION_LOG {
        int id PK
        int session_id FK
        int panel_action_id FK
        boolean was_gate_unlocked
        datetime timestamp
    }

    PROTOCOL_STEP_STATE {
        int id PK
        int session_id FK
        string step_code "e.g., SPIKES_S_SETTING / SBAR_RECOMMENDATION"
        boolean is_completed_in_order
        datetime completed_at
    }

    CHECKLIST_EVALUATION {
        int id PK
        int session_id FK
        string concept_id
        string status "AFFIRMED / NEGATED / NOT_MENTIONED"
        boolean is_satisfied
        datetime satisfied_at
    }

    SCORE_RESULT {
        int id PK
        int session_id FK
        string osce_domain "History / Exam / GateReasoning / Handoff / FinalDiagnosis"
        float points_earned
        float points_max
        float penalty_applied
    }
```

---

## 4. System Architecture & Data Flow (DFD Level 1)

```
[ Trainee ] ───┬──► (1.0 Free-Text Chat) ──────────► [ 2.0 Bilingual Normalizer ]
               │                                                  │
               │                                                  ▼
               │                                     [ 3.0 NegEx Negation Window ]
               │                                                  │
               │                                                  ▼
               │                                     [ 4.0 Concept & OSCE Matcher ] ──┐
               │                                                                      │
               ├──► (5.0 Working Differential) ───► [ 6.0 Diagnostic Gate Engine ] ────┤
               │                                                                      │
               ├──► (7.0 Action Button Click) ────► [ 8.0 Action & Panel Engine ] ────┼──► [ 10.0 Automated OSCE ]
               │                                                                      │    [    Scoring Engine   ]
               └──► (9.0 Final Handoff Form) ─────► [ Gold Standard Key Comparison ] ─┘            │
                                                                                                     ▼
                                                                                          [ Score & OSCE Report ]
```

---

## 5. Core Engine Specifications

### A. Bilingual Normalization Layer
Before keyword matching, input text passes through cleaning functions:
* **Arabic Normalization:** Strip diacritics (*Tashkeel*), remove elongation (*Tatweel*), unify Alef forms (`أ`, `إ`, `آ` $\rightarrow$ `ا`), and unify Ta Marbuta (`ة` $\rightarrow$ `ه`).
* **English Normalization:** Convert characters to lowercase, strip punctuation, and tokenize.

### B. Negation Handling Algorithm (NegEx Window Scan)
When a concept keyword is identified, the backend scans a surrounding context window ($\pm 3$ tokens) for negation markers:
* **English Negation Triggers:** `["no", "not", "denies", "without", "never", "free of", "absent"]`
* **Arabic Negation Triggers:** `["لا", "ليس", "ليست", "بدون", "ينفي", "تنفي", "عدم", "غير", "ما عنده", "بلا"]`
* **Evaluation Output:** `AFFIRMED` (positive credit), `NEGATED` (credit if ruling out is required), or `NOT_MENTIONED`.

### C. "Commit First" Diagnostic Gate
* **Enforcement:** Trainees cannot open physical exam or diagnostic test panels until they submit their working differential and reasoning in a modal form.
* **Logging:** Stores differential data in `DIAGNOSTIC_COMMITMENT` and sets `is_diagnostic_gate_passed = TRUE`.

---

## 6. Automated OSCE Scoring Rubric

$$\text{Final OSCE Score} = \left( \frac{\sum \text{Earned OSCE Points}}{\text{Total Station Points}} \times 100 \right) - \text{Safety Penalties}$$

| OSCE Domain | Weight (%) | Trigger Method | Deterministic Evaluation Mechanism |
| :--- | :--- | :--- | :--- |
| **History Taking & Communication** | 25% | Chat Input | Concept matching + NegEx window scan for symptoms, onset, ADL impact, rule-outs, and communication protocol order (e.g., SPIKES). |
| **Diagnostic Gate Reasoning** | 15% | Modal Form | Evaluates whether valid differential hypotheses were committed *prior* to unlocking physical exams or lab panels. |
| **Physical Exam & Observations** | 20% | Action Panel | Rewards selecting relevant physical examination buttons and identifying findings in revealed photos/observation cards. |
| **Final Diagnosis Accuracy** | 25% | Final Form | Direct string/key match against scenario's gold-standard primary diagnosis. |
| **Handoff & Disposition** | 15% | Final Form | Evaluates post-encounter disposition (admission unit, night nurse watch-list warnings) against case rubric. |
| **Safety & Harmful Actions** | -5% to 0% | Action Panel | Deducts points for ordering contraindicated tests, invasive unnecessary procedures, or harmful medications. |

---

## 7. User Journey & Navigation Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Trainee as Trainee (Doctor)
    participant UI as Vitalist Frontend Interface
    participant Norm as Normalization & NegEx Engine
    participant Matcher as OSCE Concept Matcher
    participant DB as Database & Scenario Rules
    participant ScoreEngine as Deterministic Score Engine

    %% Phase 1
    rect rgb(240, 248, 255)
        note over Trainee, ScoreEngine: Step 1: Scenario Selection & History Taking
        Trainee->>UI: Selects case & reads triage brief
        Trainee->>UI: Types chat questions (Arabic / English)
        UI->>Norm: Send raw chat text
        Norm->>Norm: Normalize text (strip diacritics, unify letters, lowercase)
        Norm->>Norm: Scan context window (+/- 3 words) for negation triggers
        Norm->>Matcher: Send clean concept + AFFIRMED/NEGATED status
        Matcher->>DB: Scan Concept Dictionary & OSCE Station Checklist
        DB-->>Matcher: Log matched OSCE checklist items
    end

    %% Phase 2
    rect rgb(255, 250, 240)
        note over Trainee, ScoreEngine: Step 2: "Commit First" Diagnostic Gate
        Trainee->>UI: Attempts to open Physical Exam / Lab Panel
        UI-->>Trainee: Prompt: "Commit working differential diagnosis first"
        Trainee->>UI: Submits working differential & clinical notes
        UI->>DB: Record commitment & set `is_diagnostic_gate_passed = True`
        DB-->>UI: Unlock physical exam & lab panels
    end

    %% Phase 3
    rect rgb(240, 255, 240)
        note over Trainee, ScoreEngine: Step 3: Action Panel & Physical Observations
        Trainee->>UI: Clicks "Perform Exam / Inspect Findings"
        UI->>DB: Log panel action & check relevancy
        DB-->>UI: Return hidden observation photos / clinical findings card
    end

    %% Phase 4
    rect rgb(255, 240, 245)
        note over Trainee, ScoreEngine: Step 4: Final Diagnosis, Handoff & OSCE Scorecard
        Trainee->>UI: Fills Final Diagnosis & Handoff Form
        UI->>ScoreEngine: Submit final diagnosis key & handoff notes
        ScoreEngine->>DB: Fetch logged states, gate timestamps & gold standard
        ScoreEngine->>ScoreEngine: Compute OSCE score: (Earned / Total) * 100 - Penalties
        ScoreEngine->>DB: Save session scorecard
        ScoreEngine-->>UI: Display OSCE Scorecard & Guideline References
    end
```

---

## 8. Implementation Guidelines for AI Builders

1. **Single-File or Modular React Architecture:** Build components using Tailwind CSS and the exact hex tokens provided in Section 2.
2. **State Isolation:** Ensure the Patient AI prompt state is strictly separated from the evaluation reducer/scoring functions.
3. **Strict Determinism:** Never use probabilistic LLM scoring for checklists. All evaluations must pass through the `CONCEPT_DICTIONARY`, `NegEx` window scan, and OSCE rubric formulas.