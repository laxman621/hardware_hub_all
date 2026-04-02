import React, { useState, useEffect } from 'react'

const CART_STORAGE_KEY = 'hardwarehub_cart'

const categories = [
  'Power Tools',
  'Hand Tools',
  'Fasteners',
  'Safety Gear',
  'Electrical',
  'Plumbing',
  'Workshop',
]

const ratings = [5, 4, 3]

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sliderValue, setSliderValue] = useState(100000)
  const [maxPrice, setMaxPrice] = useState(100000)
  const [cartNotice, setCartNotice] = useState('')

  // Fetch hardware from backend
  useEffect(() => {
    const fetchHardware = async () => {
      try {
        setLoading(true)
        let url = 'http://localhost:5000/api/hardware'
        if (selectedCategory) url += `?category=${encodeURIComponent(selectedCategory)}`
        const res = await fetch(url)
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
        } else {
          setError('Failed to load products')
        }
      } catch (err) {
        setError('Cannot connect to server')
      } finally {
        setLoading(false)
      }
    }
    fetchHardware()
  }, [selectedCategory])

  // Filter by search query and price
  const filteredProducts = products.filter(p =>
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    parseFloat(p.price) <= maxPrice
  )

  const handleAddToCart = (product) => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      const current = raw ? JSON.parse(raw) : []
      const index = current.findIndex((item) => item.hardwareId === product.hardwareId)

      if (index >= 0) {
        current[index] = {
          ...current[index],
          qty: (current[index].qty || 1) + 1,
        }
      } else {
        current.push({
          hardwareId: product.hardwareId,
          name: product.name,
          category: product.category || 'Hardware',
          price: Number(product.price),
          imageUrl: product.imageUrl || null,
          qty: 1,
        })
      }

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(current))
      setCartNotice(`${product.name} added to cart`)
      window.setTimeout(() => setCartNotice(''), 1800)
    } catch {
      setCartNotice('Could not update cart')
      window.setTimeout(() => setCartNotice(''), 1800)
    }
  }

  return (
    <div className="px-5 sm:px-8 lg:px-14 py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 sm:px-10 sm:py-12 text-white">
        <div className="absolute -top-24 -right-20 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative z-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">HardwareHub Marketplace</p>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Shop pro-grade hardware like the big marketplaces
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-200">
              Bulk pricing, fast fulfillment, and category filters built for contractors, makers, and teams.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((category) => (
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
          <form
            className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tools, brands, or SKUs"
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
            <button
              type="submit"
              className="ml-auto rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold tracking-[0.2em] text-white"
              disabled={searchQuery.trim().length === 0}
            >
              GO
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                className="appearance-none rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
                defaultValue="most-popular"
              >
                <option value="most-popular">Most popular</option>
                <option value="top-rated">Top rated</option>
                <option value="price-low">Price: Low to high</option>
                <option value="price-high">Price: High to low</option>
                <option value="newest">Newest arrivals</option>
              </select>
            </div>
            <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
              Delivery: Tomorrow
            </button>
          </div>
        </div>
      </section>

      {cartNotice && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {cartNotice}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
            <button
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              onClick={() => { setSelectedCategory(null); setSliderValue(100000); setMaxPrice(100000) }}
            >
              Reset
            </button>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Categories</p>
            <div className="mt-3 grid gap-2">
              {categories.map((category) => (
                <label
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm cursor-pointer transition
                    ${selectedCategory === category
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-700 hover:border-slate-400'}`}
                >
                  <span>{category}</span>
                  <span className={`rounded-full px-2 py-1 text-xs ${selectedCategory === category ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-500'}`}>Hot</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Rating</p>
            <div className="mt-3 grid gap-2">
              {ratings.map((rating) => (
                <label
                  key={rating}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <span className="text-slate-700">{rating} stars & up</span>
                  <span className="text-amber-500">{'★★★★★'.slice(0, rating)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Price range</p>
            <div className="mt-3 rounded-2xl border border-slate-200 px-4 py-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>NPR 0</span>
                <span>NPR 1,00,000</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="mt-3 w-full accent-slate-900"
              />
              <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                <span>Up to NPR {sliderValue.toLocaleString()}</span>
                <button
                  onClick={() => setMaxPrice(sliderValue)}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 hover:text-amber-600 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Trending hardware</h2>
            <p className="text-sm text-slate-500">{filteredProducts.length} results • updated daily</p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="mt-10 flex justify-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mt-10 rounded-2xl bg-red-50 p-6 text-center text-red-600">
              ⚠️ {error}
            </div>
          )}

          {/* Products grid */}
          {!loading && !error && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.hardwareId}
                  className="group flex flex-col rounded-3xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.10)] hover:shadow-[0_16px_48px_rgba(15,23,42,0.18)] transition-shadow duration-300 overflow-hidden"
                >
                  {/* Image container — fixed aspect ratio, no cropping */}
                  <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-contain bg-slate-50 p-4"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'https://placehold.co/400x300?text=No+Image'
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-slate-400 text-sm">
                        No Image
                      </div>
                    )}
                    {/* Category badge — top-left overlay */}
                    <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                      {product.category || 'Hardware'}
                    </span>
                    {/* Stock badge — top-right overlay */}
                    {product.stockQuantity > 0 ? (
                      <span className="absolute top-3 right-3 rounded-full bg-emerald-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        In Stock
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 rounded-full bg-red-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">{product.name}</h3>
                    {product.description && (
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
                    )}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          NPR {parseFloat(product.price).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {product.stockQuantity > 0 ? `${product.stockQuantity} units available` : 'Out of stock'}
                        </p>
                      </div>
                      <button
                        disabled={!product.isAvailable || product.stockQuantity <= 0}
                        onClick={() => handleAddToCart(product)}
                        className="rounded-2xl bg-slate-900 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-transform duration-200 group-hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="mt-10 rounded-2xl bg-slate-50 p-10 text-center text-slate-500">
              No products found.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
