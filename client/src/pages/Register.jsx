import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import AuthShell from '../components/AuthShell.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function Register() {
  const { t, i18n } = useTranslation();
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({ ...form, preferredLanguage: i18n.language });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={t('auth.createAccount')} subtitle={t('auth.signUpSubtitle')}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBanner error={error} />
        <div>
          <label className="label" htmlFor="name">{t('auth.name')}</label>
          <input id="name" required minLength={2} autoComplete="name" className="input" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label" htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" required autoComplete="email" className="input" dir="ltr" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label" htmlFor="password">{t('auth.password')}</label>
          <input id="password" type="password" required minLength={8} autoComplete="new-password" className="input" dir="ltr" value={form.password} onChange={set('password')} />
          <p className="mt-1 text-xs text-muted">{t('auth.passwordHint')}</p>
        </div>
        <fieldset>
          <legend className="label">{t('auth.role')}</legend>
          <div className="grid grid-cols-2 gap-2">
            {['student', 'intern'].map((role) => (
              <label key={role} className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors ${form.role === role ? 'border-brand bg-brand text-white' : 'border-muted/30 bg-white text-card hover:bg-mint/30'}`}>
                <input type="radio" name="role" value={role} checked={form.role === role} onChange={set('role')} className="sr-only" />
                {t(`roles.${role}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? t('common.loading') : t('auth.signUp')}</button>
        <p className="text-center text-sm text-muted">
          {t('auth.haveAccount')} <Link to="/login" className="font-semibold text-brand hover:underline">{t('auth.signIn')}</Link>
        </p>
      </form>
    </AuthShell>
  );
}
