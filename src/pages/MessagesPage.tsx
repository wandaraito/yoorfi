import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { timeAgo } from '@/lib/types';
import { Skeleton, EmptyState } from '@/components/Feedback';

export function MessagesPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, messages!conversation_id(body, image_url, created_at)')
        .or(`customer_id.eq.${user.id},tailor_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });
      if (error) throw error;

      const enriched = await Promise.all((data || []).map(async (conv) => {
        const otherUserId = conv.customer_id === user.id ? conv.tailor_id : conv.customer_id;
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, location')
          .eq('user_id', otherUserId)
          .maybeSingle();
        const lastMsg = conv.messages?.[conv.messages.length - 1];
        return { ...conv, otherProfile, lastMsg };
      }));

      setConversations(enriched);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container-app">
      <h1 className="font-display text-2xl font-semibold pt-6 mb-4">Messages</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="w-7 h-7" />}
          title="No messages yet"
          description="Start a conversation with a tailor from their profile page."
          action={<Link to="/discover" className="btn-primary text-sm">Browse Tailors</Link>}
        />
      ) : (
        <div className="card divide-y divide-ink-100">
          {conversations.map((conv) => (
            <Link key={conv.id} to={`/messages/${conv.id}`} className="flex items-center gap-3 p-4 hover:bg-cream-50 transition">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-cream-100 shrink-0">
                {conv.otherProfile?.avatar_url ? (
                  <img src={conv.otherProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-medium">{conv.otherProfile?.full_name?.charAt(0) || '?'}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">{conv.otherProfile?.full_name || 'Unknown'}</p>
                  <span className="text-[10px] text-ink-400 shrink-0">{conv.lastMsg ? timeAgo(conv.lastMsg.created_at) : timeAgo(conv.created_at)}</span>
                </div>
                <p className="text-xs text-ink-500 truncate mt-0.5">
                  {conv.lastMsg?.image_url ? '[Photo]' : conv.lastMsg?.body || 'No messages yet'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
