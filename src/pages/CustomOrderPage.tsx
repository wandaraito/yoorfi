import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Upload, X, Image as ImageIcon, Ruler, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { CLOTHING_TYPES, NIGERIAN_CITIES, formatNGN, type MeasurementProfile } from '@/lib/types';

const STEPS = ['Clothing', 'Inspiration', 'Fabric', 'Measurements', 'Preferences', 'Budget', 'Review'];

const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hip', label: 'Hip' },
  { key: 'shoulder', label: 'Shoulder' },
  { key: 'sleeve', label: 'Sleeve Length' },
  { key: 'neck', label: 'Neck' },
  { key: 'length', label: 'Top Length' },
  { key: 'trouser_waist', label: 'Trouser Waist' },
  { key: 'trouser_length', label: 'Trouser Length' },
  { key: 'thigh', label: 'Thigh' },
];

export function CustomOrderPage() {
  const { tailorId } = useParams<{ tailorId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [clothingType, setClothingType] = useState(searchParams.get('type') || '');
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [fabricOption, setFabricOption] = useState<'tailor_provides' | 'customer_provides'>('tailor_provides');
  const [fabricPreference, setFabricPreference] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [measurementMode, setMeasurementMode] = useState<'saved' | 'manual' | 'assistance'>('manual');
  const [savedMeasurements, setSavedMeasurements] = useState<MeasurementProfile[]>([]);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  const [needsAssistance, setNeedsAssistance] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  useEffect(() => {
    if (user) {
      supabase.from('measurement_profiles').select('*').eq('user_id', user.id).then(({ data }) => {
        if (data && data.length > 0) {
          setSavedMeasurements(data as MeasurementProfile[]);
          setMeasurementMode('saved');
          setSelectedMeasurementId(data[0].id);
        }
      });
    }
  }, [user]);

  const canProceed = () => {
    if (step === 0) return !!clothingType;
    if (step === 1) return true;
    if (step === 2) return true;
    if (step === 3) return measurementMode === 'assistance' || measurementMode === 'saved' || Object.keys(measurements).length > 0;
    return true;
  };

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setInspirationImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  async function submitOrder() {
    if (!user || !tailorId) return;
    setSubmitting(true);
    try {
      const orderData = {
        customer_id: user.id,
        tailor_id: tailorId,
        clothing_type: clothingType,
        inspiration_images: inspirationImages,
        notes: notes || null,
        fabric_option: fabricOption,
        fabric_preference: fabricPreference || null,
        measurement_profile_id: measurementMode === 'saved' ? selectedMeasurementId : null,
        manual_measurements: measurementMode === 'manual' ? measurements : null,
        needs_measurement_assistance: measurementMode === 'assistance',
        preferences,
        budget_min: budgetMin ? parseInt(budgetMin) : null,
        budget_max: budgetMax ? parseInt(budgetMax) : null,
        status: 'requested',
      };

      const { data, error } = await supabase.from('custom_orders').insert(orderData).select('id').single();
      if (error) throw error;

      await supabase.from('order_status_history').insert({
        custom_order_id: data.id,
        status: 'requested',
        note: 'Order request submitted',
        created_by: user.id,
      });

      await supabase.from('notifications').insert({
        user_id: (await supabase.from('tailor_profiles').select('tailor_id').eq('id', tailorId).maybeSingle()).data?.tailor_id,
        type: 'new_order',
        title: 'New custom order request',
        body: `A customer requested a ${clothingType}. Review and send a quotation.`,
        data: { custom_order_id: data.id },
      });

      toast('Order request sent! The tailor will respond with a quotation.', 'success');
      navigate(`/orders/${data.id}`);
    } catch (err: any) {
      toast(err.message || 'Failed to submit order', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center gap-3 py-3">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs text-ink-500">Step {step + 1} of {STEPS.length}</p>
            <h1 className="font-display text-base font-semibold">{STEPS[step]}</h1>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-ink-100">
          <div className="h-full bg-ink-900 transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="container-app py-6">
        {/* Step 0: Clothing */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-semibold mb-1">What do you want to make?</h2>
            <p className="text-sm text-ink-500 mb-5">Choose your clothing type</p>
            <div className="grid grid-cols-2 gap-3">
              {CLOTHING_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setClothingType(type)}
                  className={`p-5 rounded-2xl border-2 text-center transition ${clothingType === type ? 'border-ink-900 bg-ink-900 text-cream-50' : 'border-ink-100 bg-white'}`}
                >
                  <p className="font-medium text-sm">{type}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Inspiration */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-semibold mb-1">Upload inspiration</h2>
            <p className="text-sm text-ink-500 mb-5">Add reference images and notes</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {inspirationImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setInspirationImages(inspirationImages.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink-900/70 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-cream-50" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-ink-200 flex flex-col items-center justify-center cursor-pointer hover:border-ink-400 transition">
                <Upload className="w-5 h-5 text-ink-400 mb-1" />
                <span className="text-[10px] text-ink-400">Upload</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <label className="label">Notes for the tailor</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="I want this exact style but in black..."
                rows={4}
                className="input resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Fabric */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-semibold mb-1">Fabric options</h2>
            <p className="text-sm text-ink-500 mb-5">Who provides the fabric?</p>
            <div className="space-y-3">
              <button
                onClick={() => setFabricOption('tailor_provides')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition ${fabricOption === 'tailor_provides' ? 'border-ink-900 bg-ink-900 text-cream-50' : 'border-ink-100 bg-white'}`}
              >
                <p className="font-medium text-sm">Tailor provides fabric</p>
                <p className={`text-xs mt-0.5 ${fabricOption === 'tailor_provides' ? 'text-cream-300' : 'text-ink-500'}`}>The tailor sources and includes fabric cost in the quotation</p>
              </button>
              <button
                onClick={() => setFabricOption('customer_provides')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition ${fabricOption === 'customer_provides' ? 'border-ink-900 bg-ink-900 text-cream-50' : 'border-ink-100 bg-white'}`}
              >
                <p className="font-medium text-sm">I have my own fabric</p>
                <p className={`text-xs mt-0.5 ${fabricOption === 'customer_provides' ? 'text-cream-300' : 'text-ink-500'}`}>You'll provide the fabric to the tailor</p>
              </button>
            </div>
            <div className="mt-4">
              <label className="label">Fabric preference (optional)</label>
              <input
                type="text"
                value={fabricPreference}
                onChange={(e) => setFabricPreference(e.target.value)}
                placeholder="e.g. Ankara, Lace, Cotton, Guinea brocade..."
                className="input"
              />
            </div>
          </div>
        )}

        {/* Step 3: Measurements */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-semibold mb-1">Measurements</h2>
            <p className="text-sm text-ink-500 mb-5">How do you want to provide measurements?</p>
            <div className="space-y-3 mb-5">
              {savedMeasurements.length > 0 && (
                <button
                  onClick={() => { setMeasurementMode('saved'); setNeedsAssistance(false); }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition ${measurementMode === 'saved' ? 'border-ink-900 bg-ink-900 text-cream-50' : 'border-ink-100 bg-white'}`}
                >
                  <p className="font-medium text-sm flex items-center gap-2"><Ruler className="w-4 h-4" /> Use saved measurements</p>
                </button>
              )}
              <button
                onClick={() => { setMeasurementMode('manual'); setNeedsAssistance(false); }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition ${measurementMode === 'manual' ? 'border-ink-900 bg-ink-900 text-cream-50' : 'border-ink-100 bg-white'}`}
              >
                <p className="font-medium text-sm flex items-center gap-2"><Ruler className="w-4 h-4" /> Enter manually</p>
              </button>
              <button
                onClick={() => { setMeasurementMode('assistance'); setNeedsAssistance(true); }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition ${measurementMode === 'assistance' ? 'border-ink-900 bg-ink-900 text-cream-50' : 'border-ink-100 bg-white'}`}
              >
                <p className="font-medium text-sm flex items-center gap-2"><Sparkles className="w-4 h-4" /> Request measurement assistance</p>
                <p className={`text-xs mt-0.5 ${measurementMode === 'assistance' ? 'text-cream-300' : 'text-ink-500'}`}>The tailor will help you take measurements</p>
              </button>
            </div>

            {measurementMode === 'saved' && savedMeasurements.length > 0 && (
              <div>
                <label className="label">Select measurement profile</label>
                <select value={selectedMeasurementId} onChange={(e) => setSelectedMeasurementId(e.target.value)} className="input">
                  {savedMeasurements.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}

            {measurementMode === 'manual' && (
              <div className="space-y-3">
                {MEASUREMENT_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="label">{field.label} (inches)</label>
                    <input
                      type="number"
                      value={measurements[field.key] || ''}
                      onChange={(e) => setMeasurements({ ...measurements, [field.key]: e.target.value })}
                      placeholder="0"
                      className="input"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <div className="animate-fade-in space-y-4">
            <h2 className="font-display text-xl font-semibold mb-1">Preferences</h2>
            <p className="text-sm text-ink-500 mb-5">Customize your outfit details</p>
            {['Color', 'Fit', 'Sleeve', 'Collar', 'Embroidery', 'Buttons'].map((pref) => (
              <div key={pref}>
                <label className="label">{pref}</label>
                <input
                  type="text"
                  value={preferences[pref.toLowerCase()] || ''}
                  onChange={(e) => setPreferences({ ...preferences, [pref.toLowerCase()]: e.target.value })}
                  placeholder={`e.g. ${pref === 'Color' ? 'Navy blue' : pref === 'Fit' ? 'Slim fit' : 'Specify...'}`}
                  className="input"
                />
              </div>
            ))}
            <div>
              <label className="label">Other instructions</label>
              <textarea
                value={preferences.other || ''}
                onChange={(e) => setPreferences({ ...preferences, other: e.target.value })}
                placeholder="Any additional details..."
                rows={3}
                className="input resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 5: Budget */}
        {step === 5 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-semibold mb-1">Your budget</h2>
            <p className="text-sm text-ink-500 mb-5">Set an expected budget range (optional)</p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="label">Minimum (₦)</label>
                <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="50000" className="input" />
              </div>
              <div className="flex-1">
                <label className="label">Maximum (₦)</label>
                <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="80000" className="input" />
              </div>
            </div>
            {budgetMin && budgetMax && (
              <div className="card p-4 text-center">
                <p className="text-sm text-ink-500">Expected budget</p>
                <p className="font-display text-lg font-semibold">{formatNGN(parseInt(budgetMin))} – {formatNGN(parseInt(budgetMax))}</p>
              </div>
            )}
            <div className="flex gap-2 flex-wrap mt-4">
              {[30000, 50000, 80000, 100000, 150000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setBudgetMin(String(amt)); setBudgetMax(String(amt * 2)); }}
                  className="chip bg-white border border-ink-100 text-ink-600"
                >
                  {formatNGN(amt)}+
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl font-semibold mb-1">Review your request</h2>
            <p className="text-sm text-ink-500 mb-5">Check everything before sending</p>
            <div className="card divide-y divide-ink-100">
              <div className="p-4">
                <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Clothing</p>
                <p className="font-medium">{clothingType}</p>
              </div>
              {inspirationImages.length > 0 && (
                <div className="p-4">
                  <p className="text-xs text-ink-400 uppercase tracking-wide mb-2">Inspiration</p>
                  <div className="flex gap-2">
                    {inspirationImages.slice(0, 4).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-14 h-14 rounded-lg object-cover" />
                    ))}
                  </div>
                  {notes && <p className="text-sm text-ink-600 mt-2">"{notes}"</p>}
                </div>
              )}
              <div className="p-4">
                <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Fabric</p>
                <p className="font-medium">{fabricOption === 'tailor_provides' ? 'Tailor provides' : 'Customer provides'}</p>
                {fabricPreference && <p className="text-sm text-ink-500 mt-0.5">{fabricPreference}</p>}
              </div>
              <div className="p-4">
                <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Measurements</p>
                <p className="font-medium">
                  {measurementMode === 'saved' ? `Saved: ${savedMeasurements.find(m => m.id === selectedMeasurementId)?.name}` :
                   measurementMode === 'manual' ? `${Object.keys(measurements).length} fields entered` :
                   'Assistance requested'}
                </p>
              </div>
              {Object.keys(preferences).length > 0 && (
                <div className="p-4">
                  <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Preferences</p>
                  <div className="space-y-1">
                    {Object.entries(preferences).filter(([, v]) => v).map(([k, v]) => (
                      <p key={k} className="text-sm"><span className="text-ink-500 capitalize">{k}:</span> {v}</p>
                    ))}
                  </div>
                </div>
              )}
              {budgetMin && budgetMax && (
                <div className="p-4">
                  <p className="text-xs text-ink-400 uppercase tracking-wide mb-1">Budget</p>
                  <p className="font-medium">{formatNGN(parseInt(budgetMin))} – {formatNGN(parseInt(budgetMax))}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-primary flex-1"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={submitOrder}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
