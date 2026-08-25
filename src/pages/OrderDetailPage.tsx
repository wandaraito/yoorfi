import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Check, Circle, CreditCard, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { CUSTOM_ORDER_STEPS, ORDER_STATUS_LABELS, formatNGN, formatDate, type CustomOrder, type Quotation, type TailorProfile } from '@/lib/types';
import { Skeleton, ErrorState } from '@/components/Feedback';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [order, setOrder] = useState<(CustomOrder & { tailor_profiles: { profiles: { full_name: string; avatar_url: string | null; location: string | null }; tailor_id: string } }) | null>(null);
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const { data, error } = await supabase
        .from('custom_orders')
        .select('*, tailor_profiles!inner(profiles!tailor_id(full_name, avatar_url, location), tailor_id)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) { setError(true); return; }
      setOrder(data as any);

      const { data: quotData } = await supabase
        .from('quotations')
        .select('*')
        .eq('custom_order_id', id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      setQuotation(quotData as Quotation | null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function acceptQuotation() {
    if (!order || !quotation || !user) return;
    const { error } = await supabase
      .from('custom_orders')
      .update({ status: 'accepted', final_price: quotation.price })
      .eq('id', order.id);
    if (error) { toast(error.message, 'error'); return; }
    await supabase.from('quotations').update({ status: 'accepted' }).eq('id', quotation.id);
    await supabase.from('order_status_history').insert({ custom_order_id: order.id, status: 'accepted', note: 'Customer accepted quotation', created_by: user.id });
    await supabase.from('notifications').insert({ user_id: order.tailor_profiles.tailor_id, type: 'quotation_accepted', title: 'Quotation accepted', body: 'The customer accepted your quotation.', data: { custom_order_id: order.id } });
    toast('Quotation accepted! Proceed to payment.', 'success');
    setOrder({ ...order, status: 'accepted', final_price: quotation.price });
    navigate(`/checkout/custom/${order.id}`);
  }

  async function rejectQuotation() {
    if (!order || !quotation || !user) return;
    await supabase.from('quotations').update({ status: 'rejected' }).eq('id', quotation.id);
    await supabase.from('custom_orders').update({ status: 'requested' }).eq('id', order.id);
    toast('Quotation rejected. You can wait for a new one.', 'info');
    load();
  }

  async function submitReview() {
    if (!order || !user || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        customer_id: user.id,
        tailor_id: order.tailor_id,
        custom_order_id: order.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      if (error) throw error;
      toast('Review submitted! Thank you.', 'success');
      setShowReview(false);
      setReviewComment('');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSubmittingReview(false);
    }
  }

  async function startChat() {
    if (!user || !order) return;
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('customer_id', user.id)
      .eq('tailor_id', order.tailor_profiles.tailor_id)
      .maybeSingle();
    if (existing) navigate(`/messages/${existing.id}`);
    else {
      const { data } = await supabase.from('conversations').insert({ customer_id: user.id, tailor_id: order.tailor_profiles.tailor_id, custom_order_id: order.id }).select('id').single();
      if (data) navigate(`/messages/${data.id}`);
    }
  }

  if (loading) return (
    <div className="container-app pt-6">
      <Skeleton className="h-32 rounded-2xl mb-4" />
      <Skeleton className="h-6 w-1/2 mb-2" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  if (error || !order) return (
    <div className="container-app pt-6">
      <ErrorState message="Order not found." onRetry={() => navigate('/orders')} />
    </div>
  );

  const tailorName = order.tailor_profiles?.profiles?.full_name;
  const tailorAvatar = order.tailor_profiles?.profiles?.avatar_url;
  const currentStepIndex = CUSTOM_ORDER_STEPS.indexOf(order.status);
  const isCustomer = profile?.role === 'customer';
  const canReview = order.status === 'completed' && isCustomer;

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center gap-3 py-3">
          <button onClick={() => navigate('/orders')} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-ink-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <h1 className="font-display text-base font-semibold">{order.clothing_type}</h1>
          </div>
        </div>
      </div>

      <div className="container-app py-6 space-y-5">
        {/* Status */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Status</h2>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              order.status === 'completed' ? 'bg-sage-100 text-sage-700' :
              order.status === 'cancelled' ? 'bg-rust-50 text-rust-600' :
              'bg-clay-50 text-clay-700'
            }`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          {order.status !== 'cancelled' && order.status !== 'disputed' && (
            <div className="space-y-1">
              {CUSTOM_ORDER_STEPS.map((status, i) => {
                const isDone = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const isFuture = i > currentStepIndex;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="shrink-0">
                      {isDone ? <Check className="w-5 h-5 text-sage-500" /> :
                       isCurrent ? <div className="w-5 h-5 rounded-full bg-ink-900 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-cream-50 animate-pulse" /></div> :
                       <Circle className="w-5 h-5 text-ink-200" />}
                    </div>
                    <span className={`text-sm ${isDone ? 'text-ink-400 line-through' : isCurrent ? 'font-medium text-ink-900' : 'text-ink-300'}`}>
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quotation */}
        {quotation && order.status === 'quoted' && isCustomer && (
          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold mb-3">Quotation</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Price</span><span className="font-semibold">{formatNGN(quotation.price)}</span></div>
              {quotation.fabric_cost > 0 && <div className="flex justify-between"><span className="text-ink-500">Fabric cost</span><span>{formatNGN(quotation.fabric_cost)}</span></div>}
              {quotation.estimated_completion_date && <div className="flex justify-between"><span className="text-ink-500">Est. completion</span><span>{formatDate(quotation.estimated_completion_date)}</span></div>}
              {quotation.delivery_estimate && <div className="flex justify-between"><span className="text-ink-500">Delivery</span><span>{quotation.delivery_estimate}</span></div>}
              {quotation.notes && <div className="pt-2 border-t border-ink-100"><p className="text-ink-600">{quotation.notes}</p></div>}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={acceptQuotation} className="btn-primary flex-1">Accept & Pay</button>
              <button onClick={rejectQuotation} className="btn-secondary">Reject</button>
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold mb-3">Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">Clothing type</span><span className="font-medium">{order.clothing_type}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Fabric</span><span className="font-medium">{order.fabric_option === 'tailor_provides' ? 'Tailor provides' : 'Customer provides'}</span></div>
            {order.fabric_preference && <div className="flex justify-between"><span className="text-ink-500">Fabric preference</span><span>{order.fabric_preference}</span></div>}
            {order.budget_min && order.budget_max && <div className="flex justify-between"><span className="text-ink-500">Budget</span><span>{formatNGN(order.budget_min)} – {formatNGN(order.budget_max)}</span></div>}
            {order.final_price && <div className="flex justify-between"><span className="text-ink-500">Final price</span><span className="font-semibold">{formatNGN(order.final_price)}</span></div>}
            {order.notes && <div className="pt-2 border-t border-ink-100"><p className="text-xs text-ink-400 uppercase mb-1">Notes</p><p className="text-ink-600">{order.notes}</p></div>}
            {Object.keys(order.preferences || {}).length > 0 && (
              <div className="pt-2 border-t border-ink-100">
                <p className="text-xs text-ink-400 uppercase mb-1">Preferences</p>
                <div className="space-y-0.5">
                  {Object.entries(order.preferences).filter(([, v]) => v).map(([k, v]) => (
                    <p key={k} className="text-sm"><span className="text-ink-500 capitalize">{k}:</span> {v}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inspiration images */}
        {order.inspiration_images && order.inspiration_images.length > 0 && (
          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold mb-3">Reference Images</h2>
            <div className="grid grid-cols-3 gap-2">
              {order.inspiration_images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full aspect-square rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* Tailor info */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold mb-3">Tailor</h2>
          <Link to={`/tailor/${order.tailor_id}`} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-cream-100">
              {tailorAvatar ? <img src={tailorAvatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-medium">{tailorName?.charAt(0)}</div>}
            </div>
            <div>
              <p className="font-medium text-sm">{tailorName}</p>
              <p className="text-xs text-ink-500">{order.tailor_profiles?.profiles?.location}</p>
            </div>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={startChat} className="btn-secondary flex-1">
            <MessageCircle className="w-4 h-4" /> Chat with tailor
          </button>
          {order.status === 'accepted' && (
            <button onClick={() => navigate(`/checkout/custom/${order.id}`)} className="btn-primary flex-1">
              <CreditCard className="w-4 h-4" /> Pay Now
            </button>
          )}
          {canReview && !showReview && (
            <button onClick={() => setShowReview(true)} className="btn-primary flex-1">
              <Star className="w-4 h-4" /> Leave Review
            </button>
          )}
        </div>

        {/* Review form */}
        {showReview && (
          <div className="card p-5 animate-scale-in">
            <h2 className="font-display text-lg font-semibold mb-3">Leave a Review</h2>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setReviewRating(i + 1)}>
                  <Star className={`w-7 h-7 ${i < reviewRating ? 'fill-gold-400 text-gold-400' : 'text-ink-200'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="input resize-none mb-3"
            />
            <button onClick={submitReview} disabled={submittingReview || !reviewComment.trim()} className="btn-primary w-full">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
