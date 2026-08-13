import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Bell,
  User as UserIcon,
  LogOut,
  MapPin,
  PhoneCall,
  LayoutDashboard,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  FileText,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import NotificationDrawer from './NotificationDrawer.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, unreadNotifications } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`sticky top-0 z-50 backdrop-blur border-b shadow-md transition-colors duration-200 ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800 text-slate-100' 
          : 'bg-white/95 border-slate-200 text-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-600 to-teal-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform">
                <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isDark ? 'bg-slate-950' : 'bg-slate-900'
                }`}>
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {t('portalName')}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-500 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 font-mono">
                    Supabase & AI
                  </span>
                </div>
                <p className={`text-[10px] tracking-wider font-mono uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {t('portalSub')}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/')
                    ? isDark ? 'bg-slate-800 text-cyan-400 font-bold' : 'bg-slate-100 text-cyan-600 font-bold'
                    : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                to="/incidents"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/incidents')
                    ? isDark ? 'bg-slate-800 text-cyan-400 font-bold' : 'bg-slate-100 text-cyan-600 font-bold'
                    : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t('incidents')}
              </Link>
              <Link
                to="/emergency"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/emergency')
                    ? isDark ? 'bg-slate-800 text-cyan-400 font-bold' : 'bg-slate-100 text-cyan-600 font-bold'
                    : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t('emergency')}
              </Link>

              {isAuthenticated && !isAdmin && (
                <Link
                  to="/my-dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/my-dashboard')
                      ? isDark ? 'bg-slate-800 text-cyan-400 font-bold' : 'bg-slate-100 text-cyan-600 font-bold'
                      : isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('myReports')}
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
                      : 'text-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500" /> {t('adminConsole')}
                </Link>
              )}
            </nav>

            {/* Controls & Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              {/* Language Toggle Button */}
              <button
                onClick={toggleLanguage}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700 hover:border-emerald-500/50'
                    : 'bg-slate-100 border-slate-300 text-emerald-700 hover:bg-slate-200 hover:border-emerald-600'
                }`}
                title="Toggle Language (English / বাংলা)"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'BN' ? 'EN / English' : 'বাংলা / BN'}</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-semibold ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 hover:border-amber-500/40'
                    : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden xl:inline">{t('themeLight')}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden xl:inline">{t('themeDark')}</span>
                  </>
                )}
              </button>

              {/* Report Button */}
              <Link
                to="/report"
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs lg:text-sm px-3.5 py-2 rounded-xl shadow-md hover:shadow-red-900/30 transition-all flex items-center gap-1.5 border border-red-500/30 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" /> {t('reportIncident')}
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {/* Notification Bell */}
                  <button
                    onClick={() => setNotifDrawerOpen(true)}
                    className={`relative p-2 rounded-xl transition-colors focus:outline-none cursor-pointer ${
                      isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    title={t('notifications')}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* User Menu Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className={`flex items-center space-x-2 p-1.5 pl-3 rounded-xl border transition-colors focus:outline-none cursor-pointer ${
                        isDark
                          ? 'bg-slate-800 border-slate-700/80 hover:bg-slate-700/60'
                          : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <div className="text-left hidden lg:block">
                        <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user?.name}</div>
                        <div className="text-[10px] text-cyan-500 font-mono">{user?.role}</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </button>

                    {userDropdownOpen && (
                      <div
                        className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-xl py-2 z-50 text-sm border ${
                          isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                        onMouseLeave={() => setUserDropdownOpen(false)}
                      >
                        <div className={`px-4 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                          <p className="font-semibold">{user?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-900/50 text-cyan-300 border border-cyan-700">
                            ROLE: {user?.role}
                          </span>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2 ${
                            isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <UserIcon className="w-4 h-4 text-cyan-500" /> {t('profile')}
                        </Link>

                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 ${
                              isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-500" /> {t('adminConsole')}
                          </Link>
                        ) : (
                          <Link
                            to="/my-dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 ${
                              isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <FileText className="w-4 h-4 text-cyan-500" /> {t('myReports')}
                          </Link>
                        )}

                        <div className={`border-t my-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}></div>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> {t('logout')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <Link
                    to="/login"
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                      isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              {isAuthenticated && (
                <button
                  onClick={() => setNotifDrawerOpen(true)}
                  className="relative p-2 text-slate-300 hover:text-white"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              হোম (Home)
            </Link>
            <Link
              to="/incidents"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              ঘটনা ও ম্যাপ (Incidents)
            </Link>
            <Link
              to="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              জরুরি সেবা (Hotlines)
            </Link>
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg bg-red-600 text-white font-semibold text-center mt-2"
            >
              + রিপোর্ট করুন
            </Link>

            {isAuthenticated ? (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="px-3 py-2 bg-slate-800/60 rounded-xl">
                  <div className="font-semibold text-white">{user?.name}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                  <div className="text-[10px] text-cyan-400 mt-1 font-mono">Role: {user?.role}</div>
                </div>

                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium"
                  >
                    Admin Console & Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/my-dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                  >
                    আমার ঘটনা সমুহ (My Reports)
                  </Link>
                )}

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  My Account Profile
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-800 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-800 text-white rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-cyan-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Notification Drawer Modal */}
      <NotificationDrawer isOpen={notifDrawerOpen} onClose={() => setNotifDrawerOpen(false)} />
    </>
  );
};

export default Navbar;
