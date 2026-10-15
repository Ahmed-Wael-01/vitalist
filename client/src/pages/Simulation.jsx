import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { useLocalized } from '../hooks/useLocalized.js';
import Spinner from '../components/Spinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import ChatPanel from '../components/simulation/ChatPanel.jsx';
import ActionPanel from '../components/simulation/ActionPanel.jsx';
import CommitModal from '../components/simulation/CommitModal.jsx';
import FinalModal from '../components/simulation/FinalModal.jsx';
import { formatDuration } from '../utils/format.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

/** Simulated time for the patient to "type" a reply: a short pause plus ~30 ms per character, 1.2–4.5 s. */
const typingDelay = (text = '') => Math.min(4500, Math.max(1200, 600 + text.length * 30));

function Elapsed({ since }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums" dir="ltr">{formatDuration(since)}</span>;
}

export default function Simulation() {
  const { id } = useParams();
  const { t } = useTranslation();
  const L = useLocalized();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [commitOpen, setCommitOpen] = useState(false);
  const [finalOpen, setFinalOpen] = useState(false);

  useEffect(() => {
    api(`/sessions/${id}`).then((r) => setSession(r.session)).catch(setError);
  }, [id]);

  const sendMessage = useCallback(async (text) => {
    setError(null);
    const tempId = `pending-${Date.now()}`;
    const sentAt = Date.now();
    // Show the trainee's message immediately; the patient "types" while the server responds.
    setSession((s) => ({ ...s, messages: [...s.messages, { id: tempId, sender: 'doctor', text }] }));
    try {
      const { doctorMessage, patientMessage } = await api(`/sessions/${id}/messages`, { method: 'POST', body: { text } });
      setSession((s) => ({ ...s, messages: s.messages.map((m) => (m.id === tempId ? doctorMessage : m)) }));
      await sleep(typingDelay(patientMessage.text) - (Date.now() - sentAt));
      setSession((s) => ({ ...s, messages: [...s.messages, patientMessage] }));
    } catch (err) {
      setSession((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== tempId) }));
      setError(err);
      throw err;
    }
  }, [id]);

  const perform = useCallback(async (actionCode) => {
    setError(null);
    try {
      const { action } = await api(`/sessions/${id}/actions`, { method: 'POST', body: { actionCode } });
      setSession((s) => ({ ...s, revealedActions: [...s.revealedActions.filter((a) => a.actionCode !== actionCode), action] }));
    } catch (err) {
      if (err.details?.code === 'GATE_LOCKED') setCommitOpen(true);
      else setError(err);
    }
  }, [id]);

  const commit = useCallback(async (payload) => {
    const r = await api(`/sessions/${id}/commit`, { method: 'POST', body: payload });
    setSession((s) => ({ ...s, isDiagnosticGatePassed: true, diagnosticCommitment: { ...payload, committedAt: r.committedAt } }));
  }, [id]);

  const submitFinal = useCallback(async (payload) => {
    await api(`/sessions/${id}/submit`, { method: 'POST', body: payload });
    navigate(`/sessions/${id}/scorecard`, { replace: true });
  }, [id, navigate]);

  if (!session) return error ? <ErrorBanner error={error} /> : <Spinner />;
  if (session.status === 'completed') return <Navigate to={`/sessions/${id}/scorecard`} replace />;

  const { scenario } = session;
  const patientName = L(scenario.patient?.name);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">{scenario.specialty}</p>
          <h1 className="text-xl font-bold text-card">{L(scenario.title)}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-white text-muted shadow-sm">⏱ <Elapsed since={session.startTime} /></span>
          <span className={`badge ${session.isDiagnosticGatePassed ? 'bg-accent/25 text-card' : 'bg-warning/10 text-warning'}`}>
            {session.isDiagnosticGatePassed ? `✓ ${t('sim.gatePassed')}` : `🔒 ${t('sim.gateLocked')}`}
          </span>
          <button type="button" className="btn-primary" onClick={() => setFinalOpen(true)}>{t('sim.finish')}</button>
        </div>
      </div>

      <ErrorBanner error={error} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)_minmax(0,22rem)]">
        <aside className="space-y-4">
          <section className="card overflow-hidden">
            <div className="bg-card px-4 py-3 text-white">
              <p className="text-xs text-mint">{t('sim.patient')}</p>
              <p className="font-semibold">{patientName}</p>
              <p className="text-xs text-canvas/80">
                {scenario.patient?.age && t('sim.age', { age: scenario.patient.age })}
                {scenario.patient?.sex && ` · ${t(`sim.sex.${scenario.patient.sex}`)}`}
              </p>
            </div>
            <dl className="space-y-3 p-4 text-sm">
              <div>
                <dt className="label">{t('sim.setting')}</dt>
                <dd className="text-card">{L(scenario.patient?.setting)}</dd>
              </div>
              <div>
                <dt className="label">{t('sim.triage')}</dt>
                <dd className="whitespace-pre-line text-dark">{L(scenario.triageBrief)}</dd>
              </div>
            </dl>
          </section>
          {session.diagnosticCommitment && (
            <section className="card p-4 text-sm">
              <p className="label">{t('sim.yourDifferential')}</p>
              <p dir="auto" className="whitespace-pre-line text-card">{session.diagnosticCommitment.committedDifferential}</p>
            </section>
          )}
        </aside>

        <ChatPanel messages={session.messages} onSend={sendMessage} patientName={patientName} />

        <ActionPanel
          actions={scenario.panelActions}
          revealed={session.revealedActions}
          gated={session.gatedCategories}
          gatePassed={session.isDiagnosticGatePassed}
          onPerform={perform}
          onRequestCommit={() => setCommitOpen(true)}
        />
      </div>

      <CommitModal open={commitOpen} onClose={() => setCommitOpen(false)} onSubmit={commit} />
      <FinalModal open={finalOpen} onClose={() => setFinalOpen(false)} onSubmit={submitFinal} dispositionOptions={scenario.dispositionOptions} />
    </div>
  );
}
