'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Plus, Edit2, Trash2, CheckSquare, Square, ChevronDown, Package, Users, ToggleLeft, ToggleRight, Search, AlertCircle, Loader2, Save, X, MapPin, TrendingUp, Star, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ListingTab = 'equipment' | 'labour';
type StatusFilter = 'all' | 'active' | 'paused' | 'pending';

interface EquipmentListing {
  id: string;
  name: string;
  category: string;
  brand: string;
  rent_per_day: number;
  buy_price: number;
  deposit: number;
  status: string;
  is_available: boolean;
  location: string;
  avg_rating: number;
  review_count: number;
  views: number;
  has_driver: boolean;
  listing_type: string;
  created_at: string;
}

interface LabourListing {
  id: string;
  name: string;
  skills: string[];
  wage_per_day: number;
  location: string;
  status: string;
  is_available: boolean;
  avg_rating: number;
  review_count: number;
  completed_jobs: number;
  experience_years: number;
  created_at: string;
}

interface EditEquipmentForm {
  name: string;
  category: string;
  rent_per_day: string;
  buy_price: string;
  deposit: string;
  status: string;
  is_available: boolean;
  location: string;
}

interface EditLabourForm {
  name: string;
  wage_per_day: string;
  status: string;
  is_available: boolean;
  location: string;
}

const EQUIPMENT_CATEGORIES = ['Tractor', 'Harvester', 'Rotavator', 'Seed Drill', 'Sprayer', 'Plough', 'Thresher', 'Transplanter', 'Irrigation Pump', 'Other'];

export default function ProviderEquipmentPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<ListingTab>('equipment');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentListings, setEquipmentListings] = useState<EquipmentListing[]>([]);
  const [labourListings, setLabourListings] = useState<LabourListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentListing | null>(null);
  const [editingLabour, setEditingLabour] = useState<LabourListing | null>(null);
  const [editEquipForm, setEditEquipForm] = useState<EditEquipmentForm | null>(null);
  const [editLabourForm, setEditLabourForm] = useState<EditLabourForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [equipRes, labourRes] = await Promise.all([
        supabase.from('equipment').select('*').eq('provider_id', user.id).order('created_at', { ascending: false }),
        supabase.from('labour').select('*').eq('provider_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (!equipRes.error) setEquipmentListings(equipRes.data || []);
      if (!labourRes.error) setLabourListings(labourRes.data || []);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const filteredEquipment = equipmentListings.filter(e => {
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchSearch = !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredLabour = labourListings.filter(l => {
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const currentList = tab === 'equipment' ? filteredEquipment : filteredLabour;

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === currentList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentList.map(i => i.id)));
    }
  }

  async function handleBulkAction(action: 'activate' | 'pause' | 'delete') {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    setBulkActionOpen(false);
    try {
      const ids = Array.from(selectedIds);
      const table = tab === 'equipment' ? 'equipment' : 'labour';
      if (action === 'delete') {
        const { error } = await supabase.from(table).delete().in('id', ids).eq('provider_id', user!.id);
        if (error) throw error;
        toast.success(`Deleted ${ids.length} listing${ids.length > 1 ? 's' : ''}`);
      } else {
        const updates = action === 'activate' ? { status: 'active', is_available: true } : { status: 'paused', is_available: false };
        const { error } = await supabase.from(table).update(updates).in('id', ids).eq('provider_id', user!.id);
        if (error) throw error;
        toast.success(`${action === 'activate' ? 'Activated' : 'Paused'} ${ids.length} listing${ids.length > 1 ? 's' : ''}`);
      }
      setSelectedIds(new Set());
      fetchListings();
    } catch {
      toast.error('Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
  }

  async function toggleAvailability(id: string, current: boolean, type: ListingTab) {
    const table = type === 'equipment' ? 'equipment' : 'labour';
    const { error } = await supabase.from(table).update({ is_available: !current }).eq('id', id).eq('provider_id', user!.id);
    if (error) { toast.error('Update failed'); return; }
    toast.success(`Listing ${!current ? 'activated' : 'paused'}`);
    fetchListings();
  }

  function openEditEquipment(e: EquipmentListing) {
    setEditingEquipment(e);
    setEditEquipForm({
      name: e.name, category: e.category,
      rent_per_day: String(e.rent_per_day), buy_price: String(e.buy_price),
      deposit: String(e.deposit), status: e.status,
      is_available: e.is_available, location: e.location,
    });
  }

  function openEditLabour(l: LabourListing) {
    setEditingLabour(l);
    setEditLabourForm({
      name: l.name, wage_per_day: String(l.wage_per_day),
      status: l.status, is_available: l.is_available, location: l.location,
    });
  }

  async function saveEquipmentEdit() {
    if (!editingEquipment || !editEquipForm) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase.from('equipment').update({
        name: editEquipForm.name.trim(),
        category: editEquipForm.category,
        rent_per_day: parseFloat(editEquipForm.rent_per_day) || 0,
        buy_price: parseFloat(editEquipForm.buy_price) || 0,
        deposit: parseFloat(editEquipForm.deposit) || 0,
        status: editEquipForm.status,
        is_available: editEquipForm.is_available,
        location: editEquipForm.location.trim(),
        updated_at: new Date().toISOString(),
      }).eq('id', editingEquipment.id).eq('provider_id', user!.id);
      if (error) throw error;
      toast.success('Equipment updated');
      setEditingEquipment(null);
      fetchListings();
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  }

  async function saveLabourEdit() {
    if (!editingLabour || !editLabourForm) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase.from('labour').update({
        name: editLabourForm.name.trim(),
        wage_per_day: parseFloat(editLabourForm.wage_per_day) || 0,
        status: editLabourForm.status,
        is_available: editLabourForm.is_available,
        location: editLabourForm.location.trim(),
        updated_at: new Date().toISOString(),
      }).eq('id', editingLabour.id).eq('provider_id', user!.id);
      if (error) throw error;
      toast.success('Labour listing updated');
      setEditingLabour(null);
      fetchListings();
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteListing(id: string, type: ListingTab) {
    setDeletingId(id);
    try {
      const table = type === 'equipment' ? 'equipment' : 'labour';
      const { error } = await supabase.from(table).delete().eq('id', id).eq('provider_id', user!.id);
      if (error) throw error;
      toast.success('Listing deleted');
      fetchListings();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  const stats = {
    totalEquip: equipmentListings.length,
    activeEquip: equipmentListings.filter(e => e.status === 'active').length,
    totalLabour: labourListings.length,
    activeLabour: labourListings.filter(l => l.status === 'active').length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-screen-sm mx-auto px-4 py-20 text-center">
          <AlertCircle size={48} className="text-warning mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Sign in required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to manage your listings.</p>
          <Link href="/sign-up-login-screen" className="btn-primary px-6 py-3">Sign In</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Provider Equipment</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your equipment and labour listings</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchListings} className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors" title="Refresh">
              <RefreshCw size={16} />
            </button>
            <Link href="/supplier/add-listing" className="btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
              <Plus size={16} /> Add Listing
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Equipment', value: stats.totalEquip, sub: `${stats.activeEquip} active`, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Labour', value: stats.totalLabour, sub: `${stats.activeLabour} active`, icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Avg Rating', value: equipmentListings.length ? (equipmentListings.reduce((s, e) => s + (e.avg_rating || 0), 0) / equipmentListings.length).toFixed(1) : '—', sub: 'equipment', icon: Star, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Total Views', value: equipmentListings.reduce((s, e) => s + (e.views || 0), 0), sub: 'all listings', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          ].map(s => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon size={16} className={s.color} />
                </div>
              </div>
              <p className="text-xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label} · {s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tab + Filters */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border flex-wrap gap-3">
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
              {(['equipment', 'labour'] as ListingTab[]).map(t => (
                <button key={t} onClick={() => { setTab(t); setSelectedIds(new Set()); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  {t === 'equipment' ? <><Package size={14} className="inline mr-1.5" />Equipment</> : <><Users size={14} className="inline mr-1.5" />Labour</>}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search listings..." className="pl-9 pr-3 py-2 text-sm border border-border rounded-xl bg-background w-48 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-primary/5 border-b border-primary/20">
              <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setBulkActionOpen(!bulkActionOpen)} disabled={bulkLoading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-60">
                    {bulkLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                    Bulk Actions <ChevronDown size={12} />
                  </button>
                  {bulkActionOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-card rounded-xl border border-border shadow-modal z-20 py-1">
                      <button onClick={() => handleBulkAction('activate')} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-success font-medium">
                        <CheckCircle size={14} /> Activate All
                      </button>
                      <button onClick={() => handleBulkAction('pause')} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-warning font-medium">
                        <Clock size={14} /> Pause All
                      </button>
                      <button onClick={() => handleBulkAction('delete')} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-danger font-medium">
                        <Trash2 size={14} /> Delete All
                      </button>
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedIds(new Set())} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Table Header */}
          <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-3">
              <button onClick={toggleSelectAll} className="shrink-0">
                {selectedIds.size === currentList.length && currentList.length > 0
                  ? <CheckSquare size={16} className="text-primary" />
                  : <Square size={16} className="text-muted-foreground" />}
              </button>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
                {tab === 'equipment' ? 'Equipment' : 'Labour'} ({currentList.length})
              </span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24 text-right hidden sm:block">Pricing</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20 text-center hidden md:block">Status</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24 text-center">Actions</span>
            </div>
          </div>

          {/* Listings */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-16">
              <Package size={40} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No listings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first listing to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/supplier/add-listing" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold mt-4 inline-flex items-center gap-2">
                  <Plus size={15} /> Add Listing
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tab === 'equipment' ? filteredEquipment.map(e => (
                <div key={e.id} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors ${selectedIds.has(e.id) ? 'bg-primary/5' : ''}`}>
                  <button onClick={() => toggleSelect(e.id)} className="shrink-0">
                    {selectedIds.has(e.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground truncate">{e.name}</p>
                      {e.has_driver && <span className="px-1.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold">+Driver</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{e.category}</span>
                      {e.location && <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin size={10} />{e.location.slice(0, 20)}</span>}
                      {e.avg_rating > 0 && <span className="text-xs text-warning font-semibold">★ {e.avg_rating.toFixed(1)}</span>}
                    </div>
                  </div>
                  <div className="w-24 text-right hidden sm:block">
                    <p className="text-sm font-bold text-foreground">₹{e.rent_per_day.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">/day</p>
                  </div>
                  <div className="w-20 flex justify-center hidden md:flex">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      e.status === 'active' ? 'bg-success/15 text-success' :
                      e.status === 'paused' ? 'bg-warning/15 text-warning' :
                      e.status === 'pending'? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'}`}>{e.status}</span>
                  </div>
                  <div className="w-24 flex items-center justify-end gap-1">
                    <button onClick={() => toggleAvailability(e.id, e.is_available, 'equipment')}
                      title={e.is_available ? 'Pause' : 'Activate'}
                      className={`p-1.5 rounded-lg transition-colors ${e.is_available ? 'text-success hover:bg-success/10' : 'text-muted-foreground hover:bg-muted'}`}>
                      {e.is_available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => openEditEquipment(e)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => deleteListing(e.id, 'equipment')} disabled={deletingId === e.id}
                      className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger disabled:opacity-50">
                      {deletingId === e.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              )) : filteredLabour.map(l => (
                <div key={l.id} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors ${selectedIds.has(l.id) ? 'bg-primary/5' : ''}`}>
                  <button onClick={() => toggleSelect(l.id)} className="shrink-0">
                    {selectedIds.has(l.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} className="text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{l.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {l.skills?.slice(0, 2).map(s => (
                        <span key={s} className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{s}</span>
                      ))}
                      {l.avg_rating > 0 && <span className="text-xs text-warning font-semibold">★ {l.avg_rating.toFixed(1)}</span>}
                    </div>
                  </div>
                  <div className="w-24 text-right hidden sm:block">
                    <p className="text-sm font-bold text-foreground">₹{l.wage_per_day.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">/day</p>
                  </div>
                  <div className="w-20 flex justify-center hidden md:flex">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      l.status === 'active' ? 'bg-success/15 text-success' :
                      l.status === 'paused'? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'}`}>{l.status}</span>
                  </div>
                  <div className="w-24 flex items-center justify-end gap-1">
                    <button onClick={() => toggleAvailability(l.id, l.is_available, 'labour')}
                      title={l.is_available ? 'Pause' : 'Activate'}
                      className={`p-1.5 rounded-lg transition-colors ${l.is_available ? 'text-success hover:bg-success/10' : 'text-muted-foreground hover:bg-muted'}`}>
                      {l.is_available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => openEditLabour(l)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => deleteListing(l.id, 'labour')} disabled={deletingId === l.id}
                      className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger disabled:opacity-50">
                      {deletingId === l.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Equipment Modal */}
      {editingEquipment && editEquipForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-modal max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold text-foreground">Edit Equipment</h2>
              <button onClick={() => setEditingEquipment(null)} className="p-1.5 rounded-lg hover:bg-muted"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Equipment Name</label>
                <input value={editEquipForm.name} onChange={e => setEditEquipForm(p => p ? { ...p, name: e.target.value } : p)}
                  className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Category</label>
                <select value={editEquipForm.category} onChange={e => setEditEquipForm(p => p ? { ...p, category: e.target.value } : p)}
                  className="input-field w-full">
                  {EQUIPMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Rent/Day (₹)</label>
                  <input type="number" value={editEquipForm.rent_per_day}
                    onChange={e => setEditEquipForm(p => p ? { ...p, rent_per_day: e.target.value } : p)}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Buy Price (₹)</label>
                  <input type="number" value={editEquipForm.buy_price}
                    onChange={e => setEditEquipForm(p => p ? { ...p, buy_price: e.target.value } : p)}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Deposit (₹)</label>
                  <input type="number" value={editEquipForm.deposit}
                    onChange={e => setEditEquipForm(p => p ? { ...p, deposit: e.target.value } : p)}
                    className="input-field w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
                  <select value={editEquipForm.status} onChange={e => setEditEquipForm(p => p ? { ...p, status: e.target.value } : p)}
                    className="input-field w-full">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Location</label>
                  <input value={editEquipForm.location} onChange={e => setEditEquipForm(p => p ? { ...p, location: e.target.value } : p)}
                    className="input-field w-full" placeholder="City, State" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditEquipForm(p => p ? { ...p, is_available: !p.is_available } : p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${editEquipForm.is_available ? 'border-success bg-success/5 text-success' : 'border-border text-muted-foreground'}`}>
                  {editEquipForm.is_available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {editEquipForm.is_available ? 'Available' : 'Unavailable'}
                </button>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button onClick={() => setEditingEquipment(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
              <button onClick={saveEquipmentEdit} disabled={savingEdit}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {savingEdit ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Labour Modal */}
      {editingLabour && editLabourForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-modal">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold text-foreground">Edit Labour Listing</h2>
              <button onClick={() => setEditingLabour(null)} className="p-1.5 rounded-lg hover:bg-muted"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Name</label>
                <input value={editLabourForm.name} onChange={e => setEditLabourForm(p => p ? { ...p, name: e.target.value } : p)}
                  className="input-field w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Wage/Day (₹)</label>
                  <input type="number" value={editLabourForm.wage_per_day}
                    onChange={e => setEditLabourForm(p => p ? { ...p, wage_per_day: e.target.value } : p)}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Status</label>
                  <select value={editLabourForm.status} onChange={e => setEditLabourForm(p => p ? { ...p, status: e.target.value } : p)}
                    className="input-field w-full">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Location</label>
                <input value={editLabourForm.location} onChange={e => setEditLabourForm(p => p ? { ...p, location: e.target.value } : p)}
                  className="input-field w-full" placeholder="City, State" />
              </div>
              <button onClick={() => setEditLabourForm(p => p ? { ...p, is_available: !p.is_available } : p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${editLabourForm.is_available ? 'border-success bg-success/5 text-success' : 'border-border text-muted-foreground'}`}>
                {editLabourForm.is_available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {editLabourForm.is_available ? 'Available' : 'Unavailable'}
              </button>
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button onClick={() => setEditingLabour(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
              <button onClick={saveLabourEdit} disabled={savingEdit}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {savingEdit ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
