import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import type { Product } from '@/lib/types';
import { formatNGN } from '@/lib/types';
import { FadeImage } from '@/components/FadeImage';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const tailorName = product.tailor_profiles?.profiles?.full_name;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / (product.compare_at_price as number)) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="group block active:scale-[0.97] transition-transform duration-150 ease-out">
      <div className="relative aspect-[4/5] bg-canvas-200 mb-2 overflow-hidden">
        {image ? (
          <FadeImage
            src={image}
            alt={product.name}
            className="w-full h-full"
            imgClassName=""
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-300">
            <span className="text-xs tracking-caption">No image</span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-crimson-500 text-white text-[10px] font-bold px-2 py-0.5 tracking-caption">
            -{discountPct}%
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
        <p className="tracking-caption text-ink-400 mb-0.5">{tailorName}</p>
        <h3 className="text-sm font-medium leading-snug line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-sm font-bold tabular">{formatNGN(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-ink-400 line-through tabular">{formatNGN(product.compare_at_price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
