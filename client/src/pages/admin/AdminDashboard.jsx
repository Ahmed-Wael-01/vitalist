import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client.js';
import { useLocalized } from '../../hooks/useLocalized.js';
import Spinner from '../../components/Spinner.jsx';
import ErrorBanner from '../../components/ErrorBanner.jsx';
import Modal from '../../components/Modal.jsx';
import { formatDate, formatNumber } from '../../utils/format.js';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const L = useLocalized();
  const [scenarios, setScenarios] = useState(null);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const load = () =>
    Promise.all([api('/admin/scenarios'), api('/admin/overview')])
      .then(([s, o]) => { setScenarios(s.scenarios); setOverview(o); })
      .catch(setError);
  useEffect(() => { load(); }, []);

  const togglePublish = async (s) => {
    setError(null);
    try {
      await api(`/admin/scenarios/${s.id}/publish`, { method: 'PATCH', body: { isPublished: !s.isPublished } });
      setScenarios((list) => list.map((x) => (x.id === s.id ? { ...x, isPublished: !s.isPublished } : x)));
    } catch (err) { setError(err); }
  };

  const confirmDelete = async () => {
    setError(null);
    try {
      await api(`/admin/scenarios/${toDelete.id}`, { method: 'DELETE' });
      setScenarios((list) => list.filter((x) => x.id !== toDelete.id));
    } catch (err) { setError(err); }
    setToDelete(null);
  };

  if (!scenarios && !error) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-card">{t('admin.title')}</h1>
        <Link to="/admin/scenarios/new" className="btn-primary">+ {t('admin.newScenario')}</Link>
      </div>
      <ErrorBanner error={error} />

      {overview && (
        <div className="grid gap-3 sm:grid-cols-4">
          {['student', 'intern', 'admin'].map((r) => (
            <div key={r} className="card p-4">
              <p className="text-xs text-muted">{t(`roles.${r}`)}</p>
              <p className="text-2xl font-bold text-card tabular-nums">{formatNumber(overview.userCounts[r] ?? 0, i18n.language, 0)}</p>
            </div>
          ))}
          <div className="card p-4">
            <p className="text-xs text-muted">{t('admin.scenarios')}</p>
            <p className="text-2xl font-bold text-card tabular-nums">{formatNumber(scenarios?.length ?? 0, i18n.language, 0)}</p>
          </div>
        </div>
      )}

      <section className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs text-white uppercase">
            <tr>
              <th className="px-4 py-2 text-start">{t('admin.scenario')}</th>
              <th className="px-4 py-2 text-start">{t('dashboard.specialty')}</th>
              <th className="px-4 py-2 text-start">{t('dashboard.status')}</th>
              <th className="px-4 py-2 text-end">{t('admin.sessions')}</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {scenarios?.map((s) => (
              <tr key={s.id} className="border-t border-muted/10">
                <td className="px-4 py-2">
                  <p className="font-medium text-card">{L(s.title)}</p>
                  <p className="font-mono text-xs text-muted">{s.slug}</p>
                </td>
                <td className="px-4 py-2 text-muted">{s.specialty}</td>
                <td className="px-4 py-2">
                  <span className={`badge ${s.isPublished ? 'bg-accent/25 text-card' : 'bg-canvas text-muted'}`}>{s.isPublished ? t('admin.published') : t('admin.draft')}</span>
                </td>
                <td className="px-4 py-2 text-end tabular-nums">{s.sessionCount}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/scenarios/${s.id}`} className="btn-ghost px-3 py-1 text-xs">{t('admin.edit')}</Link>
                    <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => togglePublish(s)}>{s.isPublished ? t('admin.unpublish') : t('admin.publish')}</button>
                    <button type="button" className="btn px-3 py-1 text-xs text-danger hover:bg-danger/10" onClick={() => setToDelete(s)}>{t('common.delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {overview?.recentSessions.length > 0 && (
        <section className="card overflow-x-auto">
          <h2 className="px-4 pt-4 font-semibold text-card">{t('admin.recent')}</h2>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {overview.recentSessions.map((s) => (
                <tr key={s.id} className="border-t border-muted/10">
                  <td className="px-4 py-2">{s.user?.name} <span className="text-xs text-muted">({t(`roles.${s.user?.role}`)})</span></td>
                  <td className="px-4 py-2 text-muted">{L(s.scenario?.title)}</td>
                  <td className="px-4 py-2 text-muted">{formatDate(s.endTime, i18n.language)}</td>
                  <td className="px-4 py-2 text-end font-semibold tabular-nums">{formatNumber(s.finalScore, i18n.language)}%</td>
                  <td className="px-4 py-2 text-end"><Link to={`/sessions/${s.id}/scorecard`} className="text-brand hover:underline">{t('dashboard.viewScorecard')}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title={t('admin.deleteTitle')}
        footer={<>
          <button type="button" className="btn-ghost" onClick={() => setToDelete(null)}>{t('common.cancel')}</button>
          <button type="button" className="btn-danger" onClick={confirmDelete}>{t('common.delete')}</button>
        </>}>
        <p className="text-sm">{t('admin.deleteBody', { title: L(toDelete?.title) })}</p>
      </Modal>
    </div>
  );
}
