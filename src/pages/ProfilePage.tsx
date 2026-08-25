import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Ruler, Heart, Star, Bell, LogOut, ChevronRight, MapPin, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import type { Favorite, Review, TailorProfile } from '@/lib/types';
import { Skeleton } from '@/components/Feedback';

export function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<(Favorite & { tailor_profiles: { profiles: { full_name: string; avatar_url: string | null } } })[]>([]);
  const [reviews, setReviews] = useState<(Review & { tailor_profiles: { profiles: { full_name: string } } })[]>([]);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [favRes, revRes] = await Promise.all([
        supabase
          .from('favorites')
          .select('*, tailor_profiles!inner(profiles!tailor_id(full_name, avatar_url))')
          .eq('user_id', user.id)
          .not('tailor_id', 'is', null),
        supabase
          .from('reviews')
          .select('*, tailor_profiles!inner(profiles!tailor_id(full_name))')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      setFavorites(favRes.data as any || []);
      setReviews(revRes.data as any || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setLocation(profile?.location || '');
  }, [profile]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone, location })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast('Profile updated', 'success');
      setEditing(false);
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', to: '/orders' },
    { icon: Ruler, label: 'Measurements', to: '/measurements' },
    { icon: Heart, label: 'Favorites', count: favorites.length },
    { icon: Star, label: 'My Reviews', count: reviews.length },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
  ];

  return (
    <div className="container-app">
      <h1 className="font-display text-2xl font-semibold pt-6 mb-6">Profile</h1>

      {/* Profile card */}
      <div className="card p-5 mb-5">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="label">Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." className="input" />
            </div>
            <div>
              <label className="label">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos" className="input" />
            </div>
            <div className="flex gap-3">
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-cream-100">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-display text-2xl">{profile?.full_name?.charAt(0) || '?'}</div>}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">{profile?.full_name || 'User'}</h2>
              <p className="text-sm text-ink-500">{user?.email}</p>
              {profile?.location && <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {profile.location}</p>}
            </div>
            <button onClick={() => setEditing(true)} className="btn-ghost text-sm">Edit</button>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="card divide-y divide-ink-100 mb-5">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => item.to && navigate(item.to)}
            className="w-full flex items-center gap-3 p-4 hover:bg-cream-50 transition text-left"
          >
            <item.icon className="w-5 h-5 text-ink-500" />
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            {item.count !== undefined && <span className="text-xs text-ink-400">{item.count}</span>}
            <ChevronRight className="w-4 h-4 text-ink-300" />
          </button>
        ))}
      </div>

      {/* Favorites preview */}
      {favorites.length > 0 && (
        <div className="mb-5">
          <h3 className="font-display text-sm font-semibold mb-2">Saved Tailors</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {favorites.slice(0, 5).map((fav) => {
              const tp = fav.tailor_profiles;
              return (
                <Link key={fav.id} to={`/tailor/${tp.id}`} className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-cream-100">
                    {tp.profiles?.avatar_url ? <img src={tp.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">{tp.profiles?.full_name?.charAt(0)}</div>}
                  </div>
                  <span className="text-[10px] text-ink-600 truncate w-14 text-center">{tp.profiles?.full_name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Sign out */}
      <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-ink-100 text-rust-600 hover:bg-rust-50 transition">
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Sign Out</span>
      </button>

      <p className="text-center text-xs text-ink-400 mt-6">yoorfit v1.0 · Discover. Design. Wear.</p>
    </div>
  );
}
