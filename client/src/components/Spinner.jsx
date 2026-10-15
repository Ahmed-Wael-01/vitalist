import { useTranslation } from 'react-i18next';

export default function Spinner({ fullScreen = false, label }) {
  const { t } = useTranslation();
  const spinner = (
    <div role="status" className="flex items-center gap-3 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <span className="text-sm">{label ?? t('common.loading')}</span>
    </div>
  );
  return fullScreen ? <div className="flex min-h-screen items-center justify-center bg-canvas">{spinner}</div> : spinner;
}
