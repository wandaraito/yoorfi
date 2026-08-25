import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Users, Scissors, ShoppingBag, Wallet, Star, ShieldCheck, AlertTriangle,
  ChevronLeft, Check, X, Eye, Ban, TrendingUp, BadgeCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast';
import {
  ORDER_STATUS_LABELS, formatNGN, formatDate,
  type TailorProfile, type CustomOrder, type Profile, type Dispute,
} from '@/lib/types';
import { Skeleton, EmptyState, ErrorState } from '@/components/Feedback';

export function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      <Route path="/tailors" element={<TailorManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/orders" element={<OrderManagement />} />
      <Route path="/disputes" element={<DisputeManagement />} />
    </Routes>
  );
}

// ============ ADMIN HOME ============
function AdminHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, tailors: 0, verified: 0, activeOrders: 0, completedOrders: 0, revenue: 0, disputes: 0, pendingTailors: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, tailorsRes, verifiedRes, pendingRes, activeRes, completedRes, revRes, dispRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tailor_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tailor_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('tailor_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('custom_orders').select('id', { count: 'exact', head: true }).not('status', 'in', '("completed","cancelled")'),
        supabase.from('custom_orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('payments').select('amount').eq('status', 'success'),
        supabase.from('disputes').select('id', { count: 'exact', head: true }).in('status', ['open', 'investigating']),
      ]);

      setStats({
        users: usersRes.count || 0,
        tailors: tailorsRes.count || 0,
        verified: verifiedRes.count || 0,
        pendingTailors: pendingRes.count || 0,
        activeOrders: activeRes.count || 0,
        completedOrders: completedRes.count || 0,
        revenue: (revRes.data || []).reduce((s: number, p: any) => s + p.amount, 0),
        disputes: dispRes.count || 0,
      });
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const navItems = [
    { icon: Scissors, label: 'Tailors', path: '/tailors', badge: stats.pendingTailors },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: AlertTriangle, label: 'Disputes', path: '/disputes', badge: stats.disputes },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="container-wide pt-6 pb-4">
        <h1 className="font-display text-2xl font-semibold mb-1">Admin Dashboard</h1>
        <p className="text-sm text-ink-500">Platform overview and management</p>
      </div>

      {/* Stats grid */}
      <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Total Users" value={String(stats.users)} icon={<Users className="w-4 h-4" />} />
            <StatCard label="Total Tailors" value={String(stats.tailors)} icon={<Scissors className="w-4 h-4" />} />
            <StatCard label="Verified Tailors" value={String(stats.verified)} icon={<BadgeCheck className="w-4 h-4" />} />
            <StatCard label="Pending Approval" value={String(stats.pendingTailors)} icon={<ShieldCheck className="w-4 h-4" />} highlight={stats.pendingTailors > 0} />
            <StatCard label="Active Orders" value={String(stats.activeOrders)} icon={<ShoppingBag className="w-4 h-4" />} />
            <StatCard label="Completed Orders" value={String(stats.completedOrders)} icon={<Check className="w-4 h-4" />} />
            <StatCard label="Revenue" value={formatNGN(stats.revenue)} icon={<Wallet className="w-4 h-4" />} />
            <StatCard label="Open Disputes" value={String(stats.disputes)} icon={<AlertTriangle className="w-4 h-4" />} highlight={stats.disputes > 0} />
          </>
        )}
      </div>

      {/* Nav */}
      <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-3">
        {navItems.map((item) => (
          <button key={item.label} onClick={() => navigate(`/admin${item.path}`)} className="card p-4 flex flex-col items-center gap-2 hover:shadow-card transition relative">
            {item.badge ? <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rust-500 text-cream-50 text-[10px] flex items-center justify-center font-bold">{item.badge}</span> : null}
            <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center"><item.icon className="w-5 h-5 text-ink-700" /></div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }: { label: string; value: string; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight ? 'border-clay-300' : ''}`}>
      <div className="flex items-center gap-1.5 text-ink-400 mb-1">{icon}<span className="text-[10px] uppercase tracking-wide">{label}</span></div>
      <p className="font-display text-xl font-semibold tabular">{value}</p>
    </div>
  );
}

// ============ TAILOR MANAGEMENT ============
function TailorManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [tailors, setTailors] = useState<(TailorProfile & { profiles: { full_name: string; avatar_url: string | null; location: string | null } })[]>([]);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'all'>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('tailor_profiles').select('*, profiles!tailor_id(full_name, avatar_url, location)');
      if (filter !== 'all') query = query.eq('verification_status', filter);
      const { data } = await query.order('created_at', { ascending: false });
      setTailors(data as any || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: string) {
    const { error } = await supabase.from('tailor_profiles').update({ verification_status: 'verified' }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Tailor verified', 'success');
    load();
  }

  async function reject(id: string) {
    const { error } = await supabase.from('tailor_profiles').update({ verification_status: 'rejected' }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Tailor rejected', 'info');
    load();
  }

  async function suspend(id: string) {
    const { error } = await supabase.from('tailor_profiles').update({ verification_status: 'suspended' }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Tailor suspended', 'info');
    load();
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminHeader title="Tailor Management" />
      <div className="container-wide py-4">
        <div className="flex gap-2 mb-4">
          {(['pending', 'verified', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`chip ${filter === f ? 'bg-ink-900 text-cream-50' : 'bg-white border border-ink-100 text-ink-600'}`}>
              {f === 'pending' ? 'Pending' : f === 'verified' ? 'Verified' : 'All'}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        ) : tailors.length === 0 ? (
          <EmptyState icon={<Scissors className="w-7 h-7" />} title="No tailors found" description={`No ${filter} tailors at this time.`} />
        ) : (
          <div className="space-y-2">
            {tailors.map((t) => (
              <div key={t.id} className="card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-cream-100 shrink-0">
                  {t.profiles?.avatar_url ? <img src={t.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">{t.profiles?.full_name?.charAt(0)}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{t.profiles?.full_name}</p>
                  <p className="text-xs text-ink-500">{t.profiles?.location} · {t.specialties?.join(', ') || 'No specialties'}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    t.verification_status === 'verified' ? 'bg-sage-100 text-sage-700' :
                    t.verification_status === 'pending' ? 'bg-clay-50 text-clay-700' :
                    t.verification_status === 'suspended' ? 'bg-rust-50 text-rust-600' :
                    'bg-ink-100 text-ink-600'
                  }`}>{t.verification_status}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  {t.verification_status === 'pending' && (
                    <>
                      <button onClick={() => approve(t.id)} className="w-9 h-9 rounded-lg bg-sage-100 text-sage-700 flex items-center justify-center hover:bg-sage-200"><Check className="w-4 h-4" /></button>
                      <button onClick={() => reject(t.id)} className="w-9 h-9 rounded-lg bg-rust-50 text-rust-600 flex items-center justify-center hover:bg-rust-100"><X className="w-4 h-4" /></button>
                    </>
                  )}
                  {t.verification_status === 'verified' && (
                    <button onClick={() => suspend(t.id)} className="w-9 h-9 rounded-lg bg-ink-100 text-ink-600 flex items-center justify-center hover:bg-ink-200"><Ban className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ USER MANAGEMENT ============
function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data as Profile[] || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminHeader title="User Management" />
      <div className="container-wide py-4">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        ) : (
          <div className="card divide-y divide-ink-100">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-cream-100 shrink-0">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">{u.full_name.charAt(0)}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{u.full_name}</p>
                  <p className="text-xs text-ink-500 truncate">{u.location || 'No location'}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                  u.role === 'admin' ? 'bg-ink-900 text-cream-50' :
                  u.role === 'tailor' ? 'bg-clay-50 text-clay-700' : 'bg-cream-100 text-ink-600'
                }`}>{u.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ ORDER MANAGEMENT ============
function OrderManagement() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<(CustomOrder & { profiles: { full_name: string; avatar_url: string | null }; tailor_profiles: { profiles: { full_name: string } } })[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('custom_orders')
        .select('*, profiles!customer_id(full_name, avatar_url), tailor_profiles!tailor_id(profiles!tailor_id(full_name))')
        .order('created_at', { ascending: false })
        .limit(50);
      setOrders(data as any || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminHeader title="Order Management" />
      <div className="container-wide py-4">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="w-7 h-7" />} title="No orders" description="No custom orders have been placed yet." />
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{o.clothing_type}</p>
                  <p className="text-xs text-ink-500">{o.profiles?.full_name} → {o.tailor_profiles?.profiles?.full_name}</p>
                  <p className="text-xs text-ink-400">{formatDate(o.created_at)}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  o.status === 'completed' ? 'bg-sage-100 text-sage-700' :
                  o.status === 'cancelled' ? 'bg-rust-50 text-rust-600' : 'bg-clay-50 text-clay-700'
                }`}>{ORDER_STATUS_LABELS[o.status]}</span>
                {o.final_price && <p className="text-sm font-semibold tabular">{formatNGN(o.final_price)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ DISPUTE MANAGEMENT ============
function DisputeManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('disputes').select('*').order('created_at', { ascending: false });
      setDisputes(data as Dispute[] || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resolve(id: string, status: 'resolved' | 'closed') {
    const { error } = await supabase.from('disputes').update({ status, resolution: status === 'resolved' ? 'Resolved by admin' : 'Closed by admin' }).eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast(`Dispute ${status}`, 'success');
    load();
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <AdminHeader title="Dispute Management" />
      <div className="container-wide py-4">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        ) : disputes.length === 0 ? (
          <EmptyState icon={<AlertTriangle className="w-7 h-7" />} title="No disputes" description="No disputes have been raised. All clear!" />
        ) : (
          <div className="space-y-2">
            {disputes.map((d) => (
              <div key={d.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{d.reason}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                    d.status === 'open' ? 'bg-rust-50 text-rust-600' :
                    d.status === 'investigating' ? 'bg-clay-50 text-clay-700' :
                    'bg-sage-100 text-sage-700'
                  }`}>{d.status}</span>
                </div>
                {d.description && <p className="text-sm text-ink-600 mb-2">{d.description}</p>}
                <p className="text-xs text-ink-400 mb-3">{formatDate(d.created_at)}</p>
                {(d.status === 'open' || d.status === 'investigating') && (
                  <div className="flex gap-2">
                    <button onClick={() => resolve(d.id, 'resolved')} className="btn-primary text-sm py-2 px-4">Resolve</button>
                    <button onClick={() => resolve(d.id, 'closed')} className="btn-secondary text-sm py-2 px-4">Close</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SHARED ============
function AdminHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-ink-100">
      <div className="container-wide flex items-center gap-3 py-3">
        <button onClick={() => navigate('/admin')} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="font-display text-base font-semibold flex-1">{title}</h1>
      </div>
    </div>
  );
}
