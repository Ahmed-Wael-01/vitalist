export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="var(--color-card-surface)" />
        <path d="M4 17h6l3-7 4 13 3-8 2 2h6" fill="none" stroke="var(--color-accent-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Vitalist</span>
    </span>
  );
}
