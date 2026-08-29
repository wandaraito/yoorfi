import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, Heart, Star, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ErrorState } from '@/components/Feedback';
import { Logo } from '@/components/Logo';

// Using your reference style for the hero
const HERO_SLIDES = [
  { 
    url: 'https://images.pexels.com/photos/35677043/pexels-photo-35677043.jpeg?auto=compress&cs=tinysrgb&w=800', 
    title: 'Welcome To Yoorfit!',
    subtitle: 'Premium Custom Tailoring' 
  },
  { 
    url: 'https://images.pexels.com/photos/20009925/pexels-photo-20009925.jpeg?auto=compress&cs=tinysrgb&w=800', 
    title: 'New Arrivals',
    subtitle: 'Shop Ready-to-Wear' 
  }
];

export function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [featuredTailors, setFeaturedTailors] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [productsRes, tailorsRes] = await Promise.all([
        supabase.from('products').select('*, tailor_profiles!inner(profiles!tailor_id(full_name))').eq('is_active', true).limit(6),
        supabase.from('tailor_profiles').select('*, profiles!tailor_id(full_name, avatar_url)').eq('verification_status', 'verified').limit(4)
      ]);
      setProducts(productsRes.data || []);
      setFeaturedTailors(tailorsRes.data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="bg-white min-h-screen font-sans pb-24">
      
      {/* Sleek Retail Header */}
      <header className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-50">
        <button className="p-1 -ml-1 text-black">
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex-1 flex justify-center">
          <Logo className="h-5 w-auto text-black" />
        </div>
        
        <button className="p-1 -mr-1 relative text-black" onClick={() => navigate('/cart')}>
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute top-0 right-0 bg-[#FF3B30] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            2
          </span>
        </button>
      </header>

      {error ? (
        <ErrorState message="Could not connect to marketplace." onRetry={loadData} />
      ) : (
        <div className="space-y-8">
          
          {/* Full-Width Hero Carousel */}
          <section>
            <div className="relative w-full h-[55vh] bg-zinc-100">
              <img 
                src={HERO_SLIDES[0].url} 
                alt="Hero" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              
              <div className="absolute bottom-12 left-5">
                <div className="w-0.5 h-6 bg-white mb-3"></div>
                <h1 className="text-white text-4xl font-bold leading-tight tracking-tight mb-1">
                  {HERO_SLIDES[0].title.split('!')[0]}!<br/>
                  {HERO_SLIDES[0].title.split('!')[1]}
                </h1>
                <p className="text-white text-xl font-medium">{HERO_SLIDES[0].subtitle}</p>
              </div>
            </div>
            
            {/* Pagination Dots */}
            <div className="flex justify-center items-center gap-1.5 mt-4">
              <div className="w-5 h-1.5 rounded-full border border-black bg-transparent"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            </div>
          </section>

          {/* Best Sellers (Ready to Wear) */}
          <section className="px-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">Best sellers</h2>
              <Link to="/discover" className="text-sm font-medium text-zinc-500 flex items-center">
                view all <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
              {loading ? (
                <div className="w-[160px] h-[220px] bg-zinc-100 animate-pulse shrink-0 rounded-md" />
              ) : (
                products.map((product, i) => (
                  <div key={i} className="shrink-0 w-[160px] cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    {/* Product Image Card */}
                    <div className="relative w-full aspect-[4/5] bg-[#F4F5F7] rounded-sm mb-3">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover mix-blend-multiply rounded-sm" />
                      )}
                      <button className="absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-black">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="absolute top-10 right-2 p-1.5 text-zinc-400 hover:text-black">
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Product Details */}
                    <div className="flex items-center gap-0.5 mb-1 text-[#FFB020]">
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 text-zinc-300" />
                      <span className="text-[10px] text-zinc-400 ml-1">(12)</span>
                    </div>
                    <h3 className="text-sm text-zinc-800 truncate mb-1">{product.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">₦{product.price?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Full Width Promo Banner */}
          <section className="mt-8">
            <div className="relative w-full h-[180px] bg-zinc-200 flex items-center px-5">
              <img 
                src="https://images.pexels.com/photos/37283114/pexels-photo-37283114.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Promo" 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40" />
              
              <div className="relative z-10 max-w-[200px]">
                <h2 className="text-white text-2xl font-bold leading-tight mb-4 shadow-sm">
                  Commission your next masterpiece!
                </h2>
                <button 
                  onClick={() => navigate('/discover')}
                  className="bg-white text-black text-xs font-bold px-6 py-2.5 rounded-full uppercase tracking-wide"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </section>

          {/* Featured Tailors */}
          <section className="px-5 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">Featured tailors</h2>
              <Link to="/discover" className="text-sm font-medium text-zinc-500 flex items-center">
                view all <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
              {loading ? (
                <div className="w-[160px] h-[220px] bg-zinc-100 animate-pulse shrink-0 rounded-md" />
              ) : (
                featuredTailors.map((tailor, i) => (
                  <div key={i} className="shrink-0 w-[160px] cursor-pointer" onClick={() => navigate(`/tailor/${tailor.id}`)}>
                    <div className="relative w-full aspect-square bg-zinc-100 rounded-sm mb-3">
                       <img 
                          src={tailor.profiles?.avatar_url || 'https://via.placeholder.com/150'} 
                          alt={tailor.profiles?.full_name} 
                          className="w-full h-full object-cover rounded-sm" 
                        />
                    </div>
                    <div className="flex items-center gap-0.5 mb-1 text-[#FFB020]">
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[10px] text-zinc-400 ml-1">({tailor.rating || '5.0'})</span>
                    </div>
                    <h3 className="text-sm font-bold text-black truncate">{tailor.profiles?.full_name}</h3>
                    <p className="text-xs text-zinc-500">Custom & Bespoke</p>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
