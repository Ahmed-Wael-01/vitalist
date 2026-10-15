import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocalized } from '../hooks/useLocalized.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { formatDate, formatNumber } from '../utils/format.js';

const DIFFICULTY_STYLE = { easy: 'bg-mint/40 text-card', medium: 'bg-accent/25 text-card', hard: 'bg-muted text-white' };

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const L = useLocalized();
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    Promise.all([api('/scenarios'), api('/sessions')])
      .then(([s, h]) => { setScenarios(s.scenarios); setSessions(h.sessions); })
      .catch(setError);
  }, []);

  const specialties = useMemo(() => [...new Set((scenarios ?? []).map((s) => s.specialty))].sort(), [scenarios]);
  const activeByScenario = useMemo(
    () => new Map(sessions.filter((s) => s.status === 'active' && s.scenario).map((s) => [s.scenario.id, s.id])),
    [sessions],
  );
  const visible = (scenarios ?? []).filter((s) => !specialty || s.specialty === specialty);

  const start = async (scenarioId) => {
    setStarting(scenarioId);
    try {
      const { session } = await api('/sessions', { method: 'POST', body: { scenarioId } });
      navigate(`/sessions/${session.id}`);
    } catch (err) {
      setError(err);
      setStarting(null);
    }
  };

  if (!scenarios && !error) return <Spinner />;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-card p-6 text-white">
        <p className="text-sm text-mint">{t('dashboard.greeting', { name: user.name })}</p>
        <h1 className="mt-1 text-2xl font-bold">{t('dashboard.title')}</h1>
        <p className="mt-2 max-w-2xl text-sm text-canvas/80">{t('dashboard.subtitle')}</p>
      </section>

      <ErrorBanner error={error} />

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-card">{t('dashboard.cases')}</h2>
          <select className="input w-auto" value={specialty} onChange={(e) => setSpecialty(e.target.value)} aria-label={t('dashboard.specialty')}>
            <option value="">{t('dashboard.allSpecialties')}</option>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {visible.length === 0 ? (
          <p className="card p-6 text-sm text-muted">{t('dashboard.noCases')}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((s) => {
              const resumeId = activeByScenario.get(s.id);
              return (
                <article key={s.id} className="card flex flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-canvas text-muted">{s.specialty}</span>
                    <span className={`badge ${DIFFICULTY_STYLE[s.difficulty]}`}>{t(`dashboard.difficulties.${s.difficulty}`)}</span>
                    {s.requiredProtocol !== 'NONE' && <span className="badge border border-accent text-muted">{s.requiredProtocol.replace('_', ' ')}</span>}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-card">{L(s.title)}</h3>
                  <p className="mt-2 line-clamp-4 flex-1 text-sm text-muted">{L(s.triageBrief)}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted">≈ {t('common.minutes', { count: s.estimatedMinutes })}</span>
                    {resumeId ? (
                      <Link to={`/sessions/${resumeId}`} className="btn-secondary">{t('dashboard.resume')}</Link>
                    ) : (
                      <button type="button" className="btn-primary" disabled={starting === s.id} onClick={() => start(s.id)}>
                        {starting === s.id ? t('dashboard.starting') : t('dashboard.start')}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-card">{t('dashboard.history')}</h2>
        {sessions.length === 0 ? (
          <p className="card p-6 text-sm text-muted">{t('dashboard.noHistory')}</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-start text-xs text-white uppercase">
                <tr>
                  <th className="px-4 py-2 text-start">{t('dashboard.case')}</th>
                  <th className="px-4 py-2 text-start">{t('dashboard.started')}</th>
                  <th className="px-4 py-2 text-start">{t('dashboard.status')}</th>
                  <th className="px-4 py-2 text-end">{t('dashboard.score')}</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-muted/10">
                    <td className="px-4 py-2 font-medium text-card">{L(s.scenario?.title)}</td>
                    <td className="px-4 py-2 text-muted">{formatDate(s.startTime, i18n.language)}</td>
                    <td className="px-4 py-2">
                      <span className={`badge ${s.status === 'completed' ? 'bg-mint/40 text-card' : 'bg-accent/20 text-muted'}`}>{t(`dashboard.statuses.${s.status}`)}</span>
                    </td>
                    <td className="px-4 py-2 text-end font-semibold tabular-nums text-card">
                      {s.status === 'completed' ? `${formatNumber(s.finalScore, i18n.language)}%` : '—'}
                    </td>
                    <td className="px-4 py-2 text-end">
                      <Link className="text-sm font-semibold text-brand hover:underline" to={s.status === 'completed' ? `/sessions/${s.id}/scorecard` : `/sessions/${s.id}`}>
                        {s.status === 'completed' ? t('dashboard.viewScorecard') : t('dashboard.resume')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
