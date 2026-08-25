import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TailorProfile, Product, NIGERIAN_CITIES } from '@/lib/types';
import { NIGERIAN_CITIES as CITIES, formatNGN } from '@/lib/types';
import { TailorCard } from '@/components/TailorCard';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton, ErrorState, EmptyState } from '@/components/Feedback';

type Tab = 'all' | 'tailors' | 'products';
type SortBy = 'recommended' | 'rating' | 'price_low' | 'price_high';

export function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [tab, setTab] = useState<Tab>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tailors, setTailors] = useState<(TailorProfile & { profiles: { full_name: string; avatar_url: string | null; location: string | null } })[]>([]);
  const [products, setProducts] = useState<(Product & { tailor_profiles: { profiles: { full_name: string } } })[]>([]);

  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recommended');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      let tailorQuery = supabase
        .from('tailor_profiles')
        .select('*, profiles!tailor_id(full_name, avatar_url, location)')
        .eq('verification_status', 'verified');

      let productQuery = supabase
        .from('products')
        .select('*, tailor_profiles!inner(profiles!tailor_id(full_name))')
        .eq('is_active', true);

      if (query) {
        tailorQuery = tailorQuery.or(`specialties.cs.{${query}},bio.ilike.%${query}%`);
        productQuery = productQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (filterLocation) {
        tailorQuery = tailorQuery.eq('profiles.location', filterLocation);
      }

      if (filterVerified) {
        tailorQuery = tailorQuery.eq('verification_status', 'verified');
      }

      if (filterMinPrice) {
        productQuery = productQuery.gte('price', parseInt(filterMinPrice));
      }
      if (filterMaxPrice) {
        productQuery = productQuery.lte('price', parseInt(filterMaxPrice));
      }

      if (sortBy === 'rating') {
        tailorQuery = tailorQuery.order('rating', { ascending: false });
      } else if (sortBy === 'price_low') {
        tailorQuery = tailorQuery.order('starting_price', { ascending: true });
        productQuery = productQuery.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        tailorQuery = tailorQuery.order('starting_price', { ascending: false });
        productQuery = productQuery.order('price', { ascending: false });
      } else {
        tailorQuery = tailorQuery.order('is_featured', { ascending: false }).order('rating', { ascending: false });
        productQuery = productQuery.order('created_at', { ascending: false });
      }

      const [tailorRes, productRes] = await Promise.all([
        tailorQuery.limit(30),
        productQuery.limit(30),
      ]);

      if (tailorRes.error) throw tailorRes.error;
      if (productRes.error) throw productRes.error;

      setTailors(tailorRes.data as any || []);
      setProducts(productRes.data as any || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query, filterLocation, filterVerified, filterMinPrice, filterMaxPrice, sortBy]);

  useEffect(() => { loadData(); }, [loadData]);

  const activeFilterCount = (filterLocation ? 1 : 0) + (filterVerified ? 1 : 0) + (filterMinPrice ? 1 : 0) + (filterMaxPrice ? 1 : 0);

  return (
    <div className="container-app">
      <div className="flex items-center gap-3 pt-6 pb-4">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tailors, styles, outfits..."
            className="input pl-11 pr-4"
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="relative w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ink-900 text-cream-50 text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'tailors', 'products'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`chip ${tab === t ? 'bg-ink-900 text-cream-50' : 'bg-white text-ink-600 border border-ink-100'}`}
          >
            {t === 'all' ? 'All' : t === 'tailors' ? 'Tailors' : 'Products'}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {([
          ['recommended', 'Recommended'],
          ['rating', 'Highest Rated'],
          ['price_low', 'Lowest Price'],
          ['price_high', 'Highest Price'],
        ] as [SortBy, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setSortBy(val)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition ${sortBy === val ? 'bg-ink-100 text-ink-900 font-medium' : 'text-ink-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message="Failed to load results." onRetry={loadData} />
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <TailorCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {(tab === 'all' || tab === 'tailors') && tailors.length > 0 && (
            <div className="mb-6">
              {tab === 'all' && <h2 className="font-display text-lg font-semibold mb-3">Tailors</h2>}
              <div className="space-y-3">
                {tailors.map((t) => <TailorCard key={t.id} tailor={t} variant="compact" />)}
              </div>
            </div>
          )}

          {(tab === 'all' || tab === 'products') && products.length > 0 && (
            <div>
              {tab === 'all' && <h2 className="font-display text-lg font-semibold mb-3">Products</h2>}
              <div className="grid grid-cols-2 gap-3">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {tab !== 'products' && tailors.length === 0 && tab !== 'all' && (
            <EmptyState icon={<Search className="w-7 h-7" />} title="No tailors found" description="Try adjusting your search or filters." />
          )}
          {tab === 'products' && products.length === 0 && (
            <EmptyState icon={<Search className="w-7 h-7" />} title="No products found" description="Try adjusting your search or filters." />
          )}
          {tab === 'all' && tailors.length === 0 && products.length === 0 && (
            <EmptyState icon={<Search className="w-7 h-7" />} title="No results found" description="Try a different search term or adjust your filters." />
          )}
        </>
      )}

      {/* Filter Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setShowFilters(false)} />
          <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-semibold">Filters</h2>
              <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="label">Location</label>
                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="input">
                  <option value="">All locations</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Price range (₦)</label>
                <div className="flex gap-3">
                  <input type="number" placeholder="Min" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)} className="input" />
                  <input type="number" placeholder="Max" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)} className="input" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={filterVerified} onChange={(e) => setFilterVerified(e.target.checked)} className="w-5 h-5 rounded accent-ink-900" />
                <span className="text-sm font-medium">Verified tailors only</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setFilterLocation(''); setFilterVerified(false); setFilterMinPrice(''); setFilterMaxPrice(''); }}
                className="btn-secondary flex-1"
              >
                Clear all
              </button>
              <button onClick={() => setShowFilters(false)} className="btn-primary flex-1">
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
