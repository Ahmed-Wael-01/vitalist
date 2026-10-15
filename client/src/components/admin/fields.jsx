import { useTranslation } from 'react-i18next';

export function Field({ label, hint, children }) {
  return (
    <div>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextField({ label, hint, value, onChange, type = 'text', ...rest }) {
  return (
    <Field label={label} hint={hint}>
      <input className="input" type={type} value={value ?? ''} {...rest}
        onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)} />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-card">
      <input type="checkbox" className="size-4 accent-[var(--color-primary-brand)]" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** English + Arabic inputs side by side. */
export function BilingualField({ label, value, onChange, multiline = false, rows = 3 }) {
  const v = value ?? { en: '', ar: '' };
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Field label={label}>
      <div className="grid gap-2 md:grid-cols-2">
        <Tag className="input" dir="ltr" lang="en" rows={multiline ? rows : undefined} placeholder="English"
          value={v.en ?? ''} onChange={(e) => onChange({ ...v, en: e.target.value })} />
        <Tag className="input" dir="rtl" lang="ar" rows={multiline ? rows : undefined} placeholder="العربية"
          value={v.ar ?? ''} onChange={(e) => onChange({ ...v, ar: e.target.value })} />
      </div>
    </Field>
  );
}

/** Synonym list edited as one term per line. Empty lines are kept while typing and stripped on save. */
export function TermsField({ label, value, onChange, dir = 'ltr' }) {
  const { t } = useTranslation();
  return (
    <Field label={label} hint={t('admin.oneTermPerLine')}>
      <textarea className="input font-mono text-xs" rows={4} dir={dir}
        value={(value ?? []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} />
    </Field>
  );
}

/** Ordered list of sub-records with add / remove / reorder. */
export function ListEditor({ items, onChange, newItem, addLabel, itemTitle, renderItem }) {
  const { t } = useTranslation();
  const update = (i, next) => onChange(items.map((it, j) => (j === i ? next : it)));
  const move = (i, d) => {
    const copy = [...items];
    [copy[i], copy[i + d]] = [copy[i + d], copy[i]];
    onChange(copy);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-muted/20 bg-white">
          <div className="flex items-center justify-between gap-2 border-b border-muted/10 bg-canvas/60 px-3 py-2">
            <span className="truncate text-sm font-semibold text-card">{i + 1}. {itemTitle(item) || '—'}</span>
            <div className="flex shrink-0 gap-1">
              <button type="button" className="rounded px-2 text-muted hover:bg-mint/40 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('admin.moveUp')}>↑</button>
              <button type="button" className="rounded px-2 text-muted hover:bg-mint/40 disabled:opacity-30" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={t('admin.moveDown')}>↓</button>
              <button type="button" className="rounded px-2 text-danger hover:bg-danger/10" onClick={() => onChange(items.filter((_, j) => j !== i))}>{t('common.remove')}</button>
            </div>
          </div>
          <div className="space-y-3 p-3">{renderItem(item, (next) => update(i, next))}</div>
        </div>
      ))}
      <button type="button" className="btn-ghost w-full border-dashed" onClick={() => onChange([...items, newItem()])}>+ {addLabel}</button>
    </div>
  );
}
