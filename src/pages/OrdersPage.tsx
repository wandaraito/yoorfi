import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ORDER_STATUS_LABELS, formatNGN, formatDate, type CustomOrder } from '@/lib/types';
import { Skeleton, ErrorState, EmptyState } from '@/components/Feedback';

export function OrdersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [orders, setOrders] = useState<(CustomOrder & { tailor_profiles: { profiles: { full_name: string; avatar_url: string | null } } })[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(false);
    try {
      const { data, error } = await supabase
        .from('custom_orders')
        .select('*, tailor_profiles!inner(profiles!tailor_id(full_name, avatar_url))')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data as any || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const activeStatuses = ['requested', 'quoted', 'accepted', 'payment_pending', 'paid', 'measurements_confirmed', 'fabric_confirmed', 'cutting', 'sewing', 'quality_check', 'ready_for_dispatch', 'dispatched', 'delivered'];
  const filtered = orders.filter(o => {
    if (filter === 'active') return activeStatuses.includes(o.status);
    if (filter === 'completed') return o.status === 'completed' || o.status === 'cancelled';
    return true;
  });

  return (
    <div className="container-app">
      <h1 className="font-display text-2xl font-semibold pt-6 mb-4">Orders</h1>

      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip ${filter === f ? 'bg-ink-900 text-cream-50' : 'bg-white text-ink-600 border border-ink-100'}`}
          >
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Completed'}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message="Failed to load orders." onRetry={load} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-7 h-7" />}
          title="No orders yet"
          description="When you place a custom order, it will appear here."
          action={<Link to="/discover" className="btn-primary text-sm">Browse Tailors</Link>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const tailorName = order.tailor_profiles?.profiles?.full_name;
            const tailorAvatar = order.tailor_profiles?.profiles?.avatar_url;
            return (
              <Link key={order.id} to={`/orders/${order.id}`} className="card p-4 flex items-center gap-3 hover:shadow-card transition">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                  {tailorAvatar ? <img src={tailorAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-medium">{tailorName?.charAt(0)}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{order.clothing_type}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'completed' ? 'bg-sage-100 text-sage-700' :
                      order.status === 'cancelled' ? 'bg-rust-50 text-rust-600' :
                      'bg-clay-50 text-clay-700'
                    }`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 truncate">{tailorName} · {formatDate(order.created_at)}</p>
                  {order.final_price && <p className="text-sm font-semibold mt-1 tabular">{formatNGN(order.final_price)}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-ink-300 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
