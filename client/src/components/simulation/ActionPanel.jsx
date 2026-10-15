import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalized } from '../../hooks/useLocalized.js';

const CATEGORIES = ['History', 'PhysicalExam', 'Investigation', 'Intervention'];

export default function ActionPanel({ actions, revealed, gated, gatePassed, onPerform, onRequestCommit, disabled }) {
  const { t } = useTranslation();
  const L = useLocalized();
  const [tab, setTab] = useState('History');
  const [busy, setBusy] = useState(null);
  const revealedByCode = new Map(revealed.map((r) => [r.actionCode, r]));
  const locked = gated.includes(tab) && !gatePassed;
  const list = actions.filter((a) => a.category === tab);

  const perform = async (code) => {
    setBusy(code);
    try {
      await onPerform(code);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="card flex flex-col lg:h-[calc(100vh-13rem)]" aria-label={t('sim.panels')}>
      <div role="tablist" className="grid grid-cols-2 gap-1 border-b border-muted/15 p-2 md:grid-cols-4 lg:grid-cols-2">
        {CATEGORIES.map((c) => {
          const isLocked = gated.includes(c) && !gatePassed;
          return (
            <button key={c} type="button" role="tab" aria-selected={tab === c} onClick={() => setTab(c)}
              className={`truncate rounded-md px-2 py-1.5 text-center text-xs font-semibold transition-colors ${tab === c ? 'bg-brand text-white' : 'text-muted hover:bg-mint/30'}`}>
              {isLocked && <span aria-hidden="true">🔒 </span>}{t(`sim.categories.${c}`)}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {locked ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/40 bg-canvas/60 p-6 text-center">
            <span className="text-3xl" aria-hidden="true">🔒</span>
            <p className="font-semibold text-card">{t('sim.locked')}</p>
            <p className="text-sm text-muted">{t('sim.lockedHint')}</p>
            <button type="button" className="btn-primary" onClick={onRequestCommit} disabled={disabled}>{t('sim.commitCta')}</button>
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((a) => {
              const done = revealedByCode.get(a.actionCode);
              return (
                <li key={a.actionCode} className={`rounded-lg border p-3 ${done ? 'border-accent/50 bg-mint/15' : 'border-muted/15'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-card">{L(a.label)}</span>
                    {done ? (
                      <span className="badge bg-accent/25 text-card">✓ {t('sim.performed')}</span>
                    ) : (
                      <button type="button" className="btn-ghost shrink-0 px-3 py-1 text-xs" disabled={disabled || busy === a.actionCode} onClick={() => perform(a.actionCode)}>
                        {t(a.category === 'Intervention' ? 'sim.order' : 'sim.perform')}
                      </button>
                    )}
                  </div>
                  {done && (
                    <div className="mt-2 rounded-md border-s-4 border-accent bg-white px-3 py-2 text-sm text-dark">
                      <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{t('sim.findings')}</p>
                      <p>{L(done.finding) || t('sim.noFindings')}</p>
                      {done.payloadMediaUrl && <img src={done.payloadMediaUrl} alt={L(a.label)} className="mt-2 max-h-56 rounded-md border border-muted/15" loading="lazy" />}
                    </div>
                  )}
                </li>
              );
            })}
            {list.length === 0 && <li className="p-4 text-center text-sm text-muted">{t('sim.noActions')}</li>}
          </ul>
        )}
      </div>
    </section>
  );
}
