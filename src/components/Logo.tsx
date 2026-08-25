import { Scissors } from 'lucide-react';

export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-ink-900">
        <Scissors className="w-5 h-5 text-cream-50" strokeWidth={2.2} />
      </div>
      {showText && (
        <span className="font-display text-xl font-semibold tracking-tight text-ink-900">
          yoorfit
        </span>
      )}
    </div>
  );
}
