import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors } from 'lucide-react';

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/onboarding'), 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center px-6">
      <div className="animate-scale-in flex flex-col items-center">
        <div className="relative w-20 h-20 rounded-2xl bg-cream-50 flex items-center justify-center mb-6 shadow-lift">
          <Scissors className="w-10 h-10 text-ink-900" strokeWidth={2} />
          <div className="absolute inset-0 rounded-2xl border-2 border-cream-50/30 animate-pulse-ring" />
        </div>
        <h1 className="font-display text-4xl text-cream-50 font-semibold tracking-tight mb-2">
          yoorfit
        </h1>
        <p className="text-cream-300 text-sm tracking-[0.3em] uppercase">
          Discover. Design. Wear.
        </p>
      </div>
      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <div className="w-8 h-1 rounded-full bg-cream-50/20 overflow-hidden">
          <div className="h-full bg-cream-50 animate-shimmer" style={{ animationDuration: '2.5s' }} />
        </div>
      </div>
    </div>
  );
}
