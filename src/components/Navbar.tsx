import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  Layers,
  Cpu,
  Bell,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  Shield,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Home,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { GoogleIcon } from './GoogleIcon.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function Navbar({ currentView, onNavigate, onOpenAuth }: NavbarProps) {
  const { user, logout, switchRole, notifications, unreadCount, markNotificationRead, markAllNotificationsRead, loginWithGoogle } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAppView = [
    'dashboard',
    'apps',
    'create-app',
    'app-details',
    'builds',
    'build-details',
    'admin',
    'settings',
  ].includes(currentView);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-[#635BFF]/20 group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#111827] flex items-center gap-1.5">
                  Web2APK <span className="text-[#635BFF] font-medium text-xs bg-[#635BFF]/10 px-2 py-0.5 rounded-full">Studio</span>
                </span>
                <span className="text-[10px] text-gray-500 block leading-none font-medium">Website to Android SaaS</span>
              </div>
            </button>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('home')}
                className="hidden"
                style={{ display: 'none' }}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              {!isAppView ? (
                <>
                  <button
                    onClick={() => onNavigate('how-it-works')}
                    className="hidden"
                    style={{ display: 'none' }}
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => onNavigate('features')}
                    className="hidden"
                    style={{ display: 'none' }}
                  >
                    Features
                  </button>
                  <button
                    onClick={() => onNavigate('pricing')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentView === 'pricing' ? 'text-[#635BFF] bg-[#635BFF]/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Pricing
                  </button>
                  <button
                    onClick={() => onNavigate('docs')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentView === 'docs' ? 'text-[#635BFF] bg-[#635BFF]/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Documentation
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentView === 'dashboard' ? 'text-[#635BFF] bg-[#635BFF]/10 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('apps')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentView === 'apps' ? 'text-[#635BFF] bg-[#635BFF]/10 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    My Apps
                  </button>
                  <button
                    onClick={() => onNavigate('builds')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentView === 'builds' ? 'text-[#635BFF] bg-[#635BFF]/10 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Builds
                  </button>
                  <button
                    onClick={() => onNavigate('docs')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentView === 'docs' ? 'text-[#635BFF] bg-[#635BFF]/10 font-semibold' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Docs
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                        currentView === 'admin' ? 'text-purple-600 bg-purple-50 font-semibold' : 'text-purple-700 hover:bg-purple-50/50'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                      <span>Admin</span>
                    </button>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Build Worker Architecture Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pipeline: Online (Demo / Worker)</span>
            </div>

            {/* Role Switcher Pill */}
            {user && (
              <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded-lg text-xs font-medium text-gray-600">
                <button
                  onClick={() => switchRole('user')}
                  className="hidden"
                  style={{ display: 'none' }}
                >
                  User
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  className="hidden"
                  style={{ display: 'none' }}
                >
                  Admin
                </button>
              </div>
            )}

            {user ? (
              <>
                {/* Create App Button */}
                <button
                  onClick={() => onNavigate('create-app')}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create App</span>
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#635BFF]/10 text-[#635BFF] rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-[#635BFF] hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-500">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.link) {
                                  if (n.link.startsWith('/builds/')) {
                                    onNavigate('build-details', n.link.split('/builds/')[1]);
                                  }
                                }
                                setShowNotifications(false);
                              }}
                              className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !n.read ? 'bg-indigo-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                {n.type === 'success' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                ) : (
                                  <Bell className="w-4 h-4 text-[#635BFF] mt-0.5 shrink-0" />
                                )}
                                <div className="flex-1">
                                  <h5 className="text-xs font-bold text-gray-900 leading-tight">{n.title}</h5>
                                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{n.message}</p>
                                  <span className="text-[10px] text-gray-400 mt-1 block">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-200"
                    />
                    <div className="hidden lg:block text-left">
                      <span className="text-xs font-bold text-gray-900 block leading-tight">{user.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                        {user.plan} Plan
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 leading-snug">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        {user.authProvider === 'google' ? (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-[10px] font-semibold">
                            <GoogleIcon className="w-2.5 h-2.5" />
                            <span>Google Account (Builds Allowed)</span>
                          </div>
                        ) : (
                          <div className="mt-2 space-y-1.5">
                            <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md font-medium">
                              Google Sign-In required to build apps
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                setShowUserMenu(false);
                                await loginWithGoogle();
                              }}
                              className="w-full py-1.5 px-2 bg-gray-900 hover:bg-black text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <GoogleIcon className="w-3 h-3" />
                              <span>Connect with Google</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          onNavigate('home');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Home className="w-3.5 h-3.5 text-[#635BFF]" />
                        <span className="font-semibold text-gray-900">Home Page</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span>Account Settings</span>
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1 animate-in fade-in duration-200">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'home' ? 'text-[#635BFF] bg-[#635BFF]/10 font-bold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Page</span>
            </button>

            {user && (
              <>
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentView === 'dashboard' ? 'text-[#635BFF] bg-[#635BFF]/10 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('apps');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentView === 'apps' ? 'text-[#635BFF] bg-[#635BFF]/10 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>My Apps</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('builds');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    currentView === 'builds' ? 'text-[#635BFF] bg-[#635BFF]/10 font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Build Pipeline</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                onNavigate('how-it-works');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-gray-400" />
              <span>How It Works</span>
            </button>
            <button
              onClick={() => {
                onNavigate('features');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span>Features</span>
            </button>
            <button
              onClick={() => {
                onNavigate('pricing');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <span>Pricing</span>
            </button>
            <button
              onClick={() => {
                onNavigate('docs');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>Documentation</span>
            </button>

            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  onNavigate('create-app');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#635BFF] text-white text-sm font-bold rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Android App</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
