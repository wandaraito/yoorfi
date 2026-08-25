import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, ShoppingBag, Star, Plus, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import type { Product } from '@/lib/types';
import { formatNGN } from '@/lib/types';
import { Skeleton, ErrorState } from '@/components/Feedback';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [product, setProduct] = useState<(Product & { tailor_profiles: { profiles: { full_name: string; avatar_url: string | null; location: string | null }; id: string } }) | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, tailor_profiles!inner(profiles!tailor_id(full_name, avatar_url, location), id)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) { setError(true); return; }
      setProduct(data as any);
      if (data.sizes?.length) setSelectedSize(data.sizes[0]);
      if (data.colors?.length) setSelectedColor(data.colors[0]);

      if (user) {
        const fav = await supabase.from('favorites').select('id').eq('user_id', user.id).eq('product_id', id).maybeSingle();
        setIsFavorite(!!fav.data);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  async function toggleFavorite() {
    if (!user || !id) { navigate('/login'); return; }
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, product_id: id });
      setIsFavorite(true);
      toast('Added to favorites', 'success');
    }
  }

  async function buyNow() {
    if (!user) { navigate('/login'); return; }
    if (!product) return;
    if (product.stock === 0) { toast('Out of stock', 'error'); return; }
    navigate(`/checkout/product/${product.id}?size=${encodeURIComponent(selectedSize)}&color=${encodeURIComponent(selectedColor)}&qty=${quantity}`);
  }

  if (loading) return (
    <div className="container-app pt-6">
      <Skeleton className="aspect-square rounded-2xl mb-4" />
      <Skeleton className="h-6 w-2/3 mb-2" />
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  if (error || !product) return (
    <div className="container-app pt-6">
      <ErrorState message="Product not found." onRetry={() => navigate('/')} />
    </div>
  );

  const tailorName = product.tailor_profiles?.profiles?.full_name;
  const tailorAvatar = product.tailor_profiles?.profiles?.avatar_url;
  const tailorId = product.tailor_profiles?.id;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="container-app pb-8">
      <div className="flex items-center justify-between pt-4 pb-3">
        <button onClick={() => window.history.back()} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={toggleFavorite} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rust-500 text-rust-500' : 'text-ink-700'}`} />
        </button>
      </div>

      {/* Image gallery */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-ink-100 mb-3">
        <img src={product.images[selectedImage] || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        {hasDiscount && (
          <div className="absolute top-3 left-3 rounded-full bg-rust-500 text-white text-xs font-bold px-3 py-1">
            -{Math.round((1 - product.price / (product.compare_at_price as number)) * 100)}%
          </div>
        )}
      </div>
      {product.images.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${selectedImage === i ? 'border-ink-900' : 'border-transparent'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Tailor info */}
      {tailorId && (
        <button
          onClick={() => navigate(`/tailor/${tailorId}`)}
          className="flex items-center gap-3 p-3 card mb-4 w-full"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden bg-cream-100">
            {tailorAvatar ? <img src={tailorAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-medium">{tailorName?.charAt(0)}</div>}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">{tailorName}</p>
            <p className="text-xs text-ink-500">View tailor profile</p>
          </div>
          <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
        </button>
      )}

      {/* Product info */}
      <h1 className="font-display text-xl font-semibold mb-1">{product.name}</h1>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl font-semibold tabular">{formatNGN(product.price)}</span>
        {hasDiscount && <span className="text-base text-ink-400 line-through tabular">{formatNGN(product.compare_at_price)}</span>}
      </div>

      {product.description && (
        <p className="text-sm text-ink-600 leading-relaxed mb-4">{product.description}</p>
      )}

      {/* Sizes */}
      {product.sizes.length > 0 && (
        <div className="mb-4">
          <p className="label">Size</p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${selectedSize === s ? 'bg-ink-900 text-cream-50 border-ink-900' : 'bg-white text-ink-700 border-ink-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {product.colors.length > 0 && (
        <div className="mb-4">
          <p className="label">Color</p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition ${selectedColor === c ? 'bg-ink-900 text-cream-50 border-ink-900' : 'bg-white text-ink-700 border-ink-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mb-6">
        <p className="label">Quantity</p>
        <div className="flex items-center gap-4">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl border border-ink-200 flex items-center justify-center">
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-lg font-medium tabular w-8 text-center">{quantity}</span>
          <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 rounded-xl border border-ink-200 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-xs text-ink-500 ml-2">{product.stock} in stock</span>
        </div>
      </div>

      {/* Buy button */}
      <button onClick={buyNow} className="btn-primary w-full">
        <ShoppingBag className="w-4 h-4" /> Buy Now · {formatNGN(product.price * quantity)}
      </button>
    </div>
  );
}
