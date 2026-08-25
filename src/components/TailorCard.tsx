import { Star, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TailorProfile } from '@/lib/types';
import { formatNGN } from '@/lib/types';

interface TailorCardProps {
  tailor: TailorProfile & { profiles?: { full_name: string; avatar_url: string | null; location: string | null } };
  variant?: 'horizontal' | 'compact';
}

export function TailorCard({ tailor, variant = 'horizontal' }: TailorCardProps) {
  const name = tailor.profiles?.full_name ?? 'Unknown';
  const avatar = tailor.profiles?.avatar_url;
  const location = tailor.profiles?.location ?? 'Nigeria';
  const isVerified = tailor.verification_status === 'verified';
  const specialty = tailor.specialties?.[0] ?? 'Fashion Designer';

  if (variant === 'compact') {
    return (
      <Link to={`/tailor/${tailor.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-100 transition">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-ink-100 shrink-0">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-400 font-display text-lg">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="font-medium text-sm truncate">{name}</p>
            {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-clay-500 shrink-0" />}
          </div>
          <p className="text-xs text-ink-500 truncate">{specialty} · {location}</p>
        </div>
        <div className="flex items-center gap-0.5 text-xs">
          <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
          <span className="font-medium tabular">{tailor.rating.toFixed(1)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/tailor/${tailor.id}`}
      className="group block w-[260px] shrink-0 rounded-2xl bg-white border border-ink-100 shadow-soft overflow-hidden hover:shadow-card transition-all duration-300"
    >
      <div className="relative h-32 bg-ink-100 overflow-hidden">
        {tailor.cover_image_url ? (
          <img src={tailor.cover_image_url} alt={name} className="w-full h-full object-cover" />
        ) : avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-ink-900">
            <span className="font-display text-3xl text-cream-50">{name.charAt(0)}</span>
          </div>
        )}
        {isVerified && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2 py-1">
            <BadgeCheck className="w-3.5 h-3.5 text-clay-500" />
            <span className="text-[10px] font-semibold text-ink-900">Verified</span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">{name}</h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            <span className="text-xs font-medium tabular">{tailor.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-ink-500 mb-2 truncate">{specialty}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-500">{location}</span>
          <span className="text-xs font-medium text-ink-900">
            from <span className="font-semibold">{formatNGN(tailor.starting_price)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
