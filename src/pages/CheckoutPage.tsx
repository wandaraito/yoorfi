import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard, Building2, Smartphone, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { formatNGN, type Product, type CustomOrder } from '@/lib/types';
import { Skeleton, ErrorState } from '@/components/Feedback';

type PaymentMethod = 'card' | 'bank_transfer' | 'ussd';

export function CheckoutPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [amount, setAmount] = useState(0);
  const [label, setLabel] = useState('');
  const [customOrder, setCustomOrder] = useState<CustomOrder | null>(null);
  const [product, setProduct] = useState<(Product & { tailor_profiles: { id: string } }) | null>(null);
  const [size, setSize] = useState(searchParams.get('size') || '');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [qty, setQty] = useState(parseInt(searchParams.get('qty') || '1'));

  const load = useCallback(async () => {
    if (!id || !type) return;
    setLoading(true);
    try {
      if (type === 'custom') {
        const { data, error } = await supabase
          .from('custom_orders')
          .select('*, tailor_profiles!inner(id)')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (!data) { navigate('/orders'); return; }
        setCustomOrder(data as any);
        setAmount(data.final_price || 0);
        setLabel(`${data.clothing_type} — Custom Order`);
      } else {
        const { data, error } = await supabase
          .from('products')
          .select('*, tailor_profiles!inner(id)')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (!data) { navigate('/'); return; }
        setProduct(data as any);
        setAmount(data.price * qty);
        setLabel(data.name);
      }
    } catch {
      toast('Failed to load checkout details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, type, qty, navigate, toast]);

  useEffect(() => { load(); }, [load]);

  async function processPayment() {
    if (!user) return;
    setPaying(true);
    try {
      const ref = `ATAFO-${Date.now().toString(36).toUpperCase()}`;

      if (type === 'custom' && customOrder) {
        await supabase.from('payments').insert({
          custom_order_id: customOrder.id,
          customer_id: user.id,
          amount,
          method,
          status: 'success',
          reference: ref,
        });
        await supabase.from('custom_orders').update({ status: 'paid' }).eq('id', customOrder.id);
        await supabase.from('order_status_history').insert({
          custom_order_id: customOrder.id,
          status: 'paid',
          note: 'Payment completed',
          created_by: user.id,
        });
        const tailorUser = (await supabase.from('tailor_profiles').select('tailor_id').eq('id', customOrder.tailor_id).maybeSingle()).data;
        if (tailorUser) {
          await supabase.from('notifications').insert({
            user_id: tailorUser.tailor_id,
            type: 'payment_received',
            title: 'Payment received',
            body: `Payment of ${formatNGN(amount)} received for ${customOrder.clothing_type}.`,
            data: { custom_order_id: customOrder.id },
          });
        }
        toast('Payment successful!', 'success');
        navigate(`/orders/${customOrder.id}`);
      } else if (type === 'product' && product) {
        const { data: orderData } = await supabase.from('orders').insert({
          customer_id: user.id,
          tailor_id: product.tailor_profiles.id,
          order_type: 'ready_to_wear',
          total: amount,
          payment_status: 'paid',
          status: 'processing',
        }).select('id').single();

        if (orderData) {
          await supabase.from('order_items').insert({
            order_id: orderData.id,
            product_id: product.id,
            name: product.name,
            image_url: product.images[0],
            size, color, quantity: qty, price: product.price,
          });
          await supabase.from('payments').insert({
            order_id: orderData.id,
            customer_id: user.id,
            amount, method, status: 'success', reference: ref,
          });
        }
        toast('Order placed successfully!', 'success');
        navigate('/orders');
      }
    } catch (err: any) {
      toast(err.message || 'Payment failed', 'error');
    } finally {
      setPaying(false);
    }
  }

  if (loading) return (
    <div className="container-app pt-6">
      <Skeleton className="h-32 rounded-2xl mb-4" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  const methods: { key: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
    { key: 'card', label: 'Card', icon: CreditCard, desc: 'Visa, Mastercard, Verve' },
    { key: 'bank_transfer', label: 'Bank Transfer', icon: Building2, desc: 'Direct bank transfer' },
    { key: 'ussd', label: 'USSD', icon: Smartphone, desc: 'Dial code on your phone' },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center gap-3 py-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-base font-semibold">Checkout</h1>
        </div>
      </div>

      <div className="container-app py-6 space-y-5">
        {/* Summary */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold mb-3">Order Summary</h2>
          <div className="flex items-center gap-3">
            {product && <img src={product.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" />}
            <div className="flex-1">
              <p className="font-medium text-sm">{label}</p>
              {type === 'product' && <p className="text-xs text-ink-500">{size} · {color} · Qty {qty}</p>}
            </div>
            <p className="font-semibold text-lg tabular">{formatNGN(amount)}</p>
          </div>
        </div>

        {/* Payment method */}
        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold mb-3">Payment Method</h2>
          <div className="space-y-2">
            {methods.map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition ${method === m.key ? 'border-ink-900 bg-ink-50' : 'border-ink-100'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${method === m.key ? 'bg-ink-900 text-cream-50' : 'bg-cream-100 text-ink-500'}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{m.label}</p>
                  <p className="text-xs text-ink-500">{m.desc}</p>
                </div>
                {method === m.key && <Check className="w-5 h-5 text-ink-900" />}
              </button>
            ))}
          </div>
        </div>

        {/* Mock payment form */}
        {method === 'card' && (
          <div className="card p-5 space-y-3">
            <div>
              <label className="label">Card number</label>
              <input type="text" placeholder="4084 0830 8421 7432" className="input" maxLength={19} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label">Expiry</label>
                <input type="text" placeholder="MM/YY" className="input" maxLength={5} />
              </div>
              <div className="flex-1">
                <label className="label">CVV</label>
                <input type="text" placeholder="123" className="input" maxLength={3} />
              </div>
            </div>
            <p className="text-xs text-ink-400">This is a mock payment. No real card details are stored.</p>
          </div>
        )}

        {method === 'bank_transfer' && (
          <div className="card p-5 text-center">
            <p className="text-sm text-ink-500 mb-2">Transfer to</p>
            <p className="font-display text-lg font-semibold mb-1">yoorfit Pay</p>
            <p className="text-sm text-ink-600">Bank: Providus Bank</p>
            <p className="text-sm text-ink-600">Account: 4084083084</p>
            <p className="text-xs text-ink-400 mt-2">Use your order ID as reference</p>
          </div>
        )}

        {method === 'ussd' && (
          <div className="card p-5 text-center">
            <p className="text-sm text-ink-500 mb-2">Dial this code on your phone</p>
            <p className="font-display text-2xl font-semibold mb-2">*737*000*{amount.toLocaleString()}#</p>
            <p className="text-xs text-ink-400">GTBank USSD code (demo)</p>
          </div>
        )}

        {/* Pay button */}
        <button onClick={processPayment} disabled={paying} className="btn-primary w-full">
          {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4" /> Pay {formatNGN(amount)}</>}
        </button>
      </div>
    </div>
  );
}
