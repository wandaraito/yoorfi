import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
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
  { name: 'Ready to Wear', slug: 'ready-to-wear', Icon: IconReadyToWear },
  { name: 'Custom', slug: 'custom', Icon: IconCustom },
  { name: 'Men', slug: 'men', Icon: IconMen },
  { name: 'Women', slug: 'women', Icon: IconWomen },
  { name: 'Native', slug: 'native', Icon: IconNative },
  { name: 'Dresses', slug: 'dresses', Icon: IconDress },
  { name: 'Agbada', slug: 'agbada', Icon: IconAgbada },
  { name: 'Senator', slug: 'senator', Icon: IconSenator },
  { name: 'Shirts', slug: 'shirts', Icon: IconShirt },
  { name: 'Trousers', slug: 'trousers', Icon: IconTrousers },
];

const TRENDING_IMAGES = [
  { url: 'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600', label: 'Bespoke Agbada' },
  { url: 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600', label: 'Ankara Fusion' },
  { url: 'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=600', label: 'Modern Senator' },
  { url: 'https://images.pexels.com/photos/37283114/pexels-photo-37283114.jpeg?auto=compress&cs=tinysrgb&w=600', label: 'Bridal Native' },
];

export function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [featuredTailors, setFeaturedTailors] = useState<(TailorProfile & { profiles: { full_name: string; avatar_url: string | null; location: string | null } })[]>([]);
  const [products, setProducts] = useState<(Product & { tailor_profiles: { profiles: { full_name: string } } })[]>([]);
  const [nearbyTailors, setNearbyTailors] = useState<(TailorProfile & { profiles: { full_name: string; avatar_url: string | null; location: string | null } })[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [featuredRes, productsRes, nearbyRes] = await Promise.all([
        supabase
          .from('tailor_profiles')
          .select('*, profiles!tailor_id(full_name, avatar_url, location)')
          .eq('verification_status', 'verified')
          .eq('is_featured', true)
          .order('rating', { ascending: false })
          .limit(8),
        supabase
          .from('products')
          .select('*, tailor_profiles!inner(profiles!tailor_id(full_name))')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase
          .from('tailor_profiles')
          .select('*, profiles!tailor_id(full_name, avatar_url, location)')
          .eq('verification_status', 'verified')
          .order('rating', { ascending: false })
          .limit(10),
      ]);

      if (featuredRes.error) throw featuredRes.error;
      if (productsRes.error) throw productsRes.error;
      if (nearbyRes.error) throw nearbyRes.error;

      setFeaturedTailors(featuredRes.data as any || []);
      setProducts(productsRes.data as any || []);
      setNearbyTailors(nearbyRes.data as any || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const userLocation = profile?.location || 'Lagos';
  const nearby = nearbyTailors.filter(t => t.profiles?.location === userLocation).slice(0, 5);
  const nearbyList = nearby.length > 0 ? nearby : nearbyTailors.slice(0, 5);

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Header */}
      <header className="px-5 pt-12 pb-4 sticky top-0 bg-white/95 backdrop-blur-md z-40">
        <div className="flex items-end justify-between mb-6">
          <div>
            <Link to="/">
              <Logo className="h-6 w-auto text-black" />
            </Link>
          </div>
          <div className="flex items-center text-[11px] font-sans font-medium uppercase tracking-widest text-zinc-400">
            <MapPin className="w-3 h-3 mr-1" /> {userLocation}
          </div>
        </div>

        {/* Minimal Search Bar */}
        <button
          onClick={() => navigate('/discover')}
          className="w-full flex items-center bg-zinc-50 border-none rounded-none py-3.5 px-4 text-left transition-colors hover:bg-zinc-100"
        >
          <Search className="w-4 h-4 text-zinc-400 mr-3" />
          <span className="text-sm font-sans text-zinc-400 tracking-wide">Search styles, tailors, fabrics...</span>
        </button>
      </header>

      {/* Elegant Categories */}
      <section className="px-5 py-6">
        <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/discover?category=${cat.slug}`)}
              className="flex flex-col items-center group shrink-0"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center transition-all group-hover:border-black group-hover:bg-black group-hover:text-white text-zinc-600 mb-2">
                <cat.Icon size={24} />
              </div>
              <span className="text-[10px] font-sans font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap group-hover:text-black">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {error ? (
        <ErrorState message="Could not connect to marketplace." onRetry={loadData} />
      ) : (
        <div className="space-y-16 pb-12">
          
          {/* Trending Styles - Edge to Edge Image Gallery */}
          <section>
            <div className="px-5 mb-4 flex items-end justify-between">
              <h2 className="font-serif text-2xl text-black">The Atelier</h2>
              <span className="text-[10px] font-sans uppercase tracking-widest text-zinc-400">Trending</span>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-4">
              {TRENDING_IMAGES.map((img, i) => (
                <div key={i} className="relative w-[240px] aspect-[4/5] bg-zinc-100 shrink-0 group overflow-hidden cursor-pointer">
                  <img 
                    src={img.url} 
                    alt={img.label} 
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-serif text-white text-lg">{img.label}</p>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-zinc-300 mt-1">Explore Style</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Tailors */}
          <section className="px-5">
            <div className="flex items-end justify-between mb-6 border-b border-zinc-100 pb-3">
              <h2 className="font-serif text-2xl text-black">Master Tailors</h2>
              <Link to="/discover" className="text-[10px] font-sans uppercase tracking-widest text-black flex items-center hover:text-zinc-500 transition-colors">
                View Directory <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <TailorCardSkeleton key={i} />)
                : featuredTailors.map((t) => <TailorCard key={t.id} tailor={t} />)}
            </div>
          </section>

          {/* Ready to Wear */}
          <section className="px-5">
            <div className="flex items-end justify-between mb-6 border-b border-zinc-100 pb-3">
              <h2 className="font-serif text-2xl text-black">Ready to Wear</h2>
              <Link to="/discover?type=ready_to_wear" className="text-[10px] font-sans uppercase tracking-widest text-black flex items-center hover:text-zinc-500 transition-colors">
                Shop All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>

          {/* Premium CTA */}
          <section className="px-5">
            <div className="bg-black p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
              <h2 className="font-serif text-3xl text-white mb-3">Bespoke Design</h2>
              <p className="font-sans text-sm text-zinc-400 mb-8 max-w-[250px] leading-relaxed">
                Connect directly with premium tailors to craft your unique vision.
              </p>
              <Link to="/discover" className="border border-white text-white font-sans text-xs uppercase tracking-widest py-4 px-8 hover:bg-white hover:text-black transition-colors">
                Commission a Piece
              </Link>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
