import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, authAPI, hardwareAPI, professionalAPI, rentalAPI } from '../utils/api';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

const npr = (v) => (v != null ? `NPR ${parseFloat(v).toLocaleString()}` : '-');

const initialForm = {
  userId: '',
  skill: '',
  experienceYears: '',
  hourlyRate: '',
  bio: '',
};

const initialHardwareForm = {
  name: '',
  category: '',
  description: '',
  price: '',
  rentalPricePerDay: '',
  stockQuantity: '',
  imageUrl: '',
  isAvailable: true,
};

const rentalStatuses = ['pending', 'active', 'returned', 'completed', 'cancelled', 'overdue'];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);

  const [hardware, setHardware] = useState([]);
  const [publicProfessionals, setPublicProfessionals] = useState([]);
  const [adminProfessionals, setAdminProfessionals] = useState([]);
  const [rentals, setRentals] = useState([]);

  const [loading, setLoading] = useState({
    profile: true,
    overview: true,
    professionals: true,
    rentals: true,
  });

  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  const [form, setForm] = useState(initialForm);
  const [hardwareForm, setHardwareForm] = useState(initialHardwareForm);
  const [editingHardwareId, setEditingHardwareId] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      if (res.success) setProfile(res.user);
    } catch {
      // handled by route protection and generic UI state
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, []);

  const loadOverview = useCallback(async () => {
    try {
      const [hRes, pRes] = await Promise.all([hardwareAPI.getAll(), professionalAPI.getAll()]);
      setHardware(hRes?.success ? hRes.data || [] : []);
      setPublicProfessionals(pRes?.success ? (pRes.professionals || pRes.data || []) : []);
    } catch {
      setError('Failed to load admin overview');
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  }, []);

  const loadAdminProfessionals = useCallback(async () => {
    try {
      const res = await adminAPI.getAllProfessionals();
      if (!res.success) {
        setError(res.message || 'Failed to load professional records');
        setAdminProfessionals([]);
        return;
      }
      setAdminProfessionals(res.professionals || []);
    } catch {
      setError('Failed to load professional records');
      setAdminProfessionals([]);
    } finally {
      setLoading((prev) => ({ ...prev, professionals: false }));
    }
  }, []);

  const loadRentals = useCallback(async () => {
    try {
      const res = await rentalAPI.getAll();
      if (!res.success) {
        setError(res.message || 'Failed to load rentals');
        setRentals([]);
        return;
      }
      setRentals(res.data || []);
    } catch {
      setError('Failed to load rentals');
      setRentals([]);
    } finally {
      setLoading((prev) => ({ ...prev, rentals: false }));
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadOverview();
    loadAdminProfessionals();
    loadRentals();
  }, [loadProfile, loadOverview, loadAdminProfessionals, loadRentals]);

  const stats = useMemo(() => {
    const totalHardware = hardware.length;
    const inStock = hardware.filter((h) => Number(h.stockQuantity || 0) > 0).length;
    const rentable = hardware.filter((h) => h.rentalPricePerDay != null).length;
    const availablePros = publicProfessionals.filter((p) => p.isAvailable).length;

    return { totalHardware, inStock, rentable, availablePros };
  }, [hardware, publicProfessionals]);

  const toggleProAvailability = async (pro) => {
    setActionLoading(`toggle-${pro.professionalId}`);
    setActionMsg(null);
    try {
      const res = await adminAPI.updateProfessional(pro.professionalId, {
        isAvailable: !pro.isAvailable,
      });

      if (res.success) {
        setActionMsg({ type: 'success', text: 'Professional availability updated.' });
        loadAdminProfessionals();
        loadOverview();
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Update failed.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error while updating professional.' });
    } finally {
      setActionLoading('');
    }
  };

  const deleteProfessional = async (pro) => {
    if (!window.confirm(`Delete professional profile for ${pro.skill}?`)) return;

    setActionLoading(`delete-${pro.professionalId}`);
    setActionMsg(null);
    try {
      const res = await adminAPI.deleteProfessional(pro.professionalId);
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Professional profile deleted.' });
        loadAdminProfessionals();
        loadOverview();
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Delete failed.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error while deleting professional.' });
    } finally {
      setActionLoading('');
    }
  };

  const createProfessional = async (e) => {
    e.preventDefault();

    setActionLoading('create-professional');
    setActionMsg(null);
    try {
      const payload = {
        userId: Number(form.userId),
        skill: form.skill,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        bio: form.bio || undefined,
      };

      const res = await adminAPI.createProfessional(payload);

      if (res.success) {
        setActionMsg({ type: 'success', text: 'Professional profile created.' });
        setForm(initialForm);
        loadAdminProfessionals();
        loadOverview();
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Create failed.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error while creating professional.' });
    } finally {
      setActionLoading('');
    }
  };

  const resetHardwareForm = () => {
    setHardwareForm(initialHardwareForm);
    setEditingHardwareId(null);
  };

  const submitHardware = async (e) => {
    e.preventDefault();
    setActionLoading('hardware-save');
    setActionMsg(null);

    try {
      const payload = {
        ...hardwareForm,
        price: Number(hardwareForm.price),
        rentalPricePerDay: hardwareForm.rentalPricePerDay ? Number(hardwareForm.rentalPricePerDay) : null,
        stockQuantity: Number(hardwareForm.stockQuantity || 0),
      };

      const res = editingHardwareId
        ? await hardwareAPI.update(editingHardwareId, payload)
        : await hardwareAPI.create(payload);

      if (res.success) {
        setActionMsg({ type: 'success', text: editingHardwareId ? 'Hardware updated.' : 'Hardware created.' });
        resetHardwareForm();
        loadOverview();
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Unable to save hardware.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error while saving hardware.' });
    } finally {
      setActionLoading('');
    }
  };

  const startEditHardware = (item) => {
    setEditingHardwareId(item.hardwareId);
    setHardwareForm({
      name: item.name || '',
      category: item.category || '',
      description: item.description || '',
      price: item.price ?? '',
      rentalPricePerDay: item.rentalPricePerDay ?? '',
      stockQuantity: item.stockQuantity ?? 0,
      imageUrl: item.imageUrl || '',
      isAvailable: Boolean(item.isAvailable),
    });
    setActiveTab('inventory');
  };

  const removeHardware = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    setActionLoading(`hardware-delete-${item.hardwareId}`);
    setActionMsg(null);
    try {
      const res = await hardwareAPI.delete(item.hardwareId);
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Hardware deleted.' });
        loadOverview();
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Delete failed.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error while deleting hardware.' });
    } finally {
      setActionLoading('');
    }
  };

  const changeRentalStatus = async (rental, status) => {
    setActionLoading(`rental-status-${rental.rentalId}`);
    setActionMsg(null);
    try {
      const res = await rentalAPI.updateStatus(rental.rentalId, status);
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Rental status updated.' });
        loadRentals();
        loadOverview();
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Status update failed.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error while updating status.' });
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="px-5 sm:px-8 lg:px-14 py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 sm:px-10 sm:py-12 text-white">
        <div className="absolute -top-24 -right-20 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Admin Console</p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">Platform Control Dashboard</h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-200">
            Manage catalog and professionals from a single control center.
          </p>
          <p className="mt-3 text-sm text-amber-200">
            Signed in as: {profile?.name || user?.name || 'Admin'} ({profile?.email || user?.email || '-'})
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'professionals', label: 'Professionals' },
            { key: 'inventory', label: 'Inventory' },
            { key: 'rentals', label: 'Rentals' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {actionMsg && (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            actionMsg.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'overview' && (
        <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {loading.overview ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-100" />)
          ) : (
            <>
              <article className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Hardware Items</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalHardware}</p>
              </article>
              <article className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">In Stock</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.inStock}</p>
              </article>
              <article className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rentable Items</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.rentable}</p>
              </article>
              <article className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.10)]">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Available Professionals</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.availablePros}</p>
              </article>
            </>
          )}
        </section>
      )}

      {activeTab === 'professionals' && (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Manage Professionals</h2>
              <span className="text-sm text-slate-500">{adminProfessionals.length} profiles</span>
            </div>

            {loading.professionals ? (
              <div className="mt-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div>
            ) : adminProfessionals.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">No professional profiles found.</div>
            ) : (
              <div className="mt-6 space-y-3">
                {adminProfessionals.map((pro) => (
                  <article
                    key={pro.professionalId}
                    className="rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-base font-semibold text-slate-900">{pro.skill}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {pro.user?.name || 'Unlinked user'} • {npr(pro.hourlyRate)} • {pro.experienceYears || 0} yrs
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Created: {fmt(pro.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleProAvailability(pro)}
                        disabled={actionLoading === `toggle-${pro.professionalId}`}
                        className={`rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                          pro.isAvailable
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {actionLoading === `toggle-${pro.professionalId}`
                          ? 'Saving...'
                          : pro.isAvailable
                          ? 'Set Busy'
                          : 'Set Active'}
                      </button>

                      <button
                        onClick={() => deleteProfessional(pro)}
                        disabled={actionLoading === `delete-${pro.professionalId}`}
                        className="rounded-lg bg-red-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-700 hover:bg-red-200"
                      >
                        {actionLoading === `delete-${pro.professionalId}` ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] h-fit">
            <h3 className="text-xl font-semibold text-slate-900">Create Professional Profile</h3>
            <p className="mt-2 text-sm text-slate-500">Assign an existing user ID to professional role.</p>

            <form onSubmit={createProfessional} className="mt-5 space-y-3">
              <input
                type="number"
                min="1"
                required
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
                placeholder="User ID"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                required
                value={form.skill}
                onChange={(e) => setForm((f) => ({ ...f, skill: e.target.value }))}
                placeholder="Skill (e.g. Electrician)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                value={form.experienceYears}
                onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
                placeholder="Experience (years)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                value={form.hourlyRate}
                onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
                placeholder="Hourly rate (NPR)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Professional bio"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />

              <button
                type="submit"
                disabled={actionLoading === 'create-professional'}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {actionLoading === 'create-professional' ? 'Creating...' : 'Create Profile'}
              </button>
            </form>
          </aside>
        </section>
      )}

      {activeTab === 'inventory' && (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">Hardware Inventory</h2>
              <span className="text-sm text-slate-500">{hardware.length} items</span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2">Name</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hardware.map((item) => (
                    <tr key={item.hardwareId} className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-800">{item.name}</td>
                      <td className="py-2 text-slate-600">{item.category || '-'}</td>
                      <td className="py-2 text-slate-600">{npr(item.price)}</td>
                      <td className="py-2 text-slate-600">{item.stockQuantity ?? 0}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditHardware(item)}
                            className="rounded-lg bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeHardware(item)}
                            disabled={actionLoading === `hardware-delete-${item.hardwareId}`}
                            className="rounded-lg bg-red-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] h-fit">
            <h3 className="text-xl font-semibold text-slate-900">{editingHardwareId ? 'Edit Hardware' : 'Add Hardware'}</h3>
            <form onSubmit={submitHardware} className="mt-5 space-y-3">
              <input required value={hardwareForm.name} onChange={(e) => setHardwareForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input value={hardwareForm.category} onChange={(e) => setHardwareForm((f) => ({ ...f, category: e.target.value }))} placeholder="Category" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <textarea rows={2} value={hardwareForm.description} onChange={(e) => setHardwareForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input type="number" required min="0" value={hardwareForm.price} onChange={(e) => setHardwareForm((f) => ({ ...f, price: e.target.value }))} placeholder="Price (NPR)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input type="number" min="0" value={hardwareForm.rentalPricePerDay} onChange={(e) => setHardwareForm((f) => ({ ...f, rentalPricePerDay: e.target.value }))} placeholder="Rental/day (optional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input type="number" min="0" value={hardwareForm.stockQuantity} onChange={(e) => setHardwareForm((f) => ({ ...f, stockQuantity: e.target.value }))} placeholder="Stock quantity" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <input value={hardwareForm.imageUrl} onChange={(e) => setHardwareForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="Image URL" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={hardwareForm.isAvailable} onChange={(e) => setHardwareForm((f) => ({ ...f, isAvailable: e.target.checked }))} />
                Available
              </label>

              <div className="flex gap-2">
                <button type="submit" disabled={actionLoading === 'hardware-save'} className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50">
                  {actionLoading === 'hardware-save' ? 'Saving...' : (editingHardwareId ? 'Update' : 'Create')}
                </button>
                {editingHardwareId && (
                  <button type="button" onClick={resetHardwareForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </aside>
        </section>
      )}

      {activeTab === 'rentals' && (
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Rental Management</h2>
            <span className="text-sm text-slate-500">{rentals.length} rentals</span>
          </div>

          {loading.rentals ? (
            <div className="mt-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div>
          ) : rentals.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">No rentals found.</div>
          ) : (
            <div className="mt-6 space-y-3">
              {rentals.map((rental) => (
                <article key={rental.rentalId} className="rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{rental.hardware?.name || 'Hardware Item'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      User: {rental.user?.name || `#${rental.userId}`} • {fmt(rental.startDate)} to {fmt(rental.endDate)} • {npr(rental.totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={rental.status || 'active'}
                      onChange={(e) => changeRentalStatus(rental, e.target.value)}
                      disabled={actionLoading === `rental-status-${rental.rentalId}`}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700"
                    >
                      {rentalStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
