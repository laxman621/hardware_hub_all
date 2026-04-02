import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const CART_STORAGE_KEY = 'hardwarehub_cart'
const formatNpr = (value) => `NPR ${Number(value || 0).toLocaleString()}`

export default function CartPage() {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      setCartItems(raw ? JSON.parse(raw) : [])
    } catch {
      setCartItems([])
    }
  }, [])

  const updateCart = (nextItems) => {
    setCartItems(nextItems)
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems))
  }

  const increaseQty = (hardwareId) => {
    const next = cartItems.map((item) =>
      item.hardwareId === hardwareId
        ? { ...item, qty: (item.qty || 1) + 1 }
        : item
    )
    updateCart(next)
  }

  const decreaseQty = (hardwareId) => {
    const next = cartItems
      .map((item) =>
        item.hardwareId === hardwareId
          ? { ...item, qty: Math.max(0, (item.qty || 1) - 1) }
          : item
      )
      .filter((item) => item.qty > 0)
    updateCart(next)
  }

  const removeItem = (hardwareId) => {
    const next = cartItems.filter((item) => item.hardwareId !== hardwareId)
    updateCart(next)
  }

  const clearCart = () => {
    updateCart([])
  }

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0),
    [cartItems]
  )

  const delivery = subtotal > 0 ? 150 : 0
  const tax = subtotal * 0.13
  const total = subtotal + delivery + tax

  return (
    <div className="px-5 sm:px-8 lg:px-14 py-8">
      <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 sm:px-10 text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">HardwareHub Cart</p>
        <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold">Your cart is ready</h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-200">
          Review items, adjust quantities, and confirm delivery before checkout.
        </p>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold text-slate-900">Cart items</h2>
            <div className="flex items-center gap-4">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-red-600 transition-colors"
                >
                  Clear cart
                </button>
              )}
              <Link to="/shop" className="text-sm font-semibold text-blue-600 hover:text-blue-700 no-underline transition-colors">
                ← Continue shopping
              </Link>
            </div>
          </div>

          {cartItems.length === 0 && (
            <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-500">
              Your cart is empty. Add products from the shop.
            </div>
          )}

          {cartItems.map((item) => (
            <article
              key={item.hardwareId}
              className="rounded-3xl bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-24 w-24 rounded-2xl object-contain bg-slate-50 p-2"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50" />
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.category || 'Hardware'}</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">{formatNpr(item.price)}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1">
                      <button
                        onClick={() => decreaseQty(item.hardwareId)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors"
                      >
                        −
                      </button>
                      <span className="font-semibold text-slate-900 px-2">{item.qty}</span>
                      <button
                        onClick={() => increaseQty(item.hardwareId)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-emerald-600">Ready for checkout</span>
                    <button
                      onClick={() => removeItem(item.hardwareId)}
                      className="ml-auto text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatNpr(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Delivery</span>
              <span className="font-semibold text-slate-900">{formatNpr(delivery)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Tax (13%)</span>
              <span className="font-semibold text-slate-900">{formatNpr(tax)}</span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-semibold text-slate-900">{formatNpr(total)}</span>
            </div>
          </div>
          <button
            disabled={cartItems.length === 0}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Proceed to checkout
          </button>
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Secure payments, invoicing, and purchase orders supported.
          </div>
        </aside>
      </div>
    </div>
  )
}
