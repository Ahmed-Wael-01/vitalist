import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function ChatPanel({ messages, onSend, disabled, patientName }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, pending]);

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || pending) return;
    setPending(true);
    setText('');
    try {
      await onSend(value);
    } catch {
      setText(value); // keep the question so the trainee can retry
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="card flex h-[60vh] min-h-[420px] flex-col lg:h-[calc(100vh-13rem)]" aria-label={t('sim.chat')}>
      <header className="flex items-center justify-between border-b border-muted/15 px-4 py-3">
        <h2 className="font-semibold text-card">{t('sim.chat')}</h2>
        <span className="text-xs text-muted">{t('sim.chatLanguageHint')}</span>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-canvas/50 px-4 py-4" aria-live="polite">
        {messages.length === 0 && <p className="mx-auto max-w-sm py-10 text-center text-sm text-muted">{t('sim.startHint')}</p>}
        {messages.map((m) => {
          const doctor = m.sender === 'doctor';
          return (
            <div key={m.id} className={`flex ${doctor ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${doctor ? 'rounded-ee-sm bg-brand text-white' : 'rounded-es-sm border border-muted/15 bg-white text-dark'}`}>
                <p className={`mb-0.5 text-[11px] font-semibold ${doctor ? 'text-mint' : 'text-muted'}`}>{doctor ? t('sim.you') : patientName}</p>
                <p dir="auto" className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          );
        })}
        {pending && (
          <div className="flex items-center gap-2" role="status">
            <div className="flex items-center gap-1 rounded-2xl rounded-es-sm border border-muted/15 bg-white px-4 py-3 shadow-sm">
              {[0, 150, 300].map((d) => <span key={d} className="size-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${d}ms` }} />)}
            </div>
            <span className="text-xs text-muted italic">{t('sim.isTyping')}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-muted/15 p-3">
        <textarea
          dir="auto"
          rows={1}
          className="input max-h-32 min-h-10 resize-none"
          placeholder={t('sim.chatPlaceholder')}
          value={text}
          disabled={disabled}
          maxLength={2000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) submit(e); }}
        />
        <button type="submit" className="btn-primary" disabled={disabled || pending || !text.trim()}>{t('sim.send')}</button>
      </form>
    </section>
  );
}
