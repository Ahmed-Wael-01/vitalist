import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';

export default function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation();
  const auth = useAuth();
  const next = i18n.language === 'ar' ? 'en' : 'ar';
  const change = () => (auth?.setLanguage ? auth.setLanguage(next) : i18n.changeLanguage(next));
  return (
    <button type="button" onClick={change} className={`btn px-3 py-1.5 ${className}`} lang={next}>
      {next === 'ar' ? 'العربية' : 'English'}
    </button>
  );
}
