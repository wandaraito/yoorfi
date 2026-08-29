import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { TailorProfile, Product } from '@/lib/types';
import { TailorCard } from '@/components/TailorCard';
import { ProductCard } from '@/components/ProductCard';
import { TailorCardSkeleton, ProductCardSkeleton, ErrorState } from '@/components/Feedback';
import { Logo } from '@/components/Logo';

const CATEGORIES = [
  { name: 'Custom', slug: 'custom' },
  { name: 'Ready-to-Wear', slug: 'ready-to-wear' },
  { name: 'Agbada', slug: 'agbada' },
  { name: 'Senator', slug: 'senator' },
  { name: 'Dresses', slug: 'dresses' },
];

const TRENDING_IMAGES = [
  { url: 'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600', label: 'Bespoke Agbada', tailors: 24 },
  { url: 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600', label: 'Ankara Fusion', tailors: 18 },
  { url: 'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=600', label: 'Modern Senator', tailors: 32 },
];

export function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [featuredTailors, setFeaturedTailors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [featuredRes, productsRes] = await Promise.all([
        supabase.from('tailor_profiles').select('*, profiles!tailor_id(full_name, avatar_url, location)').eq('verification_status', 'verified').eq('is_featured', true).limit(5),
        supabase.from('products').select('*, tailor_profiles!inner(profiles!tailor_id(full_name))').eq('is_active', true).limit(6),
      ]);
      setFeaturedTailors(featuredRes.data || []);
      setProducts(productsRes.data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const userLocation = profile?.location || 'Lagos, NG';

  return (
    <div className="bg-[#F8F8F5] min-h-screen font-sans selection:bg-black selection:text-white pb-24">
      
      {/* 
        Fixed Header: 
        Removed the weird circular clipping on the logo. 
        Stripped out "Good morning" for a stark, editorial layout.
      */}
      <header className="px-5 pt-12 pb-8 flex items-end justify-between">
        <div>
          <Logo className="h-6 w-auto text-black" />
        </div>
        <div className="flex items-center text-[10px] uppercase tracking-widest font-medium border border-black px-3 py-1.5 rounded-none">
          <MapPin className="w-3 h-3 mr-1.5" /> {userLocation}
        </div>
      </header>

      {/* 
        Editorial Search: 
        Replaced the tech-app "pill" with a sleek, minimalist text input.
      */}
      <div className="px-5 mb-10">
        <div className="relative border-b border-black pb-3 group">
          <Search className="absolute left-0 top-1 w-5 h-5 text-black" />
          <input 
            type="text" 
            onClick={() => navigate('/discover')}
            readOnly
            placeholder="Search tailors, fabrics, styles..." 
            className="w-full bg-transparent text-sm pl-8 font-medium placeholder:text-zinc-400 focus:outline-none cursor-text" 
          />
          <ArrowRight className="absolute right-0 top-1 w-5 h-5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 
        Fashion Categories: 
        Removed bulky pills. Using large typography that scrolls smoothly.
      */}
      <section className="mb-12">
        <div className="flex space-x-6 overflow-x-auto no-scrollbar px-5">
          {CATEGORIES.map((cat, index) => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/discover?category=${cat.slug}`)}
              className={`text-2xl font-serif whitespace-nowrap transition-colors ${
                index === 0 ? 'text-black border-b border-black pb-1' : 'text-zinc-400 hover:text-black'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <ErrorState message="Could not connect to marketplace." onRetry={loadData} />
      ) : (
        <div className="space-y-16">
          
          {/* 
            Curated Themes (Fixed clipping): 
            Using sharp edges (rounded-none). Fixed the absolute positioning so text has breathing room.
          */}
          <section>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-6">
              {TRENDING_IMAGES.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate('/discover')}
                  className="relative w-[80vw] max-w-[300px] aspect-[3/4] bg-zinc-200 shrink-0 cursor-pointer group"
                >
                  <img 
                    src={img.url} 
                    alt={img.label} 
                    className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700" 
                  />
                  {/* Subtle dark gradient for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  
                  <div className="absolute bottom-6 left-5">
                    <h3 className="text-white font-serif text-2xl mb-1 leading-tight">{img.label}</h3>
                    <p className="text-zinc-300 text-[10px] uppercase tracking-widest font-medium">
                      {img.tailors} Tailors Available
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Master Tailors */}
          <section className="px-5">
            <div className="flex items-center justify-between mb-8 border-b border-black pb-4">
              <h2 className="text-3xl font-serif text-black">The Masters</h2>
              <Link to="/discover" className="text-[10px] uppercase tracking-widest font-semibold hover:text-zinc-500 transition-colors">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <TailorCardSkeleton key={i} />)
                : featuredTailors.map((t) => <TailorCard key={t.id} tailor={t} />)}
            </div>
          </section>

          {/* Stark Brutalist CTA */}
          <section className="px-5">
            <div className="bg-black text-white p-10 flex flex-col items-center justify-center text-center">
              <h2 className="text-4xl font-serif mb-4">Create.</h2>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-[250px]">
                Have a vision? Match with a premium tailor and bring your exact design to life.
              </p>
              <button 
                onClick={() => navigate('/discover')} 
                className="border border-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
              >
                Start a Commission
              </button>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
