export default function ErrorBanner({ error, className = '' }) {
  if (!error) return null;
  const details = Array.isArray(error.details) ? error.details : [];
  return (
    <div role="alert" className={`rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger ${className}`}>
      <p className="font-medium">{error.message ?? String(error)}</p>
      {details.length > 0 && (
        <ul className="mt-1 list-disc ps-5 text-xs">
          {details.map((d, i) => <li key={i}><code>{d.path}</code>: {d.message}</li>)}
        </ul>
      )}
    </div>
  );
}
