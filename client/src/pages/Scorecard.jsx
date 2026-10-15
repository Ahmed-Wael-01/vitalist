import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { useLocalized } from '../hooks/useLocalized.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { formatDate, formatDuration, formatNumber } from '../utils/format.js';

function Section({ title, aside, children }) {
  return (
    <section className="card p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-card">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Pass/fail marker: icon + text, never color alone. */
function Mark({ ok, okLabel, failLabel }) {
  return ok
    ? <span className="badge bg-accent/20 text-card"><span aria-hidden="true">✓</span>{okLabel}</span>
    : <span className="badge bg-danger/10 text-danger"><span aria-hidden="true">✕</span>{failLabel}</span>;
}

/** One domain meter: single series, brand fill on a recessive track, value in text ink. */
function DomainMeter({ label, earned, max, lang }) {
  const pct = max ? (earned / max) * 100 : 0;
  const value = `${formatNumber(earned, lang)} / ${formatNumber(max, lang, 0)}`;
  return (
    <div className="group" title={`${label}: ${value}`}>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-card">{label}</span>
        <span className="tabular-nums text-muted">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-canvas" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={earned}>
        <div className="h-2 rounded-full bg-brand transition-all group-hover:bg-muted" style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }} />
      </div>
    </div>
  );
}

export default function Scorecard() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const L = useLocalized();
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const lang = i18n.language;

  useEffect(() => {
    api(`/sessions/${id}/scorecard`).then((r) => setCard(r.scorecard)).catch(setError);
  }, [id]);

  if (error) return <ErrorBanner error={error} />;
  if (!card) return <Spinner />;

  const domains = card.scores.filter((s) => s.osceDomain !== 'Safety');
  const penalty = card.scores.find((s) => s.osceDomain === 'Safety')?.penaltyApplied ?? 0;
  const satisfied = card.history.checklist.filter((c) => c.isSatisfied).length;
  const performed = card.actions.filter((a) => a.performed);
  const missedRelevant = card.actions.filter((a) => a.isRelevant && !a.performed);
  const watchHits = card.handoff.watchlist.filter((w) => w.isSatisfied).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t('score.title')}</p>
          <h1 className="text-xl font-bold text-card">{L(card.scenario.title)}</h1>
          <p className="text-sm text-muted">
            {formatDate(card.endTime, lang)} · {t('score.duration')} <span dir="ltr">{formatDuration(card.startTime, card.endTime)}</span>
          </p>
        </div>
        <Link to="/" className="btn-ghost">{t('score.backToDashboard')}</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <section className="card flex flex-col items-center justify-center bg-card p-6 text-center text-white">
          <p className="text-sm text-mint">{t('score.final')}</p>
          <p className="mt-2 text-6xl font-bold tabular-nums">{formatNumber(card.finalScore, lang)}<span className="text-2xl text-mint">%</span></p>
          {penalty > 0 && (
            <p className="mt-3 rounded-full bg-danger px-3 py-1 text-xs font-semibold">⚠ {t('score.penalty', { points: formatNumber(penalty, lang) })}</p>
          )}
          <p className="mt-4 text-xs text-canvas/70">{t('score.formula')}</p>
        </section>

        <Section title={t('score.breakdown')}>
          <div className="space-y-4">
            {domains.map((d) => (
              <DomainMeter key={d.osceDomain} label={t(`score.domains.${d.osceDomain}`)} earned={d.pointsEarned} max={d.pointsMax} lang={lang} />
            ))}
          </div>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-xs font-semibold text-brand">{t('score.tableView')}</summary>
            <table className="mt-2 w-full text-sm">
              <thead><tr className="text-xs text-muted"><th className="text-start">{t('score.domain')}</th><th className="text-end">{t('score.earned')}</th><th className="text-end">{t('score.max')}</th></tr></thead>
              <tbody>
                {card.scores.map((d) => (
                  <tr key={d.osceDomain} className="border-t border-muted/10">
                    <td className="py-1">{t(`score.domains.${d.osceDomain}`)}</td>
                    <td className="py-1 text-end tabular-nums">{d.osceDomain === 'Safety' ? `−${formatNumber(d.penaltyApplied, lang)}` : formatNumber(d.pointsEarned, lang)}</td>
                    <td className="py-1 text-end tabular-nums">{formatNumber(d.pointsMax, lang, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title={t('score.domains.History')} aside={<span className="text-sm text-muted">{t('score.itemsCovered', { n: satisfied, total: card.history.checklist.length })}</span>}>
          <ul className="divide-y divide-muted/10">
            {card.history.checklist.map((c) => (
              <li key={c.conceptId} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-dark">{L(c.label) || c.conceptId}
                  {c.expectedStatus === 'NEGATED' && <span className="ms-2 text-xs text-muted">({t('score.ruleOut')})</span>}
                </span>
                <Mark ok={c.isSatisfied} okLabel={t(`score.status.${c.status}`)} failLabel={t('score.missed')} />
              </li>
            ))}
          </ul>
          {card.history.protocolSteps.length > 0 && (
            <div className="mt-4">
              <p className="label">{t('score.protocolOrder', { protocol: card.history.protocol.replace('_', ' ') })}</p>
              <ol className="flex flex-wrap gap-2">
                {card.history.protocolSteps.map((s) => (
                  <li key={s.stepCode} className={`badge ${s.isCompletedInOrder ? 'bg-accent/20 text-card' : s.isCompleted ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                    {s.order}. {s.stepCode.split('_').slice(1).join(' ')} — {s.isCompletedInOrder ? t('score.inOrder') : s.isCompleted ? t('score.outOfOrder') : t('score.notDone')}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Section>

        <div className="space-y-5">
          <Section title={t('score.domains.GateReasoning')}>
            {card.gate.committed ? (
              <>
                <p className="label">{t('score.yourDifferential')}</p>
                <p dir="auto" className="mb-3 rounded-md bg-canvas px-3 py-2 text-sm whitespace-pre-line">{card.gate.committedDifferential}</p>
                <p className="label">{t('score.acceptedDifferentials', { n: card.gate.requiredCount })}</p>
                <ul className="flex flex-wrap gap-2">
                  {card.gate.acceptedDifferentials.map((d) => (
                    <li key={d.key} className={`badge ${d.matched ? 'bg-accent/20 text-card' : 'border border-muted/20 text-muted'}`}>
                      {d.matched && <span aria-hidden="true">✓</span>}{L(d.label) || d.key}
                    </li>
                  ))}
                </ul>
              </>
            ) : <p className="text-sm text-danger">{t('score.noCommitment')}</p>}
          </Section>

          <Section title={t('score.domains.FinalDiagnosis')}>
            <dl className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted">{t('score.yourAnswer')}</dt>
                <dd dir="auto" className="font-medium">{card.finalDiagnosis.submitted}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <dt className="text-muted">{t('score.goldStandard')}</dt>
                <dd className="font-medium text-card">{L(card.finalDiagnosis.goldStandard)}</dd>
              </div>
            </dl>
            <div className="mt-3"><Mark ok={card.finalDiagnosis.correct} okLabel={t('score.correct')} failLabel={t('score.incorrect')} /></div>
          </Section>
        </div>
      </div>

      <Section title={t('score.domains.Exam')} aside={<span className="text-sm text-muted">{t('score.actionsSummary', { done: performed.length, missed: missedRelevant.length })}</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs text-white uppercase">
              <tr>
                <th className="px-3 py-2 text-start">{t('score.action')}</th>
                <th className="px-3 py-2 text-start">{t('score.category')}</th>
                <th className="px-3 py-2 text-start">{t('score.performed')}</th>
                <th className="px-3 py-2 text-start">{t('score.verdict')}</th>
              </tr>
            </thead>
            <tbody>
              {card.actions.map((a) => {
                let verdict;
                if (a.isHarmful) verdict = a.performed ? <span className="badge bg-danger text-white">⚠ {t('score.harmful', { points: a.safetyPenalty })}</span> : <span className="text-xs text-muted">{t('score.avoidedHarm')}</span>;
                else if (a.isRelevant) verdict = a.performed ? <span className="badge bg-accent/20 text-card">✓ {t('score.relevant')}</span> : <span className="badge bg-warning/10 text-warning">{t('score.missedRelevant')}</span>;
                else verdict = a.performed ? <span className="badge border border-muted/30 text-muted">{t('score.irrelevant')}</span> : <span className="text-xs text-muted">—</span>;
                return (
                  <tr key={a.actionCode} className="border-t border-muted/10">
                    <td className="px-3 py-2 text-dark">{L(a.label)}</td>
                    <td className="px-3 py-2 text-muted">{t(`sim.categories.${a.category}`)}</td>
                    <td className="px-3 py-2">{a.performed ? '✓' : '—'}</td>
                    <td className="px-3 py-2">{verdict}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t('score.domains.Handoff')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 text-sm">
            <div>
              <p className="label">{t('score.disposition')}</p>
              <Mark ok={card.handoff.dispositionCorrect} okLabel={t('score.correct')} failLabel={t('score.incorrect')} />
              {!card.handoff.dispositionCorrect && card.handoff.correctDisposition && (
                <p className="mt-2 text-muted">{t('score.correctDisposition')}: <span className="font-medium text-card">{L(card.handoff.correctDisposition.label)}</span></p>
              )}
            </div>
            {card.handoff.watchlist.length > 0 && (
              <div>
                <p className="label">{t('score.watchlist', { n: watchHits, total: card.handoff.watchlist.length })}</p>
                <ul className="space-y-1">
                  {card.handoff.watchlist.map((w) => (
                    <li key={w.conceptId} className="flex items-center justify-between gap-2">
                      <span>{L(w.label)}</span>
                      <Mark ok={w.isSatisfied} okLabel={t('score.mentioned')} failLabel={t('score.missed')} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <p className="label">{t('score.yourHandoff')}</p>
            <p dir="auto" className="min-h-24 rounded-md bg-canvas px-3 py-2 text-sm whitespace-pre-line">{card.handoff.note || '—'}</p>
          </div>
        </div>
      </Section>

      {card.guidelineReferences.length > 0 && (
        <Section title={t('score.references')}>
          <ul className="list-disc space-y-1 ps-5 text-sm">
            {card.guidelineReferences.map((r) => (
              <li key={r.title}>
                {r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="text-brand hover:underline" dir="ltr">{r.title}</a> : r.title}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
