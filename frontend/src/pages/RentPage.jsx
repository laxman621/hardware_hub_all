import React, { useEffect, useMemo, useState } from 'react'
import { hardwareAPI, rentalAPI } from '../utils/api'

const steps = [
  {
    title: 'Reserve online',
    desc: 'Pick dates, add delivery, and lock inventory instantly.',
  },
  {
    title: 'Confirm pickup',
    desc: 'Skip the counter with QR check-in and ready staging.',
  },
  {
    title: 'Return or extend',
    desc: 'Extend on the fly or schedule a smooth return.',
  },
]

const npr = (amount) => `NPR ${Number(amount || 0).toLocaleString()}`

const todayStr = () => new Date().toISOString().slice(0, 10)

const dayAfterStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function RentPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedCategories, setSelectedCategories] = useState([])
  const [maxRate, setMaxRate] = useState(10000)
  const [maxRateSlider, setMaxRateSlider] = useState(10000)
  const [sortBy, setSortBy] = useState('popular')

  const [bookingModal, setBookingModal] = useState(null)
  const [startDate, setStartDate] = useState(todayStr())
  const [endDate, setEndDate] = useState(dayAfterStr())
  const [reserveLoading, setReserveLoading] = useState(false)
  const [reserveMsg, setReserveMsg] = useState(null)

  useEffect(() => {
    const loadRentables = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await hardwareAPI.getAll()
        if (!res?.success) {
          setError(res?.message || 'Failed to load rental equipment')
          return
        }

        const rentable = (res.data || []).filter(
          (item) => item.rentalPricePerDay != null && item.isAvailable
        )
        setItems(rentable)
      } catch (err) {
        setError('Cannot connect to rental service')
      } finally {
        setLoading(false)
      }
    }

    loadRentables()
  }, [])

  const equipmentCategories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))],
    [items]
  )

  const filteredItems = useMemo(() => {
    let list = [...items]

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      list = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      )
    }

    if (selectedCategories.length > 0) {
      list = list.filter((item) => selectedCategories.includes(item.category))
    }

    list = list.filter((item) => Number(item.rentalPricePerDay) <= maxRate)

    if (sortBy === 'price-low') {
      list.sort((a, b) => Number(a.rentalPricePerDay) - Number(b.rentalPricePerDay))
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => Number(b.rentalPricePerDay) - Number(a.rentalPricePerDay))
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else {
      list.sort((a, b) => Number(b.stockQuantity) - Number(a.stockQuantity))
    }

    return list
  }, [items, maxRate, searchQuery, selectedCategories, sortBy])

  const availabilityFilters = useMemo(
    () => [
      { label: 'Available now', count: filteredItems.filter((item) => item.stockQuantity > 0).length },
      { label: 'Limited stock', count: filteredItems.filter((item) => item.stockQuantity > 0 && item.stockQuantity <= 3).length },
      { label: 'High stock', count: filteredItems.filter((item) => item.stockQuantity > 3).length },
    ],
    [filteredItems]
  )

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [startDate, endDate])

  const estimatedTotal = useMemo(() => {
    if (!bookingModal || totalDays <= 0) return 0
    return Number(bookingModal.rentalPricePerDay) * totalDays
  }, [bookingModal, totalDays])

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setMaxRateSlider(10000)
    setMaxRate(10000)
    setSortBy('popular')
  }

  const openBooking = (item) => {
    setBookingModal(item)
    setStartDate(todayStr())
    setEndDate(dayAfterStr())
    setReserveMsg(null)
  }

  const reserveNow = async () => {
    if (!bookingModal) {
      setReserveMsg({ type: 'error', text: 'Choose an item to reserve first.' })
      return
    }

    if (!startDate || !endDate || totalDays <= 0) {
      setReserveMsg({ type: 'error', text: 'Please select valid rental dates.' })
      return
    }

    try {
      setReserveLoading(true)
      setReserveMsg(null)

      const res = await rentalAPI.create({
        hardwareId: bookingModal.hardwareId,
        startDate,
        endDate,
      })

      if (!res?.success) {
        setReserveMsg({ type: 'error', text: res?.message || 'Could not create rental.' })
        return
      }

      setReserveMsg({ type: 'success', text: 'Rental created successfully.' })

      setItems((prev) =>
        prev
          .map((item) =>
            item.hardwareId === bookingModal.hardwareId
              ? {
                  ...item,
                  stockQuantity: Math.max(0, Number(item.stockQuantity) - 1),
                  isAvailable: Number(item.stockQuantity) - 1 > 0,
                }
              : item
          )
          .filter((item) => item.isAvailable)
      )
      setBookingModal(null)
    } catch (err) {
      setReserveMsg({ type: 'error', text: 'Network error while creating rental.' })
    } finally {
      setReserveLoading(false)
    }
  }

  return (
    <div className="px-5 sm:px-8 lg:px-14 py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 sm:px-10 text-white">
        <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-100">Rentals</p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Rent heavy-duty gear on your schedule
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-amber-50">
            Daily, weekly, and project bundles with fast pickup or site delivery.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {equipmentCategories.slice(0, 8).map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.25em] text-slate-200"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rental tools, category, or use case"
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-lg border border-slate-300 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600"
              >
                Clear
              </button>
            )}
          </form>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
            <button
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Equipment type</p>
            <div className="mt-3 grid gap-2">
              {equipmentCategories.map((category) => (
                <label
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="accent-slate-900"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Daily rate</p>
            <div className="mt-3 rounded-2xl border border-slate-200 px-4 py-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>NPR 0</span>
                <span>NPR 10,000</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={maxRateSlider}
                onChange={(e) => setMaxRateSlider(Number(e.target.value))}
                className="mt-3 w-full accent-slate-900"
              />
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>Up to {npr(maxRateSlider)}</span>
                <button
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                  onClick={() => setMaxRate(maxRateSlider)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Availability</p>
            <div className="mt-3 grid gap-2">
              {availabilityFilters.map((filter) => (
                <label
                  key={filter.label}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{filter.label}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                    {filter.count}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Available rentals</h2>
              <p className="mt-1 text-sm text-slate-500">{filteredItems.length} items ready for reservation</p>
            </div>
            <select
              className="appearance-none rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Most popular</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
              <option value="newest">Newest additions</option>
            </select>
          </div>
          {loading && (
            <div className="mt-10 flex justify-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
              No rentable equipment found for selected filters.
            </div>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.hardwareId}
                className="group flex flex-col rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.10)] hover:shadow-[0_16px_48px_rgba(15,23,42,0.18)] transition-shadow duration-300 overflow-hidden"
              >
                <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-contain bg-slate-50 p-4"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-sm text-slate-500">No image</div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    {item.category || 'Hardware'}
                  </span>
                  <span className="absolute top-3 right-3 rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                    Stock {item.stockQuantity}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">{item.name}</h3>
                  {item.description && (
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-900">{npr(item.rentalPricePerDay)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">per day</p>
                    </div>
                    <button
                      onClick={() => openBooking(item)}
                      className="rounded-2xl bg-slate-900 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-transform duration-200 group-hover:-translate-y-0.5 hover:bg-slate-700"
                    >
                      Reserve Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="mt-8 rounded-3xl bg-slate-950 p-6 text-white">
        <h3 className="text-xl font-semibold">How rentals work</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Step {index + 1}</p>
              <h4 className="mt-2 text-lg font-semibold">{step.title}</h4>
              <p className="mt-1 text-sm text-slate-200">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Reserve Equipment</p>
                <h3 className="text-lg font-bold text-white mt-0.5">{bookingModal.name}</h3>
                <p className="text-sm text-slate-300 mt-0.5">{npr(bookingModal.rentalPricePerDay)} per day</p>
              </div>
              <button
                onClick={() => setBookingModal(null)}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                X
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 mb-1.5">Start Date</label>
                <input
                  type="date"
                  min={todayStr()}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 mb-1.5">End Date</label>
                <input
                  type="date"
                  min={startDate || todayStr()}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p>Duration: <strong>{totalDays} day(s)</strong></p>
                <p className="mt-1">Estimated total: <strong>{npr(estimatedTotal)}</strong></p>
              </div>

              {reserveMsg && (
                <div
                  className={`rounded-xl px-3 py-2 text-sm ${
                    reserveMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {reserveMsg.text}
                </div>
              )}

              <button
                onClick={reserveNow}
                disabled={reserveLoading}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {reserveLoading ? 'Reserving...' : 'Confirm Rental'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
