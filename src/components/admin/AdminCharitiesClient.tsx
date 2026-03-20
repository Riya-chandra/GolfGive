'use client';

import { useState, useEffect } from 'react';
import { Charity } from '@/types';

export default function AdminCharitiesClient() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const emptyForm = { name: '', description: '', shortDescription: '', category: '', website: '', logoUrl: '', isFeatured: false, isActive: true };
  const [form, setForm] = useState(emptyForm);

  const categories = ['Environment', 'Youth & Sport', 'Veterans & Health', 'Health & Research', 'Education', 'Other'];

  useEffect(() => {
    fetch('/api/charities')
      .then(r => r.json())
      .then(d => { setCharities(d.charities || []); setLoading(false); });
  }, []);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSave = async () => {
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { ...form, id: editingId } : form;
    const res = await fetch('/api/charities', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      if (editingId) {
        setCharities(charities.map(c => c.id === editingId ? data.charity : c));
        showMsg('✅ Charity updated');
      } else {
        setCharities([data.charity, ...charities]);
        showMsg('✅ Charity added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } else {
      showMsg(`❌ ${data.error}`);
    }
  };

  const handleEdit = (c: Charity) => {
    setForm({
      name: c.name,
      description: c.description,
      shortDescription: c.short_description || '',
      category: c.category || '',
      website: c.website || '',
      logoUrl: c.logo_url || '',
      isFeatured: c.is_featured,
      isActive: c.is_active,
    });
    setEditingId(c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this charity?')) return;
    const res = await fetch(`/api/charities?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCharities(charities.map(c => c.id === id ? { ...c, is_active: false } : c));
      showMsg('✅ Charity deactivated');
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Loading charities...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-charcoal">Charity Management</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }} className="btn-primary text-sm py-2 px-4">
          {showForm ? 'Cancel' : '+ Add Charity'}
        </button>
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 mb-4 text-sm font-medium ${message.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-forest-50 text-forest-700 border border-forest-200'}`}>
          {message}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display font-bold text-xl text-charcoal mb-5">
            {editingId ? 'Edit Charity' : 'Add New Charity'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Charity name *</label>
              <input type="text" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Green Fairways Foundation" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Short description (shown in cards)</label>
              <input type="text" className="input-field" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} placeholder="One sentence summary" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Full description *</label>
              <textarea className="input-field h-32 resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Full charity description..." />
            </div>
            <div>
              <label className="label">Website URL</label>
              <input type="url" className="input-field" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label className="label">Logo URL</label>
              <input type="url" className="input-field" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-gold-500 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">Featured on homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-forest-600 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-outline text-sm py-2 px-4">Cancel</button>
            <button onClick={handleSave} disabled={!form.name || !form.description} className="btn-primary text-sm py-2 px-5">
              {editingId ? 'Save changes' : 'Add charity'}
            </button>
          </div>
        </div>
      )}

      {/* Charities grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charities.map(c => (
          <div key={c.id} className={`card p-5 ${!c.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-charcoal">{c.name}</h3>
                <span className="text-xs text-gray-400">{c.category}</span>
              </div>
              <div className="flex gap-1 flex-col items-end">
                {c.is_featured && <span className="badge badge-gold">Featured</span>}
                <span className={`badge ${c.is_active ? 'badge-green' : 'badge-gray'}`}>{c.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{c.short_description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-forest-600">£{c.total_raised.toFixed(0)} raised</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(c)} className="text-xs text-forest-600 font-medium hover:underline">Edit</button>
                {c.is_active && (
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 font-medium hover:underline">Deactivate</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
