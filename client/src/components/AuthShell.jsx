import { useTranslation } from 'react-i18next';
import Logo from './Logo.jsx';
import LanguageToggle from './LanguageToggle.jsx';

export default function AuthShell({ title, subtitle, children }) {
  const { t } = useTranslation();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-dark p-10 text-white lg:flex">
        <Logo className="text-xl" />
        <div className="max-w-md">
          <h1 className="text-3xl leading-tight font-bold text-mint">{t('auth.heroTitle')}</h1>
          <p className="mt-4 text-canvas/80">{t('auth.heroBody')}</p>
          <ul className="mt-8 space-y-3 text-sm text-canvas/90">
            {['point1', 'point2', 'point3'].map((k) => (
              <li key={k} className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-accent" />{t(`auth.${k}`)}</li>
            ))}
          </ul>
        </div>
        <svg viewBox="0 0 400 60" className="w-full text-muted" aria-hidden="true">
          <path d="M0 30h120l15-22 20 44 18-34 12 12h215" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      </aside>
      <section className="flex flex-col bg-canvas p-6">
        <div className="flex items-center justify-between">
          <Logo className="text-card lg:invisible" />
          <LanguageToggle className="btn-ghost" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-card">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
