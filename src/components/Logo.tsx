export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8 bg-ink-900">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 2 L8 6 L12 2 M4 14 L8 10 L12 14 M8 6 L8 10" stroke="#F8F8F6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {showText && (
        <span className="font-display text-lg font-semibold tracking-tight text-ink-900 lowercase">
          yoorfit
        </span>
      )}
    </div>
  );
}
