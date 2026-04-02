import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  // TODO: Fetch categories from database
  const categories = [
    { id: 1, name: 'Power Tools', description: 'Drills, saws, grinders, and cordless tools.', imageUrl: null },
    { id: 2, name: 'Heavy Equipment', description: 'Excavators, loaders, and construction machinery.', imageUrl: null },
    { id: 3, name: 'Hand Tools', description: 'Professional-grade wrenches, hammers, and toolsets.', imageUrl: null },
    { id: 4, name: 'Safety Gear', description: 'Helmets, gloves, vests, and protective equipment.', imageUrl: null },
    { id: 5, name: 'Generators', description: 'Portable and standby power generators for any job.', imageUrl: null },
    { id: 6, name: 'Ladders & Scaffolding', description: 'Extension ladders, scaffolds, and lift equipment.', imageUrl: null },
  ];

  // TODO: Fetch featured products from database
  const featuredProducts = [
    {
      id: 1,
      label: 'Power Drill',
      name: 'DeWalt 20V MAX Cordless',
      description: 'Professional-grade drill with brushless motor.',
      imageUrl: null,
      price: '$199',
    },
    {
      id: 2,
      label: 'Excavator',
      name: 'Mini Excavator 3-Ton',
      description: 'Compact digger for residential and commercial jobs.',
      imageUrl: null,
      price: '$350/day',
    },
    {
      id: 3,
      label: 'Generator',
      name: 'Honda 7000W Portable',
      description: 'Reliable backup power with electric start.',
      imageUrl: null,
      price: '$85/day',
    },
  ];

  const reviews = [
    {
      id: 1,
      name: 'Mike T.',
      projectType: 'Equipment Rental',
      review: 'Rented a mini excavator for my driveway project. Clean equipment, fair pricing, and great service.',
      rating: 5,
      avatarUrl: null,
    },
    {
      id: 2,
      name: 'Sarah L.',
      projectType: 'Power Tools',
      review: 'Bought a complete drill set. High quality tools at competitive prices. Staff was very helpful.',
      rating: 5,
      avatarUrl: null,
    },
    {
      id: 3,
      name: 'Carlos M.',
      projectType: 'Repair Service',
      review: 'They fixed my generator same day. Professional diagnosis and honest pricing. Highly recommend.',
      rating: 5,
      avatarUrl: null,
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1.1fr_0.9fr] gap-8 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 rounded-3xl p-11 relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 text-blue-600 font-bold uppercase tracking-[0.2em] text-xs">
              Hardware Hub
            </span>
            <h1 className="mt-4 mb-3 text-4xl md:text-5xl lg:text-6xl leading-tight font-bold text-slate-900">
              Buy, rent, or repair professional hardware.
            </h1>
            <p className="m-0 text-slate-600 text-base leading-relaxed max-w-lg">
              Shop premium components, rent heavy equipment, and keep your tools running with expert service and support.
            </p>
            <div className="flex gap-4 mt-6 flex-wrap">
              <Link to="/shop" className="no-underline border-0 rounded-xl px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30">
                Browse equipment
              </Link>
              <Link to="/rent" className="no-underline border border-slate-300 bg-transparent text-slate-900 px-4 py-3 rounded-xl font-semibold cursor-pointer hover:bg-slate-200/50 transition-all">
                View rentals
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div>
                <strong className="text-2xl text-slate-900">1,500+</strong>
                <span className="block text-slate-600 text-sm mt-1.5">In-stock parts</span>
              </div>
              <div>
                <strong className="text-2xl text-slate-900">36h</strong>
                <span className="block text-slate-600 text-sm mt-1.5">Average turnaround</span>
              </div>
              <div>
                <strong className="text-2xl text-slate-900">4.9</strong>
                <span className="block text-slate-600 text-sm mt-1.5">Customer rating</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 grid gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col gap-3">
              <h3 className="m-0 text-xl font-bold">Equipment spotlight</h3>
              <p className="m-0 text-slate-600">Heavy-duty tools with professional-grade performance.</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-600 font-semibold">Power Tools</span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-600 font-semibold">Daily Rental</span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-600 font-semibold">Pro Grade</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 shadow-lg flex flex-col gap-3">
              <h3 className="m-0 text-xl font-bold">Need equipment?</h3>
              <p className="m-0 text-slate-300/75">Rent heavy machinery, power tools, and specialized equipment.</p>
              <Link to="/rent" className="self-start no-underline border border-slate-700 rounded-xl px-3 py-2 bg-white/5 cursor-pointer font-semibold text-white hover:bg-white/10 transition-colors">
                Browse rentals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="bg-white px-6 md:px-12 py-16 md:py-20 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-3">Browse</span>
            <h2 className="m-0 mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">Shop by category</h2>
            <p className="m-0 text-slate-600 text-lg max-w-2xl mx-auto">Find the exact part you need in seconds.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => (
              <Link to="/shop" key={category.id} className="no-underline bg-slate-50 rounded-2xl p-6 border-2 border-slate-200 flex flex-col gap-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-300">
                {category.imageUrl && (
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-200 mb-2">
                    <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="m-0 text-xl font-bold text-slate-900">{category.name}</h3>
                <p className="m-0 text-slate-600 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold uppercase tracking-wider mb-3">Featured</span>
            <h2 className="m-0 mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">Featured products</h2>
            <p className="m-0 text-slate-600 text-lg max-w-2xl mx-auto">Top picks from our builders, ready to ship today.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Link to="/shop" key={product.id} className="no-underline bg-white rounded-2xl p-6 border-2 border-slate-200 flex flex-col gap-3 min-h-[200px] transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-blue-400">
                {product.imageUrl && (
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 mb-2">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <span className="text-xs uppercase tracking-[0.2em] text-blue-600 font-bold">{product.label}</span>
                <h3 className="m-0 text-xl font-bold">{product.name}</h3>
                <p className="m-0 text-slate-600 text-sm">{product.description}</p>
                {product.price && <div className="text-2xl font-bold text-slate-900 mt-auto">{product.price}</div>}
                <span className="mt-auto text-blue-500 font-semibold text-left hover:text-blue-600 transition-colors">View details →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-slate-900 px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">Support</span>
            <h2 className="m-0 mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-white">Our services</h2>
            <p className="m-0 text-slate-300 text-lg max-w-2xl mx-auto">Support for every stage of your build journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <article className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-blue-500 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="m-0 text-lg font-bold text-white mb-3">Equipment rental</h3>
              <p className="m-0 text-slate-300 text-sm">Daily, weekly, and monthly rentals for all your project needs.</p>
            </article>
            <article className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-blue-500 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="m-0 text-lg font-bold text-white mb-3">Repairs and upgrades</h3>
              <p className="m-0 text-slate-300 text-sm">Diagnostics, tuning, and part replacements in one visit.</p>
            </article>
            <article className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-blue-500 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="m-0 text-lg font-bold text-white mb-3">On-site setup</h3>
              <p className="m-0 text-slate-300 text-sm">White-glove delivery, cable management, and setup support.</p>
            </article>
            <article className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 hover:border-blue-500 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="m-0 text-lg font-bold text-white mb-3">Warranty care</h3>
              <p className="m-0 text-slate-300 text-sm">Keep every component protected with priority support.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white px-6 md:px-12 py-16 md:py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-3">Testimonials</span>
            <h2 className="m-0 mb-3 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">Reviews</h2>
            <p className="m-0 text-slate-600 text-lg max-w-2xl mx-auto">What builders are saying about Hardware Hub.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 hover:border-amber-300 flex flex-col gap-4 transition-all hover:shadow-xl">
                <div className="flex items-center gap-3">
                  {review.avatarUrl ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-300 flex-shrink-0 ring-2 ring-blue-200">
                      <img src={review.avatarUrl} alt={review.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg ring-2 ring-blue-200">
                      {review.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="m-0 text-lg font-bold text-slate-900">{review.name}</h3>
                    <span className="text-xs text-slate-500 font-medium">{review.projectType}</span>
                  </div>
                </div>
                <p className="m-0 text-slate-700 leading-relaxed text-sm">&quot;{review.review}&quot;</p>
                <div className="text-base tracking-wide text-amber-500">
                  {'★'.repeat(review.rating)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
