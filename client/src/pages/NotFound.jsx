import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
      <p className="text-6xl font-bold text-brand">404</p>
      <p className="text-muted">{t('common.notFound')}</p>
      <Link to="/" className="btn-primary">{t('common.backHome')}</Link>
    </div>
  );
}
