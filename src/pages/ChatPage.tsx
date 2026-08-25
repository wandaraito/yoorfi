import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Image as ImageIcon, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { timeAgo, type Message } from '@/lib/types';

export function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [otherName, setOtherName] = useState('');
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!conversationId || !user) return;
    setLoading(true);
    try {
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();
      if (!conv) { navigate('/messages'); return; }

      const otherId = conv.customer_id === user.id ? conv.tailor_id : conv.customer_id;
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', otherId)
        .maybeSingle();
      setOtherName(otherProfile?.full_name || 'Unknown');
      setOtherAvatar(otherProfile?.avatar_url || null);

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      setMessages(msgs as Message[] || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [conversationId, user, navigate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !user || !conversationId) return;
    setSending(true);
    const msgText = input.trim();
    setInput('');
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          body: msgText,
        })
        .select('*')
        .single();
      if (error) throw error;
      setMessages((prev) => [...prev, data as Message]);
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
    } catch {
      setInput(msgText);
    } finally {
      setSending(false);
    }
  }

  async function sendImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !conversationId) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          image_url: ev.target?.result as string,
        })
        .select('*')
        .single();
      if (!error && data) {
        setMessages((prev) => [...prev, data as Message]);
        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center gap-3 py-3">
          <button onClick={() => navigate('/messages')} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-cream-100">
            {otherAvatar ? <img src={otherAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-medium">{otherName.charAt(0)}</div>}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{otherName}</p>
            <p className="text-xs text-sage-500">● Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto container-app py-4 space-y-3">
        {loading ? (
          <div className="text-center text-sm text-ink-400 py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-sm text-ink-400 py-8">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-ink-900 text-cream-50 rounded-br-md' : 'bg-white border border-ink-100 rounded-bl-md'}`}>
                  {msg.image_url && (
                    <img src={msg.image_url} alt="" className="rounded-xl mb-2 max-w-full" />
                  )}
                  {msg.body && <p className="text-sm leading-relaxed">{msg.body}</p>}
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-cream-300' : 'text-ink-400'}`}>{timeAgo(msg.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-cream-50/95 backdrop-blur border-t border-ink-100">
        <div className="container-app py-3 flex items-center gap-2">
          <label className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center cursor-pointer shrink-0">
            <Plus className="w-5 h-5 text-ink-500" />
            <input type="file" accept="image/*" className="hidden" onChange={sendImage} />
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="input flex-1"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-ink-900 flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-cream-50" />
          </button>
        </div>
      </div>
    </div>
  );
}
