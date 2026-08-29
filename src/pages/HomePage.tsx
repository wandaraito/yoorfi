import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { TailorProfile, Product } from '@/lib/types';
import { TailorCard } from '@/components/TailorCard';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton, TailorCardSkeleton, ProductCardSkeleton, ErrorState } from '@/components/Feedback';
import { Logo } from '@/components/Logo';
import {
  IconReadyToWear, IconCustom, IconMen, IconWomen, IconNative,
  IconDress, IconAgbada, IconSenator, IconShirt, IconTrousers,
} from '@/components/AfricanIcons';

const CATEGORIES = [
  { name: 'Custom', slug: 'custom', Icon: IconCustom },
  { name: 'Ready to Wear', slug: 'ready-to-wear', Icon: IconReadyToWear },
  { name: 'Agbada', slug: 'agbada', Icon: IconAgbada },
  { name: 'Senator', slug: 'senator', Icon: IconSenator },
  { name: 'Dresses', slug: 'dresses', Icon: IconDress },
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
  const firstName = profile?.first_name || 'Chinedu';

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans selection:bg-[#1A1A1A] selection:text-white">
      
      {/* Floating Glass Header */}
      <header className="px-5 pt-12 pb-4 sticky top-0 z-50 bg-[#FAF9F6]/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#FAF9F6]/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-500 mb-1">Good morning, {firstName}</span>
            <div className="flex items-center text-sm font-semibold text-[#1A1A1A]">
              <MapPin className="w-4 h-4 mr-1 text-[#1A1A1A]" /> {userLocation}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white shadow-[0_8px_20px_rgb(0,0,0,0.04)] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
             <Logo className="h-5 w-auto text-[#1A1A1A]" />
          </div>
        </div>

        {/* Floating Smooth Search Pill */}
        <button
          onClick={() => navigate('/discover')}
          className="w-full flex items-center bg-white rounded-full py-4 px-5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] border border-white/60 transition-transform active:scale-[0.98]"
        >
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <span className="text-sm font-medium text-zinc-400 flex-1 text-left">Find your next outfit...</span>
          <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>
      </header>

      <div className="pb-24">
        {/* Smooth Pill Categories */}
        <section className="px-5 py-6">
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => navigate(`/discover?category=${cat.slug}`)}
                className="flex items-center gap-2 bg-white px-4 py-3 rounded-full shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] shrink-0 border border-transparent hover:border-zinc-200 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center text-[#1A1A1A]">
                  <cat.Icon size={14} />
                </div>
                <span className="text-xs font-semibold text-[#1A1A1A]">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <ErrorState message="Could not connect to marketplace." onRetry={loadData} />
        ) : (
          <div className="space-y-12">
            
            {/* Themed Collections (Trending) */}
            <section>
              <div className="px-5 mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Curated Themes</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-6 -mx-5">
                {TRENDING_IMAGES.map((img, i) => (
                  <div key={i} className="relative w-[280px] h-[340px] rounded-[32px] overflow-hidden shrink-0 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] group">
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1A1A1A]/90" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-4 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <h3 className="text-white font-semibold text-lg">{img.label}</h3>
                        <p className="text-white/80 text-xs mt-1 font-medium">{img.tailors} master tailors available</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Smooth Floating CTA Section */}
            <section className="px-5">
              <div className="bg-[#1A1A1A] rounded-[40px] p-8 relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(26,26,26,0.4)]">
                {/* Subtle background glow effect */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-zinc-700/40 rounded-full blur-[80px]" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Bespoke<br />Experience</h2>
                  <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-[200px]">
                    Have an exact design in mind? Upload a photo and let our top tailors quote you.
                  </p>
                  <button onClick={() => navigate('/discover')} className="w-full bg-white text-[#1A1A1A] font-semibold py-4 rounded-[20px] shadow-[0_8px_30px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-transform">
                    Start Custom Order
                  </button>
                </div>
              </div>
            </section>

            {/* Master Tailors */}
            <section className="px-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Top Rated Tailors</h2>
                <Link to="/discover" className="text-xs font-semibold text-zinc-500 hover:text-[#1A1A1A] transition-colors">
                  See all
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-6">
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <TailorCardSkeleton key={i} />)
                  : featuredTailors.map((t) => <TailorCard key={t.id} tailor={t} />)}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
