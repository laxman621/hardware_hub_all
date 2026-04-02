import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, bookingAPI, rentalAPI, paymentAPI } from '../utils/api';

// ─── Status badge helper ───────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    pending:   'bg-amber-100 text-amber-700',
    active:    'bg-blue-100 text-blue-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    returned:  'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
    failed:    'bg-red-100 text-red-600',
    overdue:   'bg-orange-100 text-orange-700',
  };
  const cls = map[status] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
};

// ─── Section skeleton loader ───────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl bg-slate-100 h-28 w-full" />
);

// ─── Empty state ───────────────────────────────────────────────────────────────
const Empty = ({ icon, message }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
    <span className="text-4xl">{icon}</span>
    <p className="text-sm font-medium">{message}</p>
  </div>
);

// ─── Format NPR ───────────────────────────────────────────────────────────────
const npr = (val) =>
  val != null ? `NPR ${parseFloat(val).toLocaleString()}` : '—';

// ─── Format date ──────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [profile,  setProfile]  = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rentals,  setRentals]  = useState([]);
  const [payments, setPayments] = useState([]);

  // Loading / error per section
  const [loading, setLoading] = useState({ profile: true, bookings: true, rentals: true, payments: true });
  const [errors,  setErrors]  = useState({});

  // Action loading (cancel / return)
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMsg,     setActionMsg]     = useState(null);

  // ── Fetch helpers ────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      if (res.success) setProfile(res.user);
      else setErrors(e => ({ ...e, profile: res.message }));
    } catch {
      setErrors(e => ({ ...e, profile: 'Failed to load profile' }));
    } finally {
      setLoading(l => ({ ...l, profile: false }));
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await bookingAPI.getUserBookings(user.id);
      if (res.success) setBookings(res.data ?? []);
      else setErrors(e => ({ ...e, bookings: res.message }));
    } catch {
      setErrors(e => ({ ...e, bookings: 'Failed to load bookings' }));
    } finally {
      setLoading(l => ({ ...l, bookings: false }));
    }
  }, [user?.id]);

  const fetchRentals = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await rentalAPI.getUserRentals(user.id);
      if (res.success) setRentals(res.data ?? []);
      else setErrors(e => ({ ...e, rentals: res.message }));
    } catch {
      setErrors(e => ({ ...e, rentals: 'Failed to load rentals' }));
    } finally {
      setLoading(l => ({ ...l, rentals: false }));
    }
  }, [user?.id]);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await paymentAPI.getMyPayments();
      if (res.success) setPayments(res.data ?? []);
      else setErrors(e => ({ ...e, payments: res.message }));
    } catch {
      setErrors(e => ({ ...e, payments: 'Failed to load payments' }));
    } finally {
      setLoading(l => ({ ...l, payments: false }));
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchRentals();
    fetchPayments();
  }, [fetchProfile, fetchBookings, fetchRentals, fetchPayments]);

  // ── Cancel booking ───────────────────────────────────────────────────────────
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoading(`cancel-booking-${bookingId}`);
    setActionMsg(null);
    try {
      const res = await bookingAPI.cancel(bookingId);
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Booking cancelled successfully.' });
        fetchBookings();
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Could not cancel booking.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Return rental ─────────────────────────────────────────────────────────────
  const handleReturnRental = async (rentalId) => {
    if (!window.confirm('Mark this rental as returned?')) return;
    setActionLoading(`return-rental-${rentalId}`);
    setActionMsg(null);
    try {
      const res = await rentalAPI.returnRental(rentalId);
      if (res.success) {
        setActionMsg({ type: 'success', text: 'Rental returned successfully.' });
        fetchRentals();
      } else {
        setActionMsg({ type: 'error', text: res.message || 'Could not return rental.' });
      }
    } catch {
      setActionMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setActionLoading(null);
    }
  };

  // ── Handle logout ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ── Derived stats ─────────────────────────────────────────────────────────────
  const activeRentals   = rentals.filter(r => r.status === 'active').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalSpent      = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  // ── Tabs ───────────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: '📊' },
    { id: 'bookings',  label: 'Bookings',  icon: '📅', badge: pendingBookings },
    { id: 'rentals',   label: 'Rentals',   icon: '🔧', badge: activeRentals },
    { id: 'payments',  label: 'Payments',  icon: '💳' },
    { id: 'profile',   label: 'Profile',   icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-6 py-10 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-1">My Account</p>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {profile?.name ?? user?.name ?? '…'}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{profile?.email ?? user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

        {/* ── Action feedback banner ──────────────────────────────────────── */}
        {actionMsg && (
          <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <span>{actionMsg.type === 'success' ? '✅' : '❌'}</span>
            {actionMsg.text}
            <button
              onClick={() => setActionMsg(null)}
              className="ml-auto text-current opacity-60 hover:opacity-100 bg-transparent border-0 cursor-pointer"
            >✕</button>
          </div>
        )}

        {/* ── Tab navigation ──────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 mb-8 overflow-x-auto shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.badge > 0 && (
                <span className="ml-1 flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-blue-500 text-white text-[10px] font-bold px-1">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Bookings',  value: bookings.length,  icon: '📅', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { label: 'Active Rentals',  value: activeRentals,    icon: '🔧', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                { label: 'Pending Bookings', value: pendingBookings, icon: '⏳', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                { label: 'Total Spent',     value: npr(totalSpent),  icon: '💳', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              ].map(stat => (
                <div key={stat.label} className={`rounded-2xl border p-5 ${stat.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{stat.label}</span>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Bookings</h2>
                <button onClick={() => setActiveTab('bookings')} className="text-xs text-blue-500 font-semibold bg-transparent border-0 cursor-pointer hover:text-blue-700">View all →</button>
              </div>
              {loading.bookings ? (
                <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : bookings.length === 0 ? (
                <Empty icon="📅" message="No bookings yet" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {bookings.slice(0, 3).map(b => (
                    <div key={b.bookingId} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{b.professional?.skill ?? 'Professional Service'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">📅 {fmt(b.bookingDate)} · {b.serviceHours}h</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-700">{npr(b.totalAmount)}</span>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent rentals */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Recent Rentals</h2>
                <button onClick={() => setActiveTab('rentals')} className="text-xs text-blue-500 font-semibold bg-transparent border-0 cursor-pointer hover:text-blue-700">View all →</button>
              </div>
              {loading.rentals ? (
                <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : rentals.length === 0 ? (
                <Empty icon="🔧" message="No rentals yet" />
              ) : (
                <div className="divide-y divide-slate-100">
                  {rentals.slice(0, 3).map(r => (
                    <div key={r.rentalId} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{r.hardware?.name ?? 'Hardware Item'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{fmt(r.startDate)} → {fmt(r.endDate)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-700">{npr(r.totalAmount)}</span>
                        <StatusBadge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: BOOKINGS
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">My Bookings</h2>
              <span className="text-sm text-slate-500">{bookings.length} total</span>
            </div>

            {errors.bookings && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{errors.bookings}</div>
            )}

            {loading.bookings ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Empty icon="📅" message="You haven't made any bookings yet." />
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.bookingId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">🧑‍🔧</span>
                        <p className="font-bold text-slate-900">{b.professional?.skill ?? 'Professional Service'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm text-slate-600">
                        <span>📅 Date: <strong>{fmt(b.bookingDate)}</strong></span>
                        <span>⏱ Hours: <strong>{b.serviceHours ?? '—'}</strong></span>
                        <span>💰 Amount: <strong>{npr(b.totalAmount)}</strong></span>
                        <span>🗓 Booked: <strong>{fmt(b.createdAt)}</strong></span>
                        {b.notes && <span className="col-span-2">📝 Notes: <em>{b.notes}</em></span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={b.status} />
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(b.bookingId)}
                          disabled={actionLoading === `cancel-booking-${b.bookingId}`}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-all bg-transparent cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading === `cancel-booking-${b.bookingId}` ? 'Cancelling…' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: RENTALS
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'rentals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">My Rentals</h2>
              <span className="text-sm text-slate-500">{rentals.length} total</span>
            </div>

            {errors.rentals && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{errors.rentals}</div>
            )}

            {loading.rentals ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : rentals.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Empty icon="🔧" message="You haven't rented any equipment yet." />
              </div>
            ) : (
              <div className="space-y-3">
                {rentals.map(r => (
                  <div key={r.rentalId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex gap-4 flex-1 min-w-[200px]">
                      {r.hardware?.imageUrl ? (
                        <img src={r.hardware.imageUrl} alt={r.hardware.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-slate-100" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0">🔧</div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{r.hardware?.name ?? 'Hardware Item'}</p>
                        <p className="text-xs text-slate-500 mt-0.5 capitalize">{r.hardware?.category}</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm text-slate-600">
                          <span>📅 From: <strong>{fmt(r.startDate)}</strong></span>
                          <span>📅 To: <strong>{fmt(r.endDate)}</strong></span>
                          <span>💰 Total: <strong>{npr(r.totalAmount)}</strong></span>
                          {r.returnDate && <span>↩ Returned: <strong>{fmt(r.returnDate)}</strong></span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <StatusBadge status={r.status} />
                      {r.status === 'active' && (
                        <button
                          onClick={() => handleReturnRental(r.rentalId)}
                          disabled={actionLoading === `return-rental-${r.rentalId}`}
                          className="text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 font-semibold hover:bg-blue-50 transition-all bg-transparent cursor-pointer disabled:opacity-50"
                        >
                          {actionLoading === `return-rental-${r.rentalId}` ? 'Processing…' : 'Return Item'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: PAYMENTS
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Payment History</h2>
              <span className="text-sm text-slate-500">{payments.length} records</span>
            </div>

            {/* Summary bar */}
            {payments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Paid',    value: npr(payments.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(p.amount), 0)), color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { label: 'Pending',       value: payments.filter(p => p.status === 'pending').length + ' payments',   color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { label: 'Transactions',  value: payments.length + ' total',   color: 'text-blue-700 bg-blue-50 border-blue-200' },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl border px-5 py-4 ${s.color}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{s.label}</p>
                    <p className="mt-1 text-xl font-bold">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {errors.payments && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{errors.payments}</div>
            )}

            {loading.payments ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : payments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Empty icon="💳" message="No payment history yet." />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Method</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">For</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map(p => (
                      <tr key={p.paymentId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">#{p.paymentId}</td>
                        <td className="px-5 py-3.5 text-slate-700">{fmt(p.paymentDate)}</td>
                        <td className="px-5 py-3.5 capitalize text-slate-700">{p.method ?? '—'}</td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {p.bookingId ? `Booking #${p.bookingId}` : p.rentalId ? `Rental #${p.rentalId}` : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-900">{npr(p.amount)}</td>
                        <td className="px-5 py-3.5 text-center"><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            TAB: PROFILE
        ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="max-w-xl space-y-6">
            <h2 className="text-xl font-bold text-slate-900">My Profile</h2>

            {errors.profile && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{errors.profile}</div>
            )}

            {loading.profile ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : profile ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Avatar area */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-8 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{profile.name}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{profile.email}</p>
                    <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      profile.role === 'admin' ? 'bg-amber-400/20 text-amber-300' : 'bg-blue-400/20 text-blue-300'
                    }`}>
                      {profile.role}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="divide-y divide-slate-100">
                  {[
                    { label: 'Full Name',   value: profile.name },
                    { label: 'Email',       value: profile.email },
                    { label: 'Phone',       value: profile.phone ?? 'Not provided' },
                    { label: 'Role',        value: profile.role },
                    { label: 'Member Since', value: fmt(profile.createdAt) },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-6 py-4">
                      <span className="text-sm font-semibold text-slate-500">{row.label}</span>
                      <span className="text-sm text-slate-800 font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Account actions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Account Actions</h3>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-all border-0 cursor-pointer"
              >
                <span>🚪 Sign out of your account</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
