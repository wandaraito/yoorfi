import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Star, BadgeCheck, MapPin, Clock, Package, Heart, MessageCircle, Scissors } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import type { TailorProfile, PortfolioItem, Product, Service, Review } from '@/lib/types';
import { formatNGN } from '@/lib/types';
import { Skeleton, ErrorState, EmptyState } from '@/components/Feedback';
import { ProductCard } from '@/components/ProductCard';

type TabType = 'portfolio' | 'services' | 'ready_to_wear' | 'reviews';

export function TailorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tailor, setTailor] = useState<(TailorProfile & { profiles: { full_name: string; avatar_url: string | null; location: string | null } }) | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<(Product & { tailor_profiles: { profiles: { full_name: string } } })[]>([]);
  const [reviews, setReviews] = useState<(Review & { profiles: { full_name: string; avatar_url: string | null } })[]>([]);
  const [tab, setTab] = useState<TabType>('portfolio');
  const [isFavorite, setIsFavorite] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const [tailorRes, portfolioRes, servicesRes, productsRes, reviewsRes] = await Promise.all([
        supabase
          .from('tailor_profiles')
          .select('*, profiles!tailor_id(full_name, avatar_url, location)')
          .eq('id', id)
          .maybeSingle(),
        supabase.from('portfolio_items').select('*').eq('tailor_id', id).order('sort_order'),
        supabase.from('services').select('*').eq('tailor_id', id).eq('is_active', true),
        supabase
          .from('products')
          .select('*, tailor_profiles!inner(profiles!tailor_id(full_name))')
          .eq('tailor_id', id)
          .eq('is_active', true),
        supabase
          .from('reviews')
          .select('*, profiles!customer_id(full_name, avatar_url)')
          .eq('tailor_id', id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (tailorRes.error) throw tailorRes.error;
      if (!tailorRes.data) { setError(true); return; }

      setTailor(tailorRes.data as any);
      setPortfolio(portfolioRes.data || []);
      setServices(servicesRes.data || []);
      setProducts(productsRes.data as any || []);
      setReviews(reviewsRes.data as any || []);

      if (user) {
        const favRes = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('tailor_id', id)
          .maybeSingle();
        setIsFavorite(!!favRes.data);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { loadData(); }, [loadData]);

  async function toggleFavorite() {
    if (!user || !id) { navigate('/login'); return; }
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('tailor_id', id);
      setIsFavorite(false);
      toast('Removed from favorites', 'info');
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, tailor_id: id });
      setIsFavorite(true);
      toast('Added to favorites', 'success');
    }
  }

  async function startChat() {
    if (!user || !tailor) { navigate('/login'); return; }
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('customer_id', user.id)
      .eq('tailor_id', tailor.tailor_id)
      .maybeSingle();

    if (existing) {
      navigate(`/messages/${existing.id}`);
    } else {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ customer_id: user.id, tailor_id: tailor.tailor_id })
        .select('id')
        .single();
      if (!error && data) navigate(`/messages/${data.id}`);
    }
  }

  if (loading) return (
    <div className="container-app pt-6">
      <Skeleton className="h-48 rounded-2xl mb-4" />
      <Skeleton className="h-6 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  if (error || !tailor) return (
    <div className="container-app pt-6">
      <ErrorState message="Tailor not found." onRetry={() => navigate('/')} />
    </div>
  );

  const name = tailor.profiles?.full_name ?? 'Unknown';
  const avatar = tailor.profiles?.avatar_url;
  const location = tailor.profiles?.location ?? 'Nigeria';
  const isVerified = tailor.verification_status === 'verified';

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'portfolio', label: 'Portfolio', count: portfolio.length },
    { key: 'services', label: 'Services', count: services.length },
    { key: 'ready_to_wear', label: 'Ready to Wear', count: products.length },
    { key: 'reviews', label: 'Reviews', count: reviews.length },
  ];

  return (
    <div>
      {/* Cover */}
      <div className="relative h-48 bg-ink-900 overflow-hidden">
        {tailor.cover_image_url && (
          <img src={tailor.cover_image_url} alt={name} className="w-full h-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rust-500 text-rust-500' : 'text-ink-700'}`} />
        </button>
      </div>

      <div className="container-app -mt-12 relative">
        {/* Profile header */}
        <div className="flex items-end gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-cream-100 border-4 border-cream-50 shrink-0">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display text-3xl text-ink-400">{name.charAt(0)}</div>
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display text-xl font-semibold">{name}</h1>
              {isVerified && <BadgeCheck className="w-5 h-5 text-clay-500" />}
            </div>
            <div className="flex items-center gap-1 text-xs text-ink-500">
              <MapPin className="w-3 h-3" /> {location}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="card p-3 text-center">
            <div className="flex items-center justify-center gap-0.5 mb-0.5">
              <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
              <span className="text-sm font-semibold tabular">{tailor.rating.toFixed(1)}</span>
            </div>
            <p className="text-[10px] text-ink-500">Rating</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-sm font-semibold tabular">{tailor.completed_orders}</p>
            <p className="text-[10px] text-ink-500">Orders</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-sm font-semibold tabular">{tailor.years_experience}y</p>
            <p className="text-[10px] text-ink-500">Experience</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-sm font-semibold tabular">{tailor.avg_delivery_days}d</p>
            <p className="text-[10px] text-ink-500">Delivery</p>
          </div>
        </div>

        {tailor.bio && (
          <p className="text-sm text-ink-600 leading-relaxed mb-4">{tailor.bio}</p>
        )}

        {/* CTAs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => navigate(`/custom-order/${id}`)}
            className="btn-primary flex-1"
          >
            <Scissors className="w-4 h-4" /> Request Custom Outfit
          </button>
          <button onClick={startChat} className="btn-secondary px-4">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-ink-100 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                tab === t.key ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400'
              }`}
            >
              {t.label} {t.count > 0 && <span className="text-xs text-ink-400">({t.count})</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'portfolio' && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {portfolio.length === 0 ? (
              <div className="col-span-2"><EmptyState icon={<Package className="w-7 h-7" />} title="No portfolio yet" description="This tailor hasn't uploaded portfolio images." /></div>
            ) : (
              portfolio.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-ink-100 group">
                  <img src={item.image_url} alt={item.title || 'Portfolio'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-ink-900/70 to-transparent">
                      <p className="text-cream-50 text-xs font-medium">{item.title}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'services' && (
          <div className="space-y-3 mb-6">
            {services.length === 0 ? (
              <EmptyState icon={<Scissors className="w-7 h-7" />} title="No services listed" description="This tailor hasn't listed custom services yet." />
            ) : (
              services.map((s) => (
                <div key={s.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{s.name}</h3>
                    {s.description && <p className="text-xs text-ink-500 mt-0.5">{s.description}</p>}
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-ink-500">
                      <Clock className="w-3 h-3" /> {s.turnaround_days} days
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatNGN(s.base_price)}</p>
                    <button
                      onClick={() => navigate(`/custom-order/${id}?type=${encodeURIComponent(s.name)}`)}
                      className="text-xs text-clay-600 font-medium mt-1"
                    >
                      Request →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'ready_to_wear' && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {products.length === 0 ? (
              <div className="col-span-2"><EmptyState icon={<Package className="w-7 h-7" />} title="No products yet" description="This tailor hasn't listed ready-to-wear items." /></div>
            ) : (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-3 mb-6">
            {reviews.length === 0 ? (
              <EmptyState icon={<Star className="w-7 h-7" />} title="No reviews yet" description="Reviews will appear after completed orders." />
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-cream-100">
                      {r.profiles?.avatar_url ? (
                        <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-medium">{r.profiles?.full_name?.charAt(0)}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.profiles?.full_name || 'Anonymous'}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-gold-400 text-gold-400' : 'text-ink-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-ink-600 leading-relaxed">{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
