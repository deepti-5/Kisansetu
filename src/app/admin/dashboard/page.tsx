'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Users, Package, IndianRupee, TrendingUp, CheckCircle, XCircle, Clock, Eye, Ban, Search, BarChart2, AlertTriangle, Filter } from 'lucide-react';

type Tab = 'overview' | 'users' | 'suppliers' | 'equipment' | 'payments';

interface User { id: string; name: string; phone: string; role: 'farmer' | 'supplier'; joined: string; status: 'active' | 'suspended'; bookings: number; }
interface SupplierApproval { id: string; name: string; phone: string; equipment: string; submitted: string; status: 'pending' | 'approved' | 'rejected'; docs: boolean; }
interface EquipmentApproval { id: string; name: string; supplier: string; category: string; rentPerDay: number; submitted: string; status: 'pending' | 'approved' | 'rejected'; }

const USERS: User[] = [
  { id: 'u1', name: 'Suresh Yadav', phone: '+91 98765 11111', role: 'farmer', joined: '2026-01-15', status: 'active', bookings: 12 },
  { id: 'u2', name: 'Rajesh Patil', phone: '+91 87654 22222', role: 'supplier', joined: '2025-11-20', status: 'active', bookings: 34 },
  { id: 'u3', name: 'Priya Deshmukh', phone: '+91 76543 33333', role: 'farmer', joined: '2026-03-08', status: 'active', bookings: 5 },
  { id: 'u4', name: 'Mohan Kulkarni', phone: '+91 65432 44444', role: 'farmer', joined: '2026-02-14', status: 'suspended', bookings: 2 },
];

const SUPPLIER_APPROVALS: SupplierApproval[] = [
  { id: 's1', name: 'Vikram Singh', phone: '+91 99887 66554', equipment: 'Combine Harvester, Tractor', submitted: '2026-08-10', status: 'pending', docs: true },
  { id: 's2', name: 'Kavita Nair', phone: '+91 88776 55443', equipment: 'Drip Irrigation System', submitted: '2026-08-09', status: 'pending', docs: false },
  { id: 's3', name: 'Deepak Joshi', phone: '+91 77665 44332', equipment: 'Rotavator, Plough', submitted: '2026-08-07', status: 'approved', docs: true },
];

const EQUIPMENT_APPROVALS: EquipmentApproval[] = [
  { id: 'eq1', name: 'Combine Harvester 2024', supplier: 'Vikram Singh', category: 'Harvesting', rentPerDay: 8000, submitted: '2026-08-11', status: 'pending' },
  { id: 'eq2', name: 'Drip Irrigation 5 Acre Kit', supplier: 'Kavita Nair', category: 'Irrigation', rentPerDay: 1500, submitted: '2026-08-10', status: 'pending' },
  { id: 'eq3', name: 'Mahindra 575 DI', supplier: 'Deepak Joshi', category: 'Tractor', rentPerDay: 2500, submitted: '2026-08-08', status: 'approved' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState(USERS);
  const [suppliers, setSuppliers] = useState(SUPPLIER_APPROVALS);
  const [equipment, setEquipment] = useState(EQUIPMENT_APPROVALS);
  const [search, setSearch] = useState('');

  const pendingSuppliers = suppliers.filter(s => s.status === 'pending').length;
  const pendingEquipment = equipment.filter(e => e.status === 'pending').length;

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview' }, { key: 'users', label: 'Users' },
    { key: 'suppliers', label: 'Suppliers', badge: pendingSuppliers },
    { key: 'equipment', label: 'Equipment', badge: pendingEquipment },
    { key: 'payments', label: 'Payments' },
  ];

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-extrabold text-foreground">Admin Dashboard</h1><p className="text-sm text-muted-foreground mt-0.5">KisanSetu Platform Management</p></div>
          <div className="flex items-center gap-2 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-full"><span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live</div>
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              {t.label}
              {t.badge && t.badge > 0 ? <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{t.badge}</span> : null}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10', change: '+12 this week' },
                { label: 'Active Listings', value: 48, icon: Package, color: 'text-success', bg: 'bg-success/10', change: '+3 today' },
                { label: 'Total Revenue', value: '₹4.2L', icon: IndianRupee, color: 'text-accent', bg: 'bg-accent/10', change: '+18% MoM' },
                { label: 'Pending Approvals', value: pendingSuppliers + pendingEquipment, icon: Clock, color: 'text-warning', bg: 'bg-warning/10', change: 'Needs action' },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div><span className="text-xs text-muted-foreground">{s.change}</span></div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {(pendingSuppliers > 0 || pendingEquipment > 0) && (
              <div className="bg-warning-bg border border-warning/30 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-sm text-foreground flex items-center gap-2"><AlertTriangle size={15} className="text-warning" /> Action Required</p>
                {pendingSuppliers > 0 && <p className="text-sm text-muted-foreground">• {pendingSuppliers} supplier registration{pendingSuppliers > 1 ? 's' : ''} awaiting approval</p>}
                {pendingEquipment > 0 && <p className="text-sm text-muted-foreground">• {pendingEquipment} equipment listing{pendingEquipment > 1 ? 's' : ''} awaiting review</p>}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl border border-border p-5">
                <h2 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2"><BarChart2 size={15} className="text-primary" /> Platform Stats</h2>
                <div className="space-y-3">
                  {[{ label: 'Farmers Registered', value: users.filter(u => u.role === 'farmer').length, total: users.length }, { label: 'Suppliers Active', value: users.filter(u => u.role === 'supplier' && u.status === 'active').length, total: users.filter(u => u.role === 'supplier').length }, { label: 'Equipment Approved', value: equipment.filter(e => e.status === 'approved').length, total: equipment.length }].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{s.label}</span><span className="font-bold text-foreground">{s.value}/{s.total}</span></div>
                      <div className="w-full bg-muted rounded-full h-1.5"><div className="gradient-green h-1.5 rounded-full" style={{ width: `${(s.value / s.total) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <h2 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2"><TrendingUp size={15} className="text-primary" /> Revenue Breakdown</h2>
                <div className="space-y-2.5">
                  {[{ label: 'Equipment Rentals', amount: 280000, pct: 67 }, { label: 'Equipment Sales', amount: 95000, pct: 23 }, { label: 'Labour Bookings', amount: 42000, pct: 10 }].map(r => (
                    <div key={r.label} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{r.label}</span><span className="font-bold text-foreground">₹{(r.amount / 1000).toFixed(0)}k</span></div>
                        <div className="w-full bg-muted rounded-full h-1.5"><div className="gradient-green h-1.5 rounded-full" style={{ width: `${r.pct}%` }} /></div>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground w-8 text-right">{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 text-sm w-full" /></div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"><Filter size={14} /> Filter</button>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>{['Name', 'Phone', 'Role', 'Joined', 'Bookings', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'supplier' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>{u.role}</span></td>
                        <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{u.bookings}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.status === 'active' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>{u.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><Eye size={14} /></button>
                            <button onClick={() => setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, status: usr.status === 'active' ? 'suspended' : 'active' } : usr))} className={`p-1.5 rounded-lg transition-colors ${u.status === 'active' ? 'hover:bg-danger/10 text-danger' : 'hover:bg-success/10 text-success'}`}>{u.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'suppliers' && (
          <div className="space-y-4">
            {(['pending', 'approved', 'rejected'] as const).map(status => {
              const filtered = suppliers.filter(s => s.status === status);
              if (filtered.length === 0) return null;
              return (
                <div key={status}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{status} ({filtered.length})</p>
                  <div className="space-y-3">
                    {filtered.map(s => (
                      <div key={s.id} className="bg-card rounded-2xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.phone} · Applied {s.submitted}</p>
                            <p className="text-xs text-muted-foreground">Equipment: {s.equipment}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.docs ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>{s.docs ? '✓ Docs Submitted' : '✗ Docs Missing'}</span>
                          </div>
                          {status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => setSuppliers(prev => prev.map(sp => sp.id === s.id ? { ...sp, status: 'approved' } : sp))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success text-white text-xs font-bold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Approve</button>
                              <button onClick={() => setSuppliers(prev => prev.map(sp => sp.id === s.id ? { ...sp, status: 'rejected' } : sp))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><XCircle size={13} /> Reject</button>
                            </div>
                          )}
                          {status === 'approved' && <span className="text-success text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Approved</span>}
                          {status === 'rejected' && <span className="text-danger text-xs font-bold flex items-center gap-1"><XCircle size={14} /> Rejected</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'equipment' && (
          <div className="space-y-4">
            {(['pending', 'approved', 'rejected'] as const).map(status => {
              const filtered = equipment.filter(e => e.status === status);
              if (filtered.length === 0) return null;
              return (
                <div key={status}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{status} ({filtered.length})</p>
                  <div className="space-y-3">
                    {filtered.map(e => (
                      <div key={e.id} className="bg-card rounded-2xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-foreground">{e.name}</p>
                            <p className="text-xs text-muted-foreground">Supplier: {e.supplier} · {e.category}</p>
                            <p className="text-xs font-bold text-primary">₹{e.rentPerDay.toLocaleString('en-IN')}/day</p>
                          </div>
                          {status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => setEquipment(prev => prev.map(eq => eq.id === e.id ? { ...eq, status: 'approved' } : eq))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success text-white text-xs font-bold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Approve</button>
                              <button onClick={() => setEquipment(prev => prev.map(eq => eq.id === e.id ? { ...eq, status: 'rejected' } : eq))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><XCircle size={13} /> Reject</button>
                            </div>
                          )}
                          {status === 'approved' && <span className="text-success text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Approved</span>}
                          {status === 'rejected' && <span className="text-danger text-xs font-bold flex items-center gap-1"><XCircle size={14} /> Rejected</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'payments' && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <IndianRupee size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-xl text-foreground mb-2">Payment Analytics</h3>
            <p className="text-muted-foreground text-sm">Total platform revenue: <span className="font-bold text-primary">₹4,17,000</span></p>
            <p className="text-muted-foreground text-sm mt-1">This month: <span className="font-bold text-success">₹85,000</span></p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
