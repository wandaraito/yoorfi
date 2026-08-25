import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Notification } from '@/lib/types';
import { timeAgo } from '@/lib/types';
import { Skeleton, EmptyState } from '@/components/Feedback';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications(data as Notification[] || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function markAllRead() {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function clearAll() {
    if (!user) return;
    await supabase.from('notifications').delete().eq('user_id', user.id);
    setNotifications([]);
  }

  async function handleTap(n: Notification) {
    if (!n.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
    }
    const orderId = n.data?.custom_order_id as string;
    if (orderId) navigate(`/orders/${orderId}`);
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center gap-3 py-3">
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-base font-semibold flex-1">Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <button onClick={markAllRead} className="text-xs text-ink-500 flex items-center gap-1">
              <CheckCheck className="w-4 h-4" /> Mark all
            </button>
          )}
        </div>
      </div>

      <div className="container-app py-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-7 h-7" />}
            title="No notifications"
            description="You'll be notified when tailors respond, orders update, and more."
          />
        ) : (
          <>
            <div className="flex justify-end mb-2">
              <button onClick={clearAll} className="text-xs text-ink-400 flex items-center gap-1 hover:text-rust-500">
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>
            <div className="space-y-2">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleTap(n)}
                  className={`w-full text-left card p-4 flex items-start gap-3 transition ${!n.is_read ? 'border-clay-200 bg-clay-50/30' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.is_read ? 'bg-clay-500' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                    {n.body && <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{n.body}</p>}
                    <p className="text-[10px] text-ink-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
