import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, Heart, Star, ChevronRight, ArrowRight, X, Home, Compass, Package, MessageSquare, User, Bell, Ruler } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { TailorProfile, Product } from '@/lib/types';
import { formatNGN } from '@/lib/types';
import { ErrorState, ProductCardSkeleton } from '@/components/Feedback';
import { Logo } from '@/components/Logo';
import { FadeImage } from '@/components/FadeImage';
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

const HERO_SLIDES = [
  {
    url: 'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=900',
    title: 'Discover',
    subtitle: 'Premium custom tailoring from verified Nigerian artisans',
  },
  {
    url: 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=900',
    title: 'New Arrivals',
    subtitle: 'Shop ready-to-wear from top designers',
  },
  {
    url: 'https://images.pexels.com/photos/38250931/pexels-photo-38250931.jpeg?auto=compress&cs=tinysrgb&w=900',
    title: 'Bespoke',
    subtitle: 'Commission your next masterpiece',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState<(Product & { tailor_profiles: { profiles: { full_name: string } } })[]>([]);
  const [featuredTailors, setFeaturedTailors] = useState<(TailorProfile & { profiles: { full_name: string; avatar_url: string | null; location: string | null } })[]>([]);
  const [nearbyTailors, setNearbyTailors] = useState<(TailorProfile & { profiles: { full_name: string; avatar_url: string | null; location: string | null } })[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [productsRes, tailorsRes, nearbyRes] = await Promise.all([
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
          .eq('is_featured', true)
          .order('rating', { ascending: false })
          .limit(8),
        supabase
          .from('tailor_profiles')
          .select('*, profiles!tailor_id(full_name, avatar_url, location)')
          .eq('verification_status', 'verified')
          .order('rating', { ascending: false })
          .limit(10),
      ]);
      if (productsRes.error) throw productsRes.error;
      if (tailorsRes.error) throw tailorsRes.error;
      if (nearbyRes.error) throw nearbyRes.error;
      setProducts(productsRes.data as any || []);
      setFeaturedTailors(tailorsRes.data as any || []);
      setNearbyTailors(nearbyRes.data as any || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-advance hero
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync hero scroll position (programmatic only — not user scroll)
  useEffect(() => {
    if (heroRef.current) {
      isAutoScrolling.current = true;
      heroRef.current.scrollTo({ left: heroIndex * heroRef.current.offsetWidth, behavior: 'smooth' });
      // Reset flag after smooth scroll settles
      const t = setTimeout(() => { isAutoScrolling.current = false; }, 400);
      return () => clearTimeout(t);
    }
  }, [heroIndex]);

  const userLocation = profile?.location || 'Nigeria';
  const nearby = nearbyTailors.filter(t => t.profiles?.location === userLocation).slice(0, 5);
  const nearbyList = nearby.length > 0 ? nearby : nearbyTailors.slice(0, 5);

  return (
    <div className="min-h-screen bg-canvas-100 pb-24">
      {/* Glass Header */}
      <header className="sticky top-0 z-50 glass-header border-b border-canvas-400/60">
        <div className="container-app flex items-center justify-between py-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-1 -ml-1 text-ink-900 active:scale-90 transition-transform duration-150"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <Link to="/" className="active:scale-95 transition-transform duration-150">
            <Logo />
          </Link>
          <button
            className="p-1 -mr-1 relative text-ink-900 active:scale-90 transition-transform duration-150"
            onClick={() => navigate('/orders')}
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 bg-crimson-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </button>
        </div>
      </header>

      {/* Kente accent strip */}
      <div className="h-1">
        <KentePattern className="w-full h-full" />
      </div>

      {error ? (
        <div className="container-app pt-6">
          <ErrorState message="Could not connect to marketplace." onRetry={loadData} />
        </div>
      ) : (
        <div className="container-app pt-4 space-y-8">
          {/* Search bar */}
          <button
            onClick={() => navigate('/discover')}
            className="w-full flex items-center gap-3 bg-white border border-canvas-400 px-4 py-3 text-left active:scale-[0.98] transition-transform duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#87836F" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21 L16 16" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-ink-400">Search tailors, styles, outfits...</span>
          </button>

          {/* Hero Carousel */}
          <section>
            <div
              ref={heroRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4"
              onScroll={(e) => {
                if (isAutoScrolling.current) return;
                const idx = Math.round(e.currentTarget.scrollLeft / e.currentTarget.offsetWidth);
                setHeroIndex(idx);
              }}
            >
              {HERO_SLIDES.map((slide, i) => (
                <div key={i} className="relative w-full shrink-0 snap-center h-[52vh] min-h-[360px]">
                  <FadeImage
                    src={slide.url}
                    alt={slide.title}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/20 to-transparent" />
                  <div className="absolute bottom-8 left-4 right-4">
                    <div className="w-6 h-0.5 bg-canvas-50 mb-3" />
                    <h1 className="font-display text-3xl font-semibold text-canvas-50 leading-tight mb-1">
                      {slide.title}
                    </h1>
                    <p className="text-canvas-200 text-sm">{slide.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination indicator */}
            <div className="flex justify-center items-center gap-1.5 mt-3">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`transition-all duration-300 ${
                    i === heroIndex
                      ? 'w-5 h-1.5 bg-ink-900'
                      : 'w-1.5 h-1.5 bg-canvas-400'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Categories */}
          <section>
            <h2 className="font-display text-base font-semibold mb-3">Browse by category</h2>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => navigate(`/discover?category=${cat.slug}`)}
                  className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform duration-150"
                >
                  <div className="w-14 h-14 bg-white border border-canvas-400 flex items-center justify-center">
                    <cat.Icon size={26} />
                  </div>
                  <span className="text-[10px] text-ink-600 font-medium whitespace-nowrap">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Best Sellers / Ready to Wear */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold">Ready to wear</h2>
              <Link to="/discover?type=ready_to_wear" className="text-xs text-ink-500 flex items-center gap-0.5 active:scale-95 transition-transform">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.slice(0, 6).map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="group block active:scale-[0.97] transition-transform duration-150 ease-out">
                      <div className="relative aspect-[4/5] bg-canvas-200 mb-2 overflow-hidden">
                        {p.images?.[0] ? (
                          <FadeImage src={p.images[0]} alt={p.name} className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-300">
                            <span className="text-xs tracking-caption">No image</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => { e.preventDefault(); }}
                          className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors active:scale-90"
                        >
                          <Heart className="w-4 h-4 text-ink-700" />
                        </button>
                      </div>
                      <div>
                        <p className="tracking-caption text-ink-400 mb-0.5">{p.tailor_profiles?.profiles?.full_name}</p>
                        <h3 className="text-sm font-medium leading-snug line-clamp-1">{p.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-sm font-bold tabular">{formatNGN(p.price)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </section>

          {/* Promo Banner */}
          <section className="-mx-4">
            <div className="relative h-[180px] overflow-hidden">
              <FadeImage
                src="https://images.pexels.com/photos/37283114/pexels-photo-37283114.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Commission your next masterpiece"
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-ink-900/50" />
              <div className="absolute inset-0 flex items-center px-5">
                <div className="max-w-[220px]">
                  <h2 className="font-display text-2xl font-semibold text-canvas-50 leading-tight mb-4">
                    Commission your next masterpiece
                  </h2>
                  <button
                    onClick={() => navigate('/discover')}
                    className="bg-canvas-50 text-ink-900 text-xs font-bold px-6 py-2.5 uppercase tracking-[0.12em] active:scale-95 transition-transform duration-150"
                  >
                    Start now
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Tailors */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold">Featured tailors</h2>
              <Link to="/discover" className="text-xs text-ink-500 flex items-center gap-0.5 active:scale-95 transition-transform">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 pb-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[160px] shrink-0">
                      <div className="aspect-square bg-canvas-200 skeleton mb-2" />
                      <div className="h-3 w-3/4 skeleton mb-1" />
                      <div className="h-3 w-1/2 skeleton" />
                    </div>
                  ))
                : featuredTailors.map((t) => (
                    <Link
                      key={t.id}
                      to={`/tailor/${t.id}`}
                      className="group w-[160px] shrink-0 snap-start active:scale-[0.97] transition-transform duration-150 ease-out"
                    >
                      <div className="relative aspect-square bg-canvas-200 mb-2 overflow-hidden">
                        {t.profiles?.avatar_url ? (
                          <FadeImage src={t.profiles.avatar_url} alt={t.profiles.full_name} className="w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-ink-900">
                            <span className="font-display text-2xl text-canvas-50">
                              {t.profiles?.full_name?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                        <span className="text-[10px] text-ink-500 tabular">{t.rating?.toFixed(1) ?? '5.0'}</span>
                      </div>
                      <h3 className="text-sm font-medium text-ink-900 truncate">{t.profiles?.full_name}</h3>
                      <p className="text-xs text-ink-500 truncate">
                        from {formatNGN(t.starting_price)}
                      </p>
                    </Link>
                  ))}
            </div>
          </section>

          {/* Nearby Tailors */}
          <section>
            <h2 className="font-display text-base font-semibold mb-3">Nearby tailors</h2>
            <div className="card divide-y divide-canvas-400">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="w-12 h-12 rounded-full bg-canvas-200 skeleton" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 skeleton" />
                        <div className="h-3 w-1/2 skeleton" />
                      </div>
                    </div>
                  ))
                : nearbyList.map((t) => (
                    <Link
                      key={t.id}
                      to={`/tailor/${t.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-canvas-200 transition-colors active:scale-[0.98] duration-150"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-canvas-200 shrink-0">
                        {t.profiles?.avatar_url ? (
                          <img src={t.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-ink-400 font-display text-lg">
                            {t.profiles?.full_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-0 flex-1">
                        <p className="font-medium text-sm truncate">{t.profiles?.full_name}</p>
                        <p className="text-xs text-ink-500 truncate">
                          {t.specialties?.[0] ?? 'Fashion'} · {t.profiles?.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 text-xs">
                        <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                        <span className="font-medium tabular">{t.rating?.toFixed(1)}</span>
                      </div>
                    </Link>
                  ))}
            </div>
          </section>

          {/* CTA */}
          <section>
            <div className="relative bg-ink-900 p-6 text-center overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 opacity-60">
                <KentePattern className="w-full h-full" />
              </div>
              <div className="relative pt-3">
                <h2 className="font-display text-xl text-canvas-50 font-semibold mb-1">
                  Create your own outfit
                </h2>
                <p className="text-canvas-300 text-sm mb-4 max-w-xs mx-auto">
                  Tell us what you want. We'll match you with the perfect tailor.
                </p>
                <Link
                  to="/discover"
                  className="inline-flex items-center gap-2 bg-canvas-50 text-ink-900 px-6 py-3 text-sm font-medium hover:bg-white transition-colors active:scale-95 duration-150"
                >
                  Start designing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white flex flex-col animate-slide-in-left">
            <div className="flex items-center justify-between p-4 border-b border-canvas-400">
              <span className="font-display text-lg font-semibold">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="active:scale-90 transition-transform duration-150">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {[
                { icon: Home, label: 'Home', to: '/' },
                { icon: Compass, label: 'Discover', to: '/discover' },
                { icon: Package, label: 'My Orders', to: '/orders' },
                { icon: MessageSquare, label: 'Messages', to: '/messages' },
                { icon: User, label: 'Profile', to: '/profile' },
                { icon: Ruler, label: 'Measurements', to: '/measurements' },
                { icon: Bell, label: 'Notifications', to: '/notifications' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-canvas-200 active:scale-[0.98] transition-all duration-150"
                >
                  <item.icon className="w-5 h-5 text-ink-600" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-canvas-400">
              <p className="text-center text-xs text-ink-400 tracking-caption">yoorfit · Discover. Design. Wear.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
