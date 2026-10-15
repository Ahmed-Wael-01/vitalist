import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function Modal({ open, title, onClose, children, footer, wide = false }) {
  const { t } = useTranslation();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('input, textarea, select, button')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/70 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={title}
        className={`card flex max-h-[90vh] w-full flex-col ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-muted/15 px-5 py-4">
          <h2 className="text-lg font-semibold text-card">{title}</h2>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded p-1 text-muted hover:bg-canvas" aria-label={t('common.close')}>✕</button>
          )}
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-muted/15 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
