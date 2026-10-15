import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal.jsx';
import ErrorBanner from '../ErrorBanner.jsx';

export default function CommitModal({ open, onClose, onSubmit }) {
  const { t } = useTranslation();
  const [differential, setDifferential] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ committedDifferential: differential, reasoningNotes: notes });
      onClose();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('commit.title')}
      footer={<>
        <button type="button" className="btn-ghost" onClick={onClose}>{t('common.cancel')}</button>
        <button type="submit" form="commit-form" className="btn-primary" disabled={busy || differential.trim().length < 2}>{t('commit.submit')}</button>
      </>}>
      <form id="commit-form" onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">{t('commit.intro')}</p>
        <ErrorBanner error={error} />
        <div>
          <label className="label" htmlFor="differential">{t('commit.differential')}</label>
          <textarea id="differential" dir="auto" rows={3} required className="input" placeholder={t('commit.differentialHint')}
            value={differential} onChange={(e) => setDifferential(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="notes">{t('commit.reasoning')}</label>
          <textarea id="notes" dir="auto" rows={3} className="input" placeholder={t('commit.reasoningHint')}
            value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <p className="rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">⚠ {t('commit.warning')}</p>
      </form>
    </Modal>
  );
}
