import { Search, ShoppingCart, User, Wrench, X, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Shop', href: '/shop' },
  { name: 'Rent', href: '/rent' },
  { name: 'Professionals', href: '/professionals' },
];

export default function Navbar(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const dashboardPath = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'professional'
      ? '/professional/dashboard'
      : '/dashboard';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800/60 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between h-18 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 no-underline">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-100 font-[Rajdhani,sans-serif]">{props.title}</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={
                  location.pathname === item.href
                    ? 'px-4 py-2 rounded-lg text-sm font-semibold text-blue-400 bg-blue-400/15 no-underline transition-all'
                    : 'px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-blue-400 hover:bg-slate-800/60 no-underline transition-all'
                }
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isSearchOpen ? (
              <div className="relative flex items-center w-70 animate-in fade-in zoom-in duration-200">
                <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full py-2 pl-10 pr-9 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 text-sm outline-none focus:bg-slate-800/70 focus:border-blue-500 transition-all"
                  autoFocus
                />
                <button 
                  className="absolute right-2 flex items-center justify-center w-6 h-6 border-0 bg-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-100 rounded-md cursor-pointer transition-all"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                className="flex items-center justify-center w-10 h-10 rounded-lg border-0 bg-transparent text-slate-400 hover:bg-slate-800/60 hover:text-blue-400 cursor-pointer transition-all" 
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            <Link to="/cart" className="flex items-center justify-center w-10 h-10 rounded-lg border-0 bg-transparent text-slate-400 hover:bg-slate-800/60 hover:text-blue-400 cursor-pointer transition-all no-underline" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardPath}
                  className={
                    location.pathname === dashboardPath
                      ? 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-blue-400 bg-blue-400/15 no-underline transition-all'
                      : 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-blue-400 hover:bg-slate-800/60 no-underline transition-all'
                  }
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.role === 'admin' ? 'Admin Panel' : user?.role === 'professional' ? 'Pro Panel' : (user?.name?.split(' ')[0] ?? 'Dashboard')}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 text-slate-300 text-sm font-semibold border-0 cursor-pointer transition-all hover:bg-slate-700 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold no-underline border-0 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
