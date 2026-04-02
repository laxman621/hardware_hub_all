import React, { useState, useEffect } from 'react'
import { professionalAPI, bookingAPI } from '../utils/api'

const skills = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Welder',
  'Mason',
  'Painter',
  'HVAC Technician',
  'General Labour',
]

const experienceFilters = [
  { label: 'Any experience', value: 0 },
  { label: '2+ years', value: 2 },
  { label: '5+ years', value: 5 },
  { label: '10+ years', value: 10 },
]

function StarRating({ rating }) {
  const filled = Math.round(parseFloat(rating || 0))
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {'★'.repeat(filled)}
      <span className="text-slate-300">{'★'.repeat(5 - filled)}</span>
    </span>
  )
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [minExperience, setMinExperience] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingModal, setBookingModal] = useState(null) // professional object
  const [bookingForm, setBookingForm] = useState({ bookingDate: '', serviceHours: '', notes: '' })
  const [bookingStatus, setBookingStatus] = useState(null) // { type: 'success'|'error', message }
  const [bookingLoading, setBookingLoading] = useState(false)

  // Fetch professionals
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true)
        setError(null)
        const url = 'http://localhost:5000/api/professionals'
        const res = await fetch(url)
        const data = await res.json()
        if (data.success) {
          // Backend currently returns `professionals` for this resource.
          setProfessionals(data.professionals || data.data || [])
        } else {
          setError('Failed to load professionals')
          setProfessionals([])
        }
      } catch {
        setError('Cannot connect to server')
        setProfessionals([])
      } finally {
        setLoading(false)
      }
    }
    fetchProfessionals()
  }, [])

  // Client-side filters
  const filtered = professionals.filter(p => {
    const matchesSkill = selectedSkill ? p.skill === selectedSkill : true
    const matchesSearch =
      p.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.bio && p.bio.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesExp = (p.experienceYears || 0) >= minExperience
    return matchesSkill && matchesSearch && matchesExp
  })

  // Open booking modal
  const openBooking = (pro) => {
    setBookingModal(pro)
    setBookingForm({ bookingDate: '', serviceHours: '', notes: '' })
    setBookingStatus(null)
  }

  // Submit booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setBookingLoading(true)
    setBookingStatus(null)
    try {
      const data = await bookingAPI.create({
        professionalId: bookingModal.professionalId,
        bookingDate: bookingForm.bookingDate,
        serviceHours: parseInt(bookingForm.serviceHours),
        notes: bookingForm.notes,
      })

      if (data.success) {
        const amount = parseFloat(data?.data?.totalAmount || 0)
        setBookingStatus({ type: 'success', message: `Booking confirmed! Total: NPR ${amount.toLocaleString()}` })
        setBookingForm({ bookingDate: '', serviceHours: '', notes: '' })
      } else {
        setBookingStatus({ type: 'error', message: data.message || 'Booking failed' })
      }
    } catch {
      setBookingStatus({ type: 'error', message: 'Cannot connect to server' })
    } finally {
      setBookingLoading(false)
    }
  }

  // Today's date in YYYY-MM-DD for min date on date input
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="px-5 sm:px-8 lg:px-14 py-8">

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 sm:px-10 sm:py-12 text-white">
        <div className="absolute -top-24 -right-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">HardwareHub Services</p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Hire skilled professionals <br className="hidden sm:block" /> for any job
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-200">
            Vetted electricians, plumbers, carpenters and more — available for on-site work at transparent hourly rates.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="mt-6 rounded-3xl bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <form className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3" onSubmit={e => e.preventDefault()}>
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by skill or description..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Clear
            </button>
          )}
        </form>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">

        {/* Sidebar Filters */}
        <aside className="rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
            <button
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              onClick={() => { setSelectedSkill(null); setMinExperience(0); setSearchQuery('') }}
            >
              Reset
            </button>
          </div>

          {/* Skill filter */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Skill / Trade</p>
            <div className="mt-3 grid gap-2">
              {skills.map(skill => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm text-left transition
                    ${selectedSkill === skill
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-400'}`}
                >
                  <span>{skill}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Experience filter */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Experience</p>
            <div className="mt-3 grid gap-2">
              {experienceFilters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setMinExperience(f.value)}
                  className={`flex items-center rounded-xl border px-3 py-2 text-sm transition
                    ${minExperience === f.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-400'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Available professionals</h2>
            <p className="text-sm text-slate-500">{filtered.length} professionals found</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-10 flex justify-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-10 rounded-2xl bg-red-50 p-6 text-center text-red-600">⚠️ {error}</div>
          )}

          {/* Cards Grid */}
          {!loading && !error && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(pro => (
                <article
                  key={pro.professionalId}
                  className="group flex flex-col rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.10)] hover:shadow-[0_16px_48px_rgba(15,23,42,0.18)] transition-shadow duration-300 overflow-hidden"
                >
                  {/* Avatar / Header */}
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-700 px-6 pt-8 pb-6 flex flex-col items-center text-center">
                    {/* Availability badge */}
                    <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white
                      ${pro.isAvailable ? 'bg-emerald-500/90' : 'bg-red-500/90'}`}>
                      {pro.isAvailable ? 'Available' : 'Busy'}
                    </span>
                    {/* Avatar circle with initials */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {pro.skill ? pro.skill[0].toUpperCase() : '?'}
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{pro.skill}</h3>
                    <StarRating rating={pro.rating} />
                    <p className="mt-1 text-xs text-slate-400">
                      {pro.experienceYears ? `${pro.experienceYears} yrs experience` : 'Experience not listed'}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    {pro.bio && (
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{pro.bio}</p>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {pro.hourlyRate ? `NPR ${parseFloat(pro.hourlyRate).toLocaleString()}/hr` : 'Rate on request'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">per hour</p>
                      </div>
                      <button
                        disabled={!pro.isAvailable}
                        onClick={() => openBooking(pro)}
                        className="rounded-2xl bg-slate-900 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-transform duration-200 group-hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && !error && filtered.length === 0 && (
            <div className="mt-10 rounded-2xl bg-slate-50 p-10 text-center text-slate-500">
              No professionals found. Try adjusting your filters.
            </div>
          )}
        </section>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Book Professional</p>
                <h3 className="text-lg font-bold text-white mt-0.5">{bookingModal.skill}</h3>
                <p className="text-sm text-slate-300 mt-0.5">
                  NPR {parseFloat(bookingModal.hourlyRate || 0).toLocaleString()}/hr
                </p>
              </div>
              <button
                onClick={() => setBookingModal(null)}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 mb-1.5">
                  Booking Date
                </label>
                <input
                  type="date"
                  min={today}
                  required
                  value={bookingForm.bookingDate}
                  onChange={e => setBookingForm(f => ({ ...f, bookingDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 mb-1.5">
                  Service Hours
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  required
                  placeholder="e.g. 4"
                  value={bookingForm.serviceHours}
                  onChange={e => setBookingForm(f => ({ ...f, serviceHours: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-900"
                />
                {bookingForm.serviceHours && bookingModal.hourlyRate && (
                  <p className="mt-1.5 text-xs text-emerald-600 font-semibold">
                    Estimated total: NPR {(parseFloat(bookingModal.hourlyRate) * parseInt(bookingForm.serviceHours || 0)).toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 mb-1.5">
                  Notes <span className="text-slate-400 normal-case tracking-normal font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the work needed..."
                  value={bookingForm.notes}
                  onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-900 resize-none"
                />
              </div>

              {/* Status message */}
              {bookingStatus && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium
                  ${bookingStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {bookingStatus.type === 'success' ? '✅' : '⚠️'} {bookingStatus.message}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setBookingModal(null)}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || bookingStatus?.type === 'success'}
                  className="flex-1 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
