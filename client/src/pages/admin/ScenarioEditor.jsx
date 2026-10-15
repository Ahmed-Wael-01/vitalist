import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client.js';
import Spinner from '../../components/Spinner.jsx';
import ErrorBanner from '../../components/ErrorBanner.jsx';
import {
  BilingualField, CheckboxField, Field, ListEditor, SelectField, TermsField, TextField,
} from '../../components/admin/fields.jsx';

const bi = () => ({ en: '', ar: '' });
const OSCE_DOMAINS = ['History', 'Communication', 'Exam', 'Reasoning', 'Management', 'Handoff'];
const CATEGORIES = ['History', 'PhysicalExam', 'Investigation', 'Intervention'];
const PROTOCOLS = ['NONE', 'SPIKES', 'SBAR_Handoff'];
const TABS = ['basics', 'patient', 'diagnosis', 'concepts', 'actions', 'protocol', 'disposition', 'json'];

const emptyScenario = () => ({
  slug: '', title: bi(), specialty: '', difficulty: 'medium', isPublished: false, estimatedMinutes: 15,
  triageBrief: bi(), patient: { name: bi(), age: undefined, sex: 'male', setting: bi() },
  patientPersona: '', scriptedReplies: [], defaultReply: bi(),
  goldStandardDiagnosis: { key: '', label: bi(), englishTerms: [], arabicTerms: [] },
  acceptedDifferentials: [], requiredDifferentialCount: 2,
  requiredProtocol: 'NONE', protocolSteps: [],
  conceptDictionary: [], panelActions: [],
  disposition: { options: [], correctKey: '' },
  guidelineReferences: [],
});

const newKeyed = () => ({ key: '', label: bi(), englishTerms: [], arabicTerms: [] });
const newConcept = () => ({ conceptId: '', osceDomain: 'History', label: bi(), englishTerms: [], arabicTerms: [], expectedStatus: 'ANY' });
const newAction = () => ({ actionCode: '', category: 'PhysicalExam', label: bi(), finding: bi(), payloadMediaUrl: '', isRelevant: true, isHarmful: false, safetyPenalty: 0 });

/** Strip server-only fields and empty synonym lines before sending. */
function clean(s) {
  const terms = (list) => (list ?? []).map((x) => x.trim()).filter(Boolean);
  const keyed = (k) => ({ ...k, englishTerms: terms(k.englishTerms), arabicTerms: terms(k.arabicTerms) });
  const { _id, __v, id, createdAt, updatedAt, createdBy, ...rest } = s;
  return {
    ...rest,
    goldStandardDiagnosis: keyed(rest.goldStandardDiagnosis),
    acceptedDifferentials: rest.acceptedDifferentials.map(keyed),
    conceptDictionary: rest.conceptDictionary.map((c) => ({ ...c, englishTerms: terms(c.englishTerms), arabicTerms: terms(c.arabicTerms) })),
    panelActions: rest.panelActions.map(({ _id: _a, ...a }) => a),
  };
}

function KeyedTermsEditor({ value, onChange, t }) {
  return (
    <>
      <TextField label={t('admin.fields.key')} value={value.key} onChange={(key) => onChange({ ...value, key })} />
      <BilingualField label={t('admin.fields.label')} value={value.label} onChange={(label) => onChange({ ...value, label })} />
      <div className="grid gap-3 md:grid-cols-2">
        <TermsField label={t('admin.fields.englishTerms')} value={value.englishTerms} onChange={(englishTerms) => onChange({ ...value, englishTerms })} />
        <TermsField label={t('admin.fields.arabicTerms')} dir="rtl" value={value.arabicTerms} onChange={(arabicTerms) => onChange({ ...value, arabicTerms })} />
      </div>
    </>
  );
}

export default function ScenarioEditor() {
  const { id } = useParams();
  const isNew = !id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [s, setS] = useState(isNew ? emptyScenario() : null);
  const [tab, setTab] = useState('basics');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    if (!isNew) api(`/admin/scenarios/${id}`).then((r) => setS(r.scenario)).catch(setError);
  }, [id, isNew]);

  useEffect(() => {
    if (tab === 'json' && s) { setJsonText(JSON.stringify(clean(s), null, 2)); setJsonError(null); }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!s) return error ? <ErrorBanner error={error} /> : <Spinner />;
  const set = (key) => (value) => setS((prev) => ({ ...prev, [key]: value }));
  const conceptOptions = s.conceptDictionary.map((c) => ({ value: c.conceptId, label: c.conceptId || '—' }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = clean(s);
      const r = isNew
        ? await api('/admin/scenarios', { method: 'POST', body })
        : await api(`/admin/scenarios/${id}`, { method: 'PUT', body });
      setSavedAt(new Date());
      if (isNew) navigate(`/admin/scenarios/${r.scenario._id}`, { replace: true });
      else setS(r.scenario);
    } catch (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const applyJson = () => {
    try {
      setS({ ...emptyScenario(), ...JSON.parse(jsonText) });
      setJsonError(null);
    } catch (err) {
      setJsonError(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="text-sm text-brand hover:underline">← {t('admin.title')}</Link>
          <h1 className="text-xl font-bold text-card">{isNew ? t('admin.newScenario') : s.title?.en || s.slug}</h1>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-xs text-muted">✓ {t('common.saved')}</span>}
          <CheckboxField label={t('admin.published')} checked={s.isPublished} onChange={set('isPublished')} />
          <button type="button" className="btn-primary" disabled={saving} onClick={save}>{saving ? t('common.saving') : t('common.save')}</button>
        </div>
      </div>

      <ErrorBanner error={error} />

      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-lg bg-white p-1 shadow-sm">
        {TABS.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${tab === k ? 'bg-brand text-white' : 'text-muted hover:bg-mint/30'}`}>
            {t(`admin.tabs.${k}`)}
          </button>
        ))}
      </div>

      <div className="card space-y-4 p-5">
        {tab === 'basics' && (
          <>
            <div className="grid gap-3 md:grid-cols-4">
              <TextField label={t('admin.fields.slug')} value={s.slug} onChange={set('slug')} dir="ltr" />
              <TextField label={t('dashboard.specialty')} value={s.specialty} onChange={set('specialty')} />
              <SelectField label={t('admin.fields.difficulty')} value={s.difficulty} onChange={set('difficulty')}
                options={['easy', 'medium', 'hard'].map((d) => ({ value: d, label: t(`dashboard.difficulties.${d}`) }))} />
              <TextField label={t('admin.fields.minutes')} type="number" min={1} value={s.estimatedMinutes} onChange={set('estimatedMinutes')} />
            </div>
            <BilingualField label={t('admin.fields.title')} value={s.title} onChange={set('title')} />
            <BilingualField label={t('sim.triage')} value={s.triageBrief} onChange={set('triageBrief')} multiline rows={5} />
            <ListEditor
              items={s.guidelineReferences} onChange={set('guidelineReferences')} addLabel={t('admin.addReference')}
              newItem={() => ({ title: '', url: '' })} itemTitle={(r) => r.title}
              renderItem={(r, up) => (
                <div className="grid gap-3 md:grid-cols-2">
                  <TextField label={t('admin.fields.refTitle')} value={r.title} onChange={(title) => up({ ...r, title })} />
                  <TextField label="URL" value={r.url} onChange={(url) => up({ ...r, url })} dir="ltr" />
                </div>
              )}
            />
          </>
        )}

        {tab === 'patient' && (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <TextField label={t('admin.fields.age')} type="number" min={0} value={s.patient.age} onChange={(age) => set('patient')({ ...s.patient, age })} />
              <SelectField label={t('admin.fields.sex')} value={s.patient.sex} onChange={(sex) => set('patient')({ ...s.patient, sex })}
                options={[{ value: 'male', label: t('sim.sex.male') }, { value: 'female', label: t('sim.sex.female') }]} />
            </div>
            <BilingualField label={t('admin.fields.patientName')} value={s.patient.name} onChange={(name) => set('patient')({ ...s.patient, name })} />
            <BilingualField label={t('sim.setting')} value={s.patient.setting} onChange={(setting) => set('patient')({ ...s.patient, setting })} />
            <Field label={t('admin.fields.persona')} hint={t('admin.personaHint')}>
              <textarea className="input font-mono text-xs" rows={14} dir="ltr" value={s.patientPersona} onChange={(e) => set('patientPersona')(e.target.value)} />
            </Field>
            <BilingualField label={t('admin.fields.defaultReply')} value={s.defaultReply} onChange={set('defaultReply')} multiline rows={2} />
            <p className="label">{t('admin.fields.scriptedReplies')}</p>
            <p className="-mt-2 text-xs text-muted">{t('admin.scriptedHint')}</p>
            <ListEditor
              items={s.scriptedReplies} onChange={set('scriptedReplies')} addLabel={t('admin.addReply')}
              newItem={() => ({ conceptId: s.conceptDictionary[0]?.conceptId ?? '', en: '', ar: '' })} itemTitle={(r) => r.conceptId}
              renderItem={(r, up) => (
                <>
                  <SelectField label={t('admin.fields.concept')} value={r.conceptId} onChange={(conceptId) => up({ ...r, conceptId })} options={conceptOptions} />
                  <BilingualField label={t('admin.fields.reply')} value={{ en: r.en, ar: r.ar }} onChange={(v) => up({ ...r, ...v })} multiline rows={2} />
                </>
              )}
            />
          </>
        )}

        {tab === 'diagnosis' && (
          <>
            <h3 className="font-semibold text-card">{t('score.goldStandard')}</h3>
            <KeyedTermsEditor t={t} value={s.goldStandardDiagnosis} onChange={set('goldStandardDiagnosis')} />
            <hr className="border-muted/15" />
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 className="font-semibold text-card">{t('admin.fields.acceptedDifferentials')}</h3>
              <div className="w-48"><TextField label={t('admin.fields.requiredCount')} type="number" min={1} value={s.requiredDifferentialCount} onChange={set('requiredDifferentialCount')} /></div>
            </div>
            <ListEditor items={s.acceptedDifferentials} onChange={set('acceptedDifferentials')} addLabel={t('admin.addDifferential')}
              newItem={newKeyed} itemTitle={(d) => d.label?.en || d.key}
              renderItem={(d, up) => <KeyedTermsEditor t={t} value={d} onChange={up} />} />
          </>
        )}

        {tab === 'concepts' && (
          <>
            <p className="text-sm text-muted">{t('admin.conceptsHint')}</p>
            <ListEditor items={s.conceptDictionary} onChange={set('conceptDictionary')} addLabel={t('admin.addConcept')}
              newItem={newConcept} itemTitle={(c) => `${c.conceptId} · ${c.osceDomain}`}
              renderItem={(c, up) => (
                <>
                  <div className="grid gap-3 md:grid-cols-3">
                    <TextField label={t('admin.fields.conceptId')} value={c.conceptId} onChange={(conceptId) => up({ ...c, conceptId })} dir="ltr" />
                    <SelectField label={t('admin.fields.domain')} value={c.osceDomain} onChange={(osceDomain) => up({ ...c, osceDomain })}
                      options={OSCE_DOMAINS.map((d) => ({ value: d, label: t(`admin.domains.${d}`) }))} />
                    <SelectField label={t('admin.fields.expectedStatus')} value={c.expectedStatus} onChange={(expectedStatus) => up({ ...c, expectedStatus })}
                      options={['ANY', 'AFFIRMED', 'NEGATED'].map((v) => ({ value: v, label: t(`admin.expected.${v}`) }))} />
                  </div>
                  <BilingualField label={t('admin.fields.label')} value={c.label} onChange={(label) => up({ ...c, label })} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <TermsField label={t('admin.fields.englishTerms')} value={c.englishTerms} onChange={(englishTerms) => up({ ...c, englishTerms })} />
                    <TermsField label={t('admin.fields.arabicTerms')} dir="rtl" value={c.arabicTerms} onChange={(arabicTerms) => up({ ...c, arabicTerms })} />
                  </div>
                </>
              )} />
          </>
        )}

        {tab === 'actions' && (
          <ListEditor items={s.panelActions} onChange={set('panelActions')} addLabel={t('admin.addAction')}
            newItem={newAction} itemTitle={(a) => `${a.actionCode} · ${a.category}`}
            renderItem={(a, up) => (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <TextField label={t('admin.fields.actionCode')} value={a.actionCode} onChange={(actionCode) => up({ ...a, actionCode })} dir="ltr" />
                  <SelectField label={t('score.category')} value={a.category} onChange={(category) => up({ ...a, category })}
                    options={CATEGORIES.map((c) => ({ value: c, label: t(`sim.categories.${c}`) }))} />
                  <TextField label={t('admin.fields.mediaUrl')} value={a.payloadMediaUrl} onChange={(payloadMediaUrl) => up({ ...a, payloadMediaUrl })} dir="ltr" />
                </div>
                <BilingualField label={t('admin.fields.label')} value={a.label} onChange={(label) => up({ ...a, label })} />
                <BilingualField label={t('sim.findings')} value={a.finding} onChange={(finding) => up({ ...a, finding })} multiline rows={2} />
                <div className="flex flex-wrap items-center gap-6">
                  <CheckboxField label={t('score.relevant')} checked={a.isRelevant} onChange={(isRelevant) => up({ ...a, isRelevant, isHarmful: isRelevant ? false : a.isHarmful })} />
                  <CheckboxField label={t('admin.fields.harmful')} checked={a.isHarmful} onChange={(isHarmful) => up({ ...a, isHarmful, isRelevant: isHarmful ? false : a.isRelevant })} />
                  {a.isHarmful && (
                    <div className="w-40"><TextField label={t('admin.fields.penalty')} type="number" min={0} max={5} step={0.5} value={a.safetyPenalty} onChange={(safetyPenalty) => up({ ...a, safetyPenalty })} /></div>
                  )}
                </div>
              </>
            )} />
        )}

        {tab === 'protocol' && (
          <>
            <SelectField label={t('admin.fields.protocol')} value={s.requiredProtocol} onChange={set('requiredProtocol')}
              options={PROTOCOLS.map((p) => ({ value: p, label: t(`admin.protocols.${p}`) }))} />
            <p className="text-sm text-muted">{t('admin.protocolHint')}</p>
            {s.requiredProtocol !== 'NONE' && (
              <ListEditor items={s.protocolSteps} onChange={set('protocolSteps')} addLabel={t('admin.addStep')}
                newItem={() => ({ stepCode: '', order: s.protocolSteps.length + 1, conceptId: '' })} itemTitle={(st) => st.stepCode}
                renderItem={(st, up) => (
                  <div className="grid gap-3 md:grid-cols-3">
                    <TextField label={t('admin.fields.stepCode')} value={st.stepCode} onChange={(stepCode) => up({ ...st, stepCode })} dir="ltr" />
                    <TextField label={t('admin.fields.order')} type="number" min={1} value={st.order} onChange={(order) => up({ ...st, order })} />
                    <SelectField label={t('admin.fields.concept')} value={st.conceptId} onChange={(conceptId) => up({ ...st, conceptId })}
                      options={[{ value: '', label: '—' }, ...conceptOptions]} />
                  </div>
                )} />
            )}
          </>
        )}

        {tab === 'disposition' && (
          <>
            <ListEditor items={s.disposition.options} onChange={(options) => set('disposition')({ ...s.disposition, options })} addLabel={t('admin.addOption')}
              newItem={() => ({ key: '', label: bi() })} itemTitle={(o) => o.key}
              renderItem={(o, up) => (
                <>
                  <TextField label={t('admin.fields.key')} value={o.key} onChange={(key) => up({ ...o, key })} dir="ltr" />
                  <BilingualField label={t('admin.fields.label')} value={o.label} onChange={(label) => up({ ...o, label })} />
                </>
              )} />
            <SelectField label={t('score.correctDisposition')} value={s.disposition.correctKey} onChange={(correctKey) => set('disposition')({ ...s.disposition, correctKey })}
              options={[{ value: '', label: '—' }, ...s.disposition.options.map((o) => ({ value: o.key, label: o.label?.en || o.key }))]} />
            <p className="text-sm text-muted">{t('admin.handoffHint')}</p>
          </>
        )}

        {tab === 'json' && (
          <>
            <p className="text-sm text-muted">{t('admin.jsonHint')}</p>
            <ErrorBanner error={jsonError} />
            <textarea className="input h-[60vh] font-mono text-xs" dir="ltr" spellCheck={false} value={jsonText} onChange={(e) => setJsonText(e.target.value)} />
            <button type="button" className="btn-secondary" onClick={applyJson}>{t('admin.applyJson')}</button>
          </>
        )}
      </div>
    </div>
  );
}
