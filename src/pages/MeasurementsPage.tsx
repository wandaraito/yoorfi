import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Ruler, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import type { MeasurementProfile } from '@/lib/types';
import { Skeleton, EmptyState } from '@/components/Feedback';

const FIELDS = [
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

export function MeasurementsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('measurement_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setProfiles(data as MeasurementProfile[] || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!user || !name.trim()) { toast('Please enter a name', 'error'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('measurement_profiles').insert({
        user_id: user.id,
        name: name.trim(),
        measurements,
      });
      if (error) throw error;
      toast('Measurement profile saved', 'success');
      setShowForm(false);
      setName('');
      setMeasurements({});
      load();
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('measurement_profiles').delete().eq('id', id);
    if (!error) {
      toast('Profile deleted', 'info');
      load();
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur border-b border-ink-100">
        <div className="container-app flex items-center gap-3 py-3">
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-white border border-ink-100 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-base font-semibold flex-1">Measurements</h1>
          <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="container-app py-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : profiles.length === 0 && !showForm ? (
          <EmptyState
            icon={<Ruler className="w-7 h-7" />}
            title="No measurement profiles"
            description="Save your measurements once and reuse them for every order."
            action={<button onClick={() => setShowForm(true)} className="btn-primary text-sm">Add Measurements</button>}
          />
        ) : (
          <div className="space-y-3">
            {profiles.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{p.name}</h3>
                  <button onClick={() => remove(p.id)} className="text-ink-400 hover:text-rust-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(p.measurements).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="text-xs">
                      <span className="text-ink-500">{FIELDS.find(f => f.key === k)?.label || k}:</span>{' '}
                      <span className="font-medium">{v}"</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form sheet */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-ink-900/40" onClick={() => setShowForm(false)} />
            <div className="relative w-full max-w-[480px] bg-white rounded-t-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">New Measurement Profile</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="mb-4">
                <label className="label">Profile name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Me, Brother, Wedding Outfit" className="input" />
              </div>
              <div className="space-y-3 mb-4">
                {FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="label">{f.label} (inches)</label>
                    <input
                      type="number"
                      value={measurements[f.key] || ''}
                      onChange={(e) => setMeasurements({ ...measurements, [f.key]: e.target.value })}
                      placeholder="0"
                      className="input"
                    />
                  </div>
                ))}
              </div>
              <button onClick={save} disabled={saving} className="btn-primary w-full">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
