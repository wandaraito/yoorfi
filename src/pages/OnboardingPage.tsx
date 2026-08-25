import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Package } from 'lucide-react';

const slides = [
  {
    icon: Search,
    title: 'Find trusted tailors',
    description: 'Discover verified Nigerian tailors and fashion vendors near you. Browse portfolios, compare prices, and find the perfect match.',
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Sparkles,
    title: 'Create your perfect outfit',
    description: 'Upload inspiration, add your measurements, and specify every detail. From Agbada to Senator, get exactly what you want.',
    image: 'https://images.pexels.com/photos/7679711/pexels-photo-7679711.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Package,
    title: 'Order and track everything',
    description: 'Place orders, chat with your tailor, pay securely, and track production in real-time. No more chasing on WhatsApp.',
    image: 'https://images.pexels.com/photos/6311707/pexels-photo-6311707.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate('/login')}
          className="text-sm text-ink-500 hover:text-ink-900 font-medium"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-8 shadow-card">
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/20 to-transparent" />
        </div>

        <div className="flex gap-1.5 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-ink-900' : 'w-1.5 bg-ink-200'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center">
            <slide.icon className="w-5 h-5 text-cream-50" strokeWidth={2} />
          </div>
          <h2 className="font-display text-2xl font-semibold">{slide.title}</h2>
        </div>

        <p className="text-ink-600 text-center leading-relaxed mb-10 text-[15px]">
          {slide.description}
        </p>
      </div>

      <div className="p-6 max-w-md mx-auto w-full pb-8">
        <button
          onClick={() => isLast ? navigate('/login') : setStep(step + 1)}
          className="btn-primary w-full"
        >
          {isLast ? 'Get Started' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
