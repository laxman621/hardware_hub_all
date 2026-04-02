import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, bookingAPI, professionalAPI } from '../utils/api';

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

const npr = (v) => (v != null ? `NPR ${parseFloat(v).toLocaleString()}` : '-');

export default function ProfessionalDashboardPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [proProfile, setProProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState({ profile: true, pro: true, bookings: true });
  const [msg, setMsg] = useState(null);
  const [bookingActionLoading, setBookingActionLoading] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      if (res.success) setProfile(res.user);
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, []);

  const loadProProfile = useCallback(async () => {
    try {
      const res = await professionalAPI.getMyProfile();
      if (res.success) setProProfile(res.professional);
      else setMsg({ type: 'error', text: res.message || 'Could not load professional profile.' });
    } catch {
      setMsg({ type: 'error', text: 'Could not load professional profile.' });
    } finally {
      setLoading((prev) => ({ ...prev, pro: false }));
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const res = await professionalAPI.getMyBookings();
      if (res.success) setBookings(res.bookings || []);
      else setBookings([]);
    } catch {
      setBookings([]);
    } finally {
      setLoading((prev) => ({ ...prev, bookings: false }));
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadProProfile();
    loadBookings();
  }, [loadProfile, loadProProfile, loadBookings]);

  const toggleAvailability = async () => {
    if (!proProfile) return;

    setMsg(null);
    try {
      const res = await professionalAPI.updateMyAvailability(!proProfile.isAvailable);
      if (res.success) {
        setMsg({ type: 'success', text: 'Availability updated successfully.' });
        setProProfile((prev) => (prev ? { ...prev, isAvailable: !prev.isAvailable } : prev));
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to update availability.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error updating availability.' });
    }
  };

  const handleBookingDecision = async (bookingId, status) => {
    setMsg(null);
    setBookingActionLoading(bookingId);

    try {
      const res =
        status === 'cancelled'
          ? await bookingAPI.remove(bookingId)
          : await bookingAPI.updateStatus(bookingId, status);

      if (res.success) {
        setBookings((prev) =>
          status === 'cancelled'
            ? prev.filter((b) => b.bookingId !== bookingId)
            : prev.map((b) => (b.bookingId === bookingId ? { ...b, status } : b))
        );

        setMsg({
          type: 'success',
          text: status === 'confirmed' ? 'Booking accepted successfully.' : 'Booking rejected and removed successfully.',
        });
      } else {
        setMsg({ type: 'error', text: res.message || 'Could not update booking status.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error while updating booking status.' });
    } finally {
      setBookingActionLoading(null);
    }
  };

  return (
    <div className="px-5 sm:px-8 lg:px-14 py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 sm:px-10 sm:py-12 text-white">
        <div className="absolute -top-24 -right-20 h-60 w-60 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Professional Hub</p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">Work Orders Dashboard</h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-200">
            Manage your availability and review incoming client bookings.
          </p>
          <p className="mt-3 text-sm text-emerald-200">
            Signed in as: {profile?.name || user?.name || 'Professional'} ({profile?.email || user?.email || '-'})
          </p>
        </div>
      </section>

      {msg && (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
            msg.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] h-fit">
          <h2 className="text-xl font-semibold text-slate-900">My Profile</h2>

          {(loading.profile || loading.pro) ? (
            <div className="mt-5 h-36 animate-pulse rounded-2xl bg-slate-100" />
          ) : proProfile ? (
            <div className="mt-5 space-y-3">
               <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Name</p>
                <p className="text-base font-semibold text-slate-900">{user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Skill</p>
                <p className="text-base font-semibold text-slate-900">{proProfile.skill}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Experience</p>
                <p className="text-base text-slate-700">{proProfile.experienceYears || 0} years</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Rate</p>
                <p className="text-base text-slate-700">{npr(proProfile.hourlyRate)} /hr</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Availability</p>
                <p className={`text-sm font-semibold ${proProfile.isAvailable ? 'text-emerald-600' : 'text-amber-700'}`}>
                  {proProfile.isAvailable ? 'Available' : 'Busy'}
                </p>
              </div>

              <button
                onClick={toggleAvailability}
                className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-700"
              >
                Set {proProfile.isAvailable ? 'Busy' : 'Available'}
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Professional profile not found. Contact admin to complete profile setup.
            </div>
          )}
        </aside>

        <section className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">My Bookings</h2>
            <span className="text-sm text-slate-500">{bookings.length} total</span>
          </div>

          {loading.bookings ? (
            <div className="mt-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}</div>
          ) : bookings.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No bookings yet.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {bookings.map((booking) => (
                <article key={booking.bookingId} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{booking.user?.name || 'Client'}</p>
                      <p className="text-xs text-slate-500 mt-1">{booking.user?.email || '-'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-600">
                      {booking.status || 'pending'}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>Date: <strong>{fmt(booking.bookingDate)}</strong></p>
                    <p>Hours: <strong>{booking.serviceHours || 0}</strong></p>
                    <p>Total: <strong>{npr(booking.totalAmount)}</strong></p>
                    <p>Created: <strong>{fmt(booking.createdAt)}</strong></p>
                  </div>
                  {booking.notes && <p className="mt-2 text-sm text-slate-500">Note: {booking.notes}</p>}

                  {(booking.status || 'pending') === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleBookingDecision(booking.bookingId, 'confirmed')}
                        disabled={bookingActionLoading === booking.bookingId}
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {bookingActionLoading === booking.bookingId ? 'Updating...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleBookingDecision(booking.bookingId, 'cancelled')}
                        disabled={bookingActionLoading === booking.bookingId}
                        className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {bookingActionLoading === booking.bookingId ? 'Updating...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
