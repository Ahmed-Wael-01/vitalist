import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal.jsx';
import ErrorBanner from '../ErrorBanner.jsx';
import { useLocalized } from '../../hooks/useLocalized.js';

export default function FinalModal({ open, onClose, onSubmit, dispositionOptions }) {
  const { t } = useTranslation();
  const L = useLocalized();
  const [form, setForm] = useState({ diagnosisText: '', dispositionKey: '', handoffNote: '' });
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!confirming) return setConfirming(true);
    setBusy(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err);
      setConfirming(false);
      setBusy(false);
    }
  };

  const valid = form.diagnosisText.trim().length >= 2 && form.dispositionKey;

  return (
    <Modal open={open} onClose={busy ? undefined : () => { setConfirming(false); onClose(); }} title={t('final.title')} wide
      footer={<>
        <button type="button" className="btn-ghost" disabled={busy} onClick={() => (confirming ? setConfirming(false) : onClose())}>
          {confirming ? t('common.back') : t('common.cancel')}
        </button>
        <button type="submit" form="final-form" className={confirming ? 'btn-danger' : 'btn-primary'} disabled={busy || !valid}>
          {busy ? t('common.loading') : confirming ? t('final.confirm') : t('final.submit')}
        </button>
      </>}>
      <form id="final-form" onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">{t('final.intro')}</p>
        <ErrorBanner error={error} />
        <div>
          <label className="label" htmlFor="dx">{t('final.diagnosis')}</label>
          <input id="dx" dir="auto" required className="input" placeholder={t('final.diagnosisHint')} value={form.diagnosisText} onChange={set('diagnosisText')} disabled={confirming} />
        </div>
        <fieldset disabled={confirming}>
          <legend className="label">{t('final.disposition')}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {dispositionOptions.map((o) => (
              <label key={o.key} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${form.dispositionKey === o.key ? 'border-brand bg-mint/25' : 'border-muted/20 hover:bg-canvas'}`}>
                <input type="radio" name="disposition" value={o.key} checked={form.dispositionKey === o.key} onChange={set('dispositionKey')} className="mt-0.5 accent-[var(--color-primary-brand)]" />
                <span>{L(o.label)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="label" htmlFor="handoff">{t('final.handoff')}</label>
          <textarea id="handoff" dir="auto" rows={7} className="input" placeholder={t('final.handoffHint')} value={form.handoffNote} onChange={set('handoffNote')} disabled={confirming} />
        </div>
        {confirming && <p className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">⚠ {t('final.warning')}</p>}
      </form>
    </Modal>
  );
}
