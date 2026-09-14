import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  RotateCw,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Sparkles,
  ShoppingBag,
  Grid,
  ShoppingCart,
  User,
  BookOpen,
  Bookmark,
  Search,
  Home,
  Menu,
  ChevronLeft,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import type { Project, NavigationType } from '../types.ts';

interface PhonePreviewProps {
  project: Partial<Project>;
  initialMode?: 'webview' | 'splash' | 'offline';
  className?: string;
  showControls?: boolean;
}

export function PhonePreview({
  project,
  initialMode = 'webview',
  className = '',
  showControls = true,
}: PhonePreviewProps) {
  const [mode, setMode] = useState<'webview' | 'splash' | 'offline'>(initialMode);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const websiteUrl = project.websiteUrl || 'https://example.com';
  const appName = project.name || 'My Android App';
  const primaryColor = project.primaryColor || '#635BFF';
  const secondaryColor = project.secondaryColor || '#10B981';
  const statusBarColor = project.statusBarColor || primaryColor;
  const splashBgColor = project.splashBgColor || '#0F172A';
  const iconUrl = project.iconUrl || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(websiteUrl)}&sz=128`;
  const splashUrl = project.splashUrl || iconUrl;
  const navType = (project.navigationType || 'bottom') as NavigationType;
  const navItems = project.navigationItems && project.navigationItems.length > 0
    ? project.navigationItems
    : [
        { id: '1', label: 'Home', url: websiteUrl, icon: 'Home' },
        { id: '2', label: 'Explore', url: websiteUrl, icon: 'Search' },
        { id: '3', label: 'Profile', url: websiteUrl, icon: 'User' },
      ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const renderNavIcon = (iconName: string, isSelected: boolean) => {
    const iconProps = {
      className: `w-5 h-5 transition-colors ${isSelected ? '' : 'text-gray-400'}`,
      style: isSelected ? { color: primaryColor } : {},
    };

    switch (iconName.toLowerCase()) {
      case 'shoppingbag':
        return <ShoppingBag {...iconProps} />;
      case 'grid':
        return <Grid {...iconProps} />;
      case 'shoppingcart':
        return <ShoppingCart {...iconProps} />;
      case 'user':
        return <User {...iconProps} />;
      case 'bookopen':
        return <BookOpen {...iconProps} />;
      case 'bookmark':
        return <Bookmark {...iconProps} />;
      case 'search':
        return <Search {...iconProps} />;
      case 'menu':
        return <Menu {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  };

  // Determine if URL is likely blocked by iframe headers
  const isLikelyIframeBlocked =
    websiteUrl.includes('google.com') ||
    websiteUrl.includes('github.com') ||
    websiteUrl.includes('facebook.com') ||
    websiteUrl.includes('twitter.com') ||
    websiteUrl.includes('x.com') ||
    websiteUrl.includes('myshopify.com');

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Phone Controls Header Bar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between w-full max-w-sm mb-3 px-2 text-xs text-gray-500 font-medium gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('webview')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === 'webview'
                  ? 'bg-white text-[#111827] shadow-xs font-semibold'
                  : 'hover:text-gray-900'
              }`}
            >
              App View
            </button>
            <button
              onClick={() => setMode('splash')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === 'splash'
                  ? 'bg-white text-[#111827] shadow-xs font-semibold'
                  : 'hover:text-gray-900'
              }`}
            >
              Splash
            </button>
            <button
              onClick={() => setMode('offline')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === 'offline'
                  ? 'bg-white text-[#111827] shadow-xs font-semibold'
                  : 'hover:text-gray-900'
              }`}
            >
              Offline
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              title="Pull-to-refresh reload"
              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              title="Rotate device"
              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              title="Open website directly"
              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Realistic Android Phone Mockup Chassis */}
      <div
        className={`relative transition-all duration-300 bg-[#1E293B] p-[10px] rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] ring-1 ring-white/10 ${
          isLandscape ? 'w-[640px] h-[340px]' : 'w-[320px] h-[640px]'
        }`}
      >
        {/* Device Outer Volume & Power Buttons */}
        <div className="absolute -left-[13px] top-[110px] w-[3px] h-[36px] bg-gray-400 rounded-l-sm" />
        <div className="absolute -left-[13px] top-[160px] w-[3px] h-[36px] bg-gray-400 rounded-l-sm" />
        <div className="absolute -right-[13px] top-[130px] w-[3px] h-[48px] bg-gray-400 rounded-r-sm" />

        {/* Screen Display Container */}
        <div className="relative w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col">
          {/* Android Status Bar */}
          <div
            className="w-full h-7 px-5 flex items-center justify-between text-xs z-30 transition-colors shrink-0"
            style={{
              backgroundColor: mode === 'splash' ? splashBgColor : statusBarColor,
              color: '#FFFFFF',
            }}
          >
            <span className="font-semibold text-[11px] tracking-tight">{currentTime}</span>

            {/* Front Camera Notch/Punch Hole */}
            <div className="w-3.5 h-3.5 bg-black rounded-full border border-gray-700/50 shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 bg-[#1E293B] rounded-full" />
            </div>

            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono">98%</span>
                <Battery className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Loading Progress Line */}
          {isLoading && (
            <div className="w-full h-1 bg-gray-100 overflow-hidden shrink-0 z-20">
              <div
                className="h-full animate-pulse transition-all duration-300"
                style={{
                  backgroundColor: primaryColor,
                  width: '75%',
                }}
              />
            </div>
          )}

          {/* SCREEN CONTENT AREA */}
          <div className="relative flex-1 w-full overflow-hidden bg-gray-50 flex flex-col">
            {/* 1. SPLASH SCREEN MODE */}
            {mode === 'splash' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-20"
                style={{ backgroundColor: splashBgColor }}
              >
                <div className="relative mb-6">
                  {splashUrl ? (
                    <img
                      src={splashUrl}
                      alt={appName}
                      className="w-20 h-20 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {appName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight mb-1">{appName}</h2>
                <p className="text-xs text-white/60 mb-8 max-w-[200px] line-clamp-2">
                  {project.description || 'Welcome to mobile app'}
                </p>

                {/* Pulsing Spinner */}
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}

            {/* 2. OFFLINE / ERROR STATE MODE */}
            {mode === 'offline' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white z-20 animate-in fade-in">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                  <WifiOff className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Internet Connection</h3>
                <p className="text-xs text-gray-500 max-w-[220px] mb-6">
                  Please check your network settings and tap retry to reload {appName}.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* 3. WEBVIEW CONTENT */}
            {mode === 'webview' && (
              <div className="relative flex-1 flex flex-col w-full h-full overflow-hidden">
                {/* Optional Top Bar Navigation */}
                {navType === 'top' && (
                  <div
                    className="h-12 px-4 flex items-center justify-between text-white shrink-0 shadow-xs z-10"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div className="flex items-center gap-2">
                      <img src={iconUrl} alt="icon" className="w-6 h-6 rounded-md bg-white/20" />
                      <span className="font-semibold text-xs truncate max-w-[150px]">{appName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 opacity-80" />
                      <Menu className="w-4 h-4 opacity-80" />
                    </div>
                  </div>
                )}

                {/* WebView Simulated Surface or Live Iframe */}
                <div className="relative flex-1 w-full h-full bg-white overflow-hidden">
                  {/* Informational banner when iframe might be blocked */}
                  {isLikelyIframeBlocked || iframeError ? (
                    <div className="absolute inset-0 flex flex-col bg-white">
                      {/* Simulated Android WebView Header */}
                      <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-gray-600 text-xs">
                        <div className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px] text-gray-700 shadow-xs font-mono truncate">
                          <span className="truncate">{websiteUrl}</span>
                          <span className="text-emerald-600 font-bold text-[9px] ml-1">SSL SECURE</span>
                        </div>
                      </div>

                      {/* Fallback Screen with realistic interactive mock */}
                      <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-between">
                        <div>
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 mb-4">
                            <div className="flex items-start gap-2.5">
                              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div className="text-[11px] text-amber-900 leading-snug">
                                <span className="font-bold">Iframe Preview Notice:</span> This website uses
                                browser security headers (X-Frame-Options or CSP) that prohibit embedding in
                                third-party web pages.
                                <div className="mt-1 text-[10px] text-amber-800">
                                  ✓ In your compiled Android APK, it will load flawlessly inside the native
                                  Android WebView without iframe restrictions.
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Render Rich Preview Mock Card */}
                          <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-xs">
                            <div className="flex items-center gap-3 mb-3">
                              <img src={iconUrl} alt="icon" className="w-10 h-10 rounded-xl shadow-xs" />
                              <div>
                                <h4 className="font-bold text-sm text-gray-900 leading-tight">{appName}</h4>
                                <p className="text-xs text-gray-500 truncate max-w-[180px]">{websiteUrl}</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed mb-4">
                              {project.description ||
                                'The website content will render seamlessly with full JavaScript, Cookies, and LocalStorage enabled on device.'}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-gray-400 block">Package ID</span>
                                <span className="font-mono font-medium text-gray-800 truncate block">
                                  {project.packageName || 'com.web2apk.app'}
                                </span>
                              </div>
                              <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-gray-400 block">Target Android</span>
                                <span className="font-mono font-medium text-gray-800 block">
                                  API {project.targetSdk || 34} (Android 14)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 text-center">
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <span>Open URL in New Tab</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={websiteUrl}
                      title={appName}
                      onError={() => setIframeError(true)}
                      className="w-full h-full border-0 bg-white"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  )}
                </div>

                {/* Bottom Navigation Bar */}
                {navType === 'bottom' && navItems.length > 0 && (
                  <div
                    className="h-14 px-2 bg-white border-t border-gray-100 flex items-center justify-around shrink-0 z-10 shadow-lg"
                    style={{ backgroundColor: project.navBarColor || '#FFFFFF' }}
                  >
                    {navItems.map((item, idx) => {
                      const isSelected = activeTab === idx;
                      return (
                        <button
                          key={item.id || idx}
                          onClick={() => setActiveTab(idx)}
                          className="flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-transform active:scale-90"
                        >
                          {renderNavIcon(item.icon, isSelected)}
                          <span
                            className="text-[10px] font-medium leading-none truncate max-w-[60px]"
                            style={{ color: isSelected ? primaryColor : '#64748B' }}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Android Home Navigation Bar Pill Indicator */}
          <div className="w-full h-4 bg-transparent flex items-center justify-center shrink-0 z-30 pb-1">
            <div className="w-24 h-1 bg-gray-400/80 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
