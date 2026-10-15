import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';
import LanguageToggle from './LanguageToggle.jsx';

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand text-white' : 'text-mint hover:bg-card hover:text-white'}`;

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 bg-dark text-white shadow">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <NavLink to="/" className="text-white"><Logo /></NavLink>
          <nav className="flex items-center gap-1 ms-2">
            <NavLink to="/" end className={navClass}>{t('nav.dashboard')}</NavLink>
            {user.role === 'admin' && <NavLink to="/admin" className={navClass}>{t('nav.admin')}</NavLink>}
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <LanguageToggle className="border border-muted text-mint hover:bg-card" />
            <span className="hidden text-sm text-mint sm:inline">
              {user.name} · <span className="text-accent">{t(`roles.${user.role}`)}</span>
            </span>
            <button
              type="button"
              className="btn px-3 py-1.5 text-mint hover:bg-card hover:text-white"
              onClick={async () => { await logout(); navigate('/login'); }}
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
