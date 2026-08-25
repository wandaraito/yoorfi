import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { TailorProfile, Product, Category } from '@/lib/types';
import { TailorCard } from '@/components/TailorCard';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton, TailorCardSkeleton, ProductCardSkeleton, ErrorState } from '@/components/Feedback';
import { Logo } from '@/components/Logo';
import {
  IconReadyToWear, IconCustom, IconMen, IconWomen, IconNative,
  IconDress, IconAgbada, IconSenator, IconShirt, IconTrousers,
  IconBell, KentePattern,
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
  'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37283114/pexels-photo-37283114.jpeg?auto=compress&cs=tinysrgb&w=600',
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

  const userLocation = profile?.location || 'Nigeria';
  const nearby = nearbyTailors.filter(t => t.profiles?.location === userLocation).slice(0, 5);
  const nearbyList = nearby.length > 0 ? nearby : nearbyTailors.slice(0, 5);

  return (
    <div className="container-app">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-4">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-ink-500 flex items-center gap-1 justify-end">
              <MapPin className="w-3 h-3" /> {userLocation}
            </p>
          </div>
          <Link to="/notifications" className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center shadow-soft">
            <IconBell size={20} />
          </Link>
        </div>
      </div>

      {/* Kente accent strip */}
      <div className="-mx-4 mb-5 h-2 opacity-80">
        <KentePattern className="w-full h-full" />
      </div>

      {/* Search */}
      <button
        onClick={() => navigate('/discover')}
        className="w-full flex items-center gap-3 bg-white border border-ink-100 rounded-full px-5 py-3.5 shadow-soft text-left mb-6"
      >
        <Search className="w-4 h-4 text-ink-400" />
        <span className="text-sm text-ink-400">Search tailors, styles, outfits...</span>
      </button>

      {/* Categories */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => navigate(`/discover?category=${cat.slug}`)}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-ink-100 flex items-center justify-center shadow-soft">
              <cat.Icon size={28} />
            </div>
            <span className="text-[10px] text-ink-600 font-medium whitespace-nowrap">{cat.name}</span>
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message="Failed to load marketplace. Please try again." onRetry={loadData} />
      ) : (
        <>
          {/* Featured Tailors */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Featured Tailors</h2>
              <Link to="/discover" className="text-xs text-ink-500 flex items-center gap-1">
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <TailorCardSkeleton key={i} />)
                : featuredTailors.map((t) => <TailorCard key={t.id} tailor={t} />)}
            </div>
          </section>

          {/* Trending Styles */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-semibold mb-3">Trending Styles</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
              {TRENDING_IMAGES.map((img, i) => (
                <div key={i} className="relative w-[200px] h-[280px] rounded-2xl overflow-hidden shrink-0 group">
                  <img src={img} alt="Trending style" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-cream-50 text-sm font-medium">
                      {['Blue Agbada', 'Ankara Dress', 'Royal Blue', 'Beaded Senator'][i]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Ready to Wear */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Ready to Wear</h2>
              <Link to="/discover?type=ready_to_wear" className="text-xs text-ink-500 flex items-center gap-1">
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>

          {/* Nearby Tailors */}
          <section className="mb-8">
            <h2 className="font-display text-lg font-semibold mb-3">Nearby Tailors</h2>
            <div className="card divide-y divide-ink-100">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                : nearbyList.map((t) => <TailorCard key={t.id} tailor={t} variant="compact" />)}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-8">
            <div className="relative rounded-3xl overflow-hidden bg-ink-900 p-6 text-center">
              <div className="absolute inset-0 opacity-20">
                <img src="https://images.pexels.com/photos/9849641/pexels-photo-9849641.jpeg?auto=compress&cs=tinysrgb&w=800" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-0 left-0 right-0 h-2 opacity-60">
                <KentePattern className="w-full h-full" />
              </div>
              <div className="relative pt-2">
                <div className="w-12 h-12 rounded-full bg-cream-50/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-cream-50" />
                </div>
                <h2 className="font-display text-xl text-cream-50 font-semibold mb-1">Create Your Own Outfit</h2>
                <p className="text-cream-300 text-sm mb-4">Tell us what you want. We'll match you with the perfect tailor.</p>
                <Link to="/discover" className="inline-flex items-center gap-2 bg-cream-50 text-ink-900 rounded-full px-6 py-3 text-sm font-medium hover:bg-cream-100 transition">
                  Start Designing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
