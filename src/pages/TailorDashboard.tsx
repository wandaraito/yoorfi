import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, Image as ImageIcon, Package, User as UserIcon, Wallet, Star,
  ChevronLeft, Plus, Trash2, X, Check, Clock, TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import {
  ORDER_STATUS_LABELS, CUSTOM_ORDER_STEPS, formatNGN, formatDate,
  type CustomOrder, type Product, type PortfolioItem, type Review, type TailorProfile,
} from '@/lib/types';
import { Skeleton, EmptyState, ErrorState } from '@/components/Feedback';

export function TailorDashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/portfolio" element={<PortfolioManager />} />
      <Route path="/products" element={<ProductsManager />} />
      <Route path="/profile" element={<StorefrontEditor />} />
      <Route path="/earnings" element={<EarningsView />} />
      <Route path="/reviews" element={<ReviewsView />} />
    </Routes>
  );
}

// ============ DASHBOARD HOME ============
function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tailorProfile, setTailorProfile] = useState<TailorProfile | null>(null);
  const [orders, setOrders] = useState<(CustomOrder & { profiles: { full_name: string; avatar_url: string | null } })[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: tp } = await supabase
        .from('tailor_profiles')
        .select('*')
        .eq('tailor_id', user.id)
        .maybeSingle();
      setTailorProfile(tp as TailorProfile | null);

      if (tp) {
        const { data: ords } = await supabase
          .from('custom_orders')
          .select('*, profiles!customer_id(full_name, avatar_url)')
          .eq('tailor_id', tp.id)
          .order('created_at', { ascending: false });
        setOrders(ords as any || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString());
  const earnings = completedOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);

  const navItems = [
    { icon: ShoppingBag, label: 'Orders', path: '' },
    { icon: ImageIcon, label: 'Portfolio', path: '/portfolio' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Wallet, label: 'Earnings', path: '/earnings' },
    { icon: Star, label: 'Reviews', path: '/reviews' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container-app pt-6 pb-4">
        <h1 className="font-display text-2xl font-semibold mb-1">Dashboard</h1>
        {tailorProfile && (
          <p className={`text-xs ${tailorProfile.verification_status === 'verified' ? 'text-sage-600' : 'text-clay-600'}`}>
            {tailorProfile.verification_status === 'verified' ? 'Verified' : 'Pending verification'}
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="container-app grid grid-cols-2 gap-3 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <MetricCard label="Today's Orders" value={String(todayOrders.length)} icon={<Clock className="w-4 h-4" />} />
            <MetricCard label="Active Orders" value={String(activeOrders.length)} icon={<ShoppingBag className="w-4 h-4" />} />
            <MetricCard label="Completed" value={String(completedOrders.length)} icon={<Check className="w-4 h-4" />} />
            <MetricCard label="Earnings" value={formatNGN(earnings)} icon={<Wallet className="w-4 h-4" />} />
            <MetricCard label="Rating" value={tailorProfile ? tailorProfile.rating.toFixed(1) : '0.0'} icon={<Star className="w-4 h-4" />} />
            <MetricCard label="Avg Delivery" value={tailorProfile ? `${tailorProfile.avg_delivery_days}d` : '-'} icon={<TrendingUp className="w-4 h-4" />} />
          </>
        )}
      </div>

      {/* Nav grid */}
      <div className="container-app grid grid-cols-3 gap-3 mb-6">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(`/tailor-dashboard${item.path}`)}
            className="card p-4 flex flex-col items-center gap-2 hover:shadow-card transition"
          >
            <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-ink-700" />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Recent orders */}
      <div className="container-app">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold">Recent Orders</h2>
        </div>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="w-7 h-7" />} title="No orders yet" description="When customers request custom outfits, they'll appear here." />
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 10).map((order) => (
              <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-ink-400 mb-1">{icon}<span className="text-[10px] uppercase tracking-wide">{label}</span></div>
      <p className="font-display text-xl font-semibold tabular">{value}</p>
    </div>
  );
}

function OrderCard({ order, onClick }: { order: CustomOrder & { profiles: { full_name: string; avatar_url: string | null } }; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card p-4 w-full text-left hover:shadow-card transition">
      <div className="flex items-center justify-between mb-1">
        <p className="font-medium text-sm">{order.clothing_type}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          order.status === 'completed' ? 'bg-sage-100 text-sage-700' :
          order.status === 'cancelled' ? 'bg-rust-50 text-rust-600' :
          'bg-clay-50 text-clay-700'
        }`}>{ORDER_STATUS_LABELS[order.status]}</span>
      </div>
      <p className="text-xs text-ink-500">{order.profiles?.full_name} · {formatDate(order.created_at)}</p>
      {order.final_price && <p className="text-sm font-semibold mt-1 tabular">{formatNGN(order.final_price)}</p>}
    </button>
  );
}

// ============ PORTFOLIO MANAGER ============
function PortfolioManager() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [tailorProfileId, setTailorProfileId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: tp } = await supabase.from('tailor_profiles').select('id').eq('tailor_id', user.id).maybeSingle();
      if (tp) {
        setTailorProfileId(tp.id);
        const { data } = await supabase.from('portfolio_items').select('*').eq('tailor_id', tp.id).order('sort_order');
        setItems(data as PortfolioItem[] || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function addImage() {
    if (!tailorProfileId || !imageUrl.trim()) { toast('Please enter an image URL', 'error'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('portfolio_items').insert({
        tailor_id: tailorProfileId,
        image_url: imageUrl.trim(),
        title: title.trim() || null,
        sort_order: items.length,
      }).select('*').single();
      if (error) throw error;
      setItems((prev) => [...prev, data as PortfolioItem]);
      setShowAdd(false);
      setImageUrl('');
      setTitle('');
      toast('Portfolio image added', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function removeImage(id: string) {
    await supabase.from('portfolio_items').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast('Image removed', 'info');
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header title="Portfolio" back="/tailor-dashboard" onAction={() => setShowAdd(true)} actionIcon={<Plus className="w-5 h-5" />} />
      <div className="container-app py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={<ImageIcon className="w-7 h-7" />} title="No portfolio images" description="Add images of your best work to showcase to customers." action={<button onClick={() => setShowAdd(true)} className="btn-primary text-sm">Add Image</button>} />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={item.image_url} alt={item.title || ''} className="w-full h-full object-cover" />
                <button onClick={() => removeImage(item.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-3.5 h-3.5 text-cream-50" />
                </button>
                {item.title && <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-ink-900/70 to-transparent"><p className="text-cream-50 text-xs">{item.title}</p></div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <Sheet title="Add Portfolio Image" onClose={() => setShowAdd(false)}>
          <div className="space-y-3">
            <div>
              <label className="label">Image URL</label>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="input" />
            </div>
            <div>
              <label className="label">Title (optional)</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blue Agbada" className="input" />
            </div>
            {imageUrl && <img src={imageUrl} alt="" className="w-full aspect-square rounded-xl object-cover" />}
            <button onClick={addImage} disabled={saving} className="btn-primary w-full">{saving ? 'Adding...' : 'Add Image'}</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ============ PRODUCTS MANAGER ============
function ProductsManager() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [tailorProfileId, setTailorProfileId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', compare_at_price: '', images: '', sizes: '', colors: '', stock: '10' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: tp } = await supabase.from('tailor_profiles').select('id').eq('tailor_id', user.id).maybeSingle();
      if (tp) {
        setTailorProfileId(tp.id);
        const { data } = await supabase.from('products').select('*').eq('tailor_id', tp.id).order('created_at', { ascending: false });
        setProducts(data as Product[] || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditing(null);
    setForm({ name: '', description: '', price: '', compare_at_price: '', images: '', sizes: '', colors: '', stock: '10' });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
      images: p.images.join(', '),
      sizes: p.sizes.join(', '),
      colors: p.colors.join(', '),
      stock: String(p.stock),
    });
    setShowForm(true);
  }

  async function save() {
    if (!tailorProfileId || !form.name.trim() || !form.price) { toast('Name and price are required', 'error'); return; }
    setSaving(true);
    try {
      const images = form.images.split(',').map((s) => s.trim()).filter(Boolean);
      const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
      const colors = form.colors.split(',').map((s) => s.trim()).filter(Boolean);
      const payload = {
        tailor_id: tailorProfileId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        images: images.length ? images : ['https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'],
        sizes, colors,
        stock: parseInt(form.stock) || 0,
        is_active: true,
      };
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast('Product updated', 'success');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast('Product added', 'success');
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(p: Product) {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    load();
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Header title="Products" back="/tailor-dashboard" onAction={openNew} actionIcon={<Plus className="w-5 h-5" />} />
      <div className="container-app py-4">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : products.length === 0 ? (
          <EmptyState icon={<Package className="w-7 h-7" />} title="No products" description="Add ready-to-wear items for customers to browse and buy." action={<button onClick={openNew} className="btn-primary text-sm">Add Product</button>} />
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="card p-3 flex items-center gap-3">
                <img src={p.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-sm font-semibold tabular">{formatNGN(p.price)}</p>
                  <p className="text-[10px] text-ink-400">{p.stock} in stock · {p.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <button onClick={() => openEdit(p)} className="text-xs text-clay-600 font-medium">Edit</button>
                <button onClick={() => toggleActive(p)} className="text-xs text-ink-500">{p.is_active ? 'Hide' : 'Show'}</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <Sheet title={editing ? 'Edit Product' : 'New Product'} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <div><label className="label">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ankara Maxi Dress" className="input" /></div>
            <div><label className="label">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input resize-none" /></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="label">Price (₦)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" /></div>
              <div className="flex-1"><label className="label">Compare at (₦)</label><input type="number" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })} className="input" /></div>
            </div>
            <div><label className="label">Image URLs (comma-separated)</label><input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..." className="input" /></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="label">Sizes (comma)</label><input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L" className="input" /></div>
              <div className="flex-1"><label className="label">Colors (comma)</label><input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Red, Blue" className="input" /></div>
            </div>
            <div><label className="label">Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" /></div>
            <button onClick={save} disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Product'}</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ============ STOREFRONT EDITOR ============
function StorefrontEditor() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [tp, setTp] = useState<TailorProfile | null>(null);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState(profile?.location || '');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [startingPrice, setStartingPrice] = useState('');
  const [avgDeliveryDays, setAvgDeliveryDays] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [coverUrl, setCoverUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: tpData } = await supabase.from('tailor_profiles').select('*').eq('tailor_id', user.id).maybeSingle();
      setTp(tpData as TailorProfile | null);
      if (tpData) {
        setBio(tpData.bio || '');
        setSpecialties(tpData.specialties || []);
        setStartingPrice(String(tpData.starting_price || ''));
        setAvgDeliveryDays(String(tpData.avg_delivery_days || ''));
        setCoverUrl(tpData.cover_image_url || '');
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('profiles').update({ full_name: fullName, location, avatar_url: avatarUrl || null }).eq('user_id', user.id);
      await refreshProfile();
      if (tp) {
        await supabase.from('tailor_profiles').update({
          bio, specialties, starting_price: parseFloat(startingPrice) || 0,
          avg_delivery_days: parseInt(avgDeliveryDays) || 7, cover_image_url: coverUrl || null,
        }).eq('id', tp.id);
      }
      toast('Storefront updated', 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container-app pt-6"><Skeleton className="h-64 rounded-2xl" /></div>;

  return (
    <div className="min-h-screen bg-cream-50">
      <Header title="Edit Storefront" back="/tailor-dashboard" />
      <div className="container-app py-4 space-y-4">
        <div><label className="label">Full Name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" /></div>
        <div><label className="label">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input resize-none" /></div>
        <div><label className="label">Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos" className="input" /></div>
        <div><label className="label">Avatar URL</label><input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="input" /></div>
        <div><label className="label">Cover Image URL</label><input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." className="input" /></div>
        <div>
          <label className="label">Specialties</label>
          <div className="flex gap-2 flex-wrap">
            {['Agbada', 'Senator', 'Dress', 'Shirt', 'Kaftan', 'Two-piece', 'Trousers'].map((s) => (
              <button key={s} onClick={() => setSpecialties((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                className={`chip ${specialties.includes(s) ? 'bg-ink-900 text-cream-50' : 'bg-white border border-ink-100 text-ink-600'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1"><label className="label">Starting Price (₦)</label><input type="number" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} className="input" /></div>
          <div className="flex-1"><label className="label">Avg Delivery (days)</label><input type="number" value={avgDeliveryDays} onChange={(e) => setAvgDeliveryDays(e.target.value)} className="input" /></div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save Storefront'}</button>
      </div>
    </div>
  );
}

// ============ EARNINGS ============
function EarningsView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: tp } = await supabase.from('tailor_profiles').select('id').eq('tailor_id', user.id).maybeSingle();
      if (tp) {
        const { data } = await supabase
          .from('payments')
          .select('*, custom_orders!inner(tailor_id)')
          .eq('custom_orders.tailor_id', tp.id)
          .eq('status', 'success')
          .order('created_at', { ascending: false });
        setPayments(data || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const pending = payments.filter((p) => new Date(p.created_at) > new Date(Date.now() - 7 * 86400000)).reduce((s, p) => s + p.amount, 0);
  const available = total - pending;

  return (
    <div className="min-h-screen bg-cream-50">
      <Header title="Earnings" back="/tailor-dashboard" />
      <div className="container-app py-4">
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="card p-4 text-center"><p className="font-display text-lg font-semibold tabular">{formatNGN(total)}</p><p className="text-[10px] text-ink-500">Total</p></div>
              <div className="card p-4 text-center"><p className="font-display text-lg font-semibold tabular text-clay-600">{formatNGN(pending)}</p><p className="text-[10px] text-ink-500">Pending</p></div>
              <div className="card p-4 text-center"><p className="font-display text-lg font-semibold tabular text-sage-600">{formatNGN(available)}</p><p className="text-[10px] text-ink-500">Available</p></div>
            </div>
            {payments.length === 0 ? (
              <EmptyState icon={<Wallet className="w-7 h-7" />} title="No earnings yet" description="Payments will appear here once orders are completed." />
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="card p-3 flex items-center justify-between">
                    <div><p className="text-sm font-medium">{formatNGN(p.amount)}</p><p className="text-xs text-ink-500">{formatDate(p.created_at)}</p></div>
                    <span className="text-xs text-sage-600 font-medium capitalize">{p.method}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============ REVIEWS ============
function ReviewsView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<(Review & { profiles: { full_name: string; avatar_url: string | null } })[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: tp } = await supabase.from('tailor_profiles').select('id').eq('tailor_id', user.id).maybeSingle();
      if (tp) {
        const { data } = await supabase.from('reviews').select('*, profiles!customer_id(full_name, avatar_url)').eq('tailor_id', tp.id).order('created_at', { ascending: false });
        setReviews(data as any || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-cream-50">
      <Header title="Reviews" back="/tailor-dashboard" />
      <div className="container-app py-4">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : reviews.length === 0 ? (
          <EmptyState icon={<Star className="w-7 h-7" />} title="No reviews yet" description="Reviews from completed orders will appear here." />
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-cream-100">{r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">{r.profiles?.full_name?.charAt(0)}</div>}</div>
                  <div className="flex-1"><p className="text-sm font-medium">{r.profiles?.full_name}</p><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-gold-400 text-gold-400' : 'text-ink-200'}`} />)}</div></div>
                </div>
                {r.comment && <p className="text-sm text-ink-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SHARED ============
function Header({ title, back, onAction, actionIcon }: { title: string; back: string; onAction?: () => void; actionIcon?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-ink-100">
      <div className="container-app flex items-center gap-3 py-3">
        <button onClick={() => navigate(back)} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="font-display text-base font-semibold flex-1">{title}</h1>
        {onAction && <button onClick={onAction} className="w-10 h-10 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center">{actionIcon}</button>}
      </div>
    </div>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4"><h2 className="font-display text-xl font-semibold">{title}</h2><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        {children}
      </div>
    </div>
  );
}
