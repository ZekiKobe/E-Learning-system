import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { getImageUrl } from '../utils/imageUtils';

function Cart() {
  const { items, removeItem, clear } = useCartStore();
  const navigate = useNavigate();
  const total = items.reduce((sum, i) => sum + Number(i.price || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold">Cart</h1>
        <p className="text-sm text-slate-400">
          Your selected courses will appear here before checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-8 text-center text-slate-300">
          <p className="mb-3">Your cart is currently empty.</p>
          <div className="flex justify-center gap-3 text-sm">
            <Link
              to="/courses"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
            >
              Browse courses
            </Link>
            <Link
              to="/wishlist"
              className="px-4 py-2 rounded-lg border border-slate-600/60 text-slate-200 font-semibold hover:bg-slate-800/60"
            >
              View wishlist
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2 border-b border-slate-800/60 last:border-0"
              >
                <div className="w-16 h-12 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                  {item.thumbnail ? (
                    <img
                      src={getImageUrl(item.thumbnail)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-xs text-slate-400">${item.price}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-300 hover:text-red-200 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-700/40 bg-slate-900/40 p-4 text-sm">
            <div>
              <p className="text-slate-300 font-semibold">
                Total ({items.length} {items.length === 1 ? 'course' : 'courses'})
              </p>
              <p className="text-slate-400 text-xs">
                Checkout happens per course; choose one to continue.
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-extrabold">${Number.isFinite(total) ? total.toFixed(2) : '0.00'}</p>
              <button
                onClick={() =>
                  navigate(
                    items.length === 1
                      ? `/courses/${items[0].id}`
                      : `/courses/${items[0].id}`,
                  )
                }
                className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                Go to first course
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={clear}
              className="px-4 py-2 rounded-lg border border-slate-600/60 text-xs text-slate-300 hover:bg-slate-800/60"
            >
              Clear cart
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Cart;


