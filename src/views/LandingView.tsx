import React, { useState } from 'react';
import {
  Smartphone,
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Shield,
  Layers,
  Palette,
  Bell,
  Camera,
  MapPin,
  UploadCloud,
  WifiOff,
  Navigation,
  Download,
  Package,
  History,
  FolderGit2,
  ExternalLink,
  Cpu,
  Play,
} from 'lucide-react';
import { PhonePreview } from '../components/PhonePreview.tsx';

interface LandingViewProps {
  onStartWizard: (url?: string) => void;
  onNavigate: (view: string) => void;
}

export function LandingView({ onStartWizard, onNavigate }: LandingViewProps) {
  const [heroUrl, setHeroUrl] = useState('https://yesufapp.com');
  const [previewName, setPreviewName] = useState('Yesuf App');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroUrl.trim()) {
      onStartWizard(heroUrl.trim());
    }
  };

  const steps = [
    {
      step: '01',
      title: 'Enter Your Website',
      description: 'Provide any public HTTPS URL. Our analyzer inspects your metadata, responsive viewport, icon, and colors.',
      icon: Globe,
    },
    {
      step: '02',
      title: 'Customize Your App',
      description: 'Configure app navigation, custom splash screen, color themes, pull-to-refresh, camera, and deep links.',
      icon: Palette,
    },
    {
      step: '03',
      title: 'Preview Your App',
      description: 'Interact with your mobile app instantly in our high-fidelity simulated Android phone runtime.',
      icon: Smartphone,
    },
    {
      step: '04',
      title: 'Build & Download',
      description: 'Compile an installable Android APK or production-ready Google Play AAB bundle with one click.',
      icon: Download,
    },
  ];

  const features = [
    {
      title: 'Website to App',
      desc: 'Seamlessly wraps your responsive web application into a native Android container.',
      icon: Globe,
      tag: 'Core',
    },
    {
      title: 'Custom Branding',
      desc: 'Pick your primary brand colors, status bar tones, and navigation accents.',
      icon: Palette,
      tag: 'Styling',
    },
    {
      title: 'App Icon',
      desc: 'Auto-fetches high-resolution website favicons or upload custom adaptive launcher icons.',
      icon: Sparkles,
      tag: 'Assets',
    },
    {
      title: 'Splash Screen',
      desc: 'Custom animated launch screen with brand logo, custom background, and native spinner.',
      icon: Smartphone,
      tag: 'Experience',
    },
    {
      title: 'Push Notifications',
      desc: 'Firebase Cloud Messaging (FCM) hook integration ready for marketing and updates.',
      icon: Bell,
      tag: 'Engagement',
    },
    {
      title: 'Deep Links',
      desc: 'Handle Android App Links so links to your domain open directly inside your mobile app.',
      icon: ExternalLink,
      tag: 'Routing',
    },
    {
      title: 'Camera Support',
      desc: 'Hardware camera permission bridge with HTML5 file upload input support.',
      icon: Camera,
      tag: 'Hardware',
    },
    {
      title: 'Location Support',
      desc: 'High-accuracy GPS geolocation permission routing for store finders and local features.',
      icon: MapPin,
      tag: 'Hardware',
    },
    {
      title: 'File Uploads',
      desc: 'Android WebChromeClient file chooser hook allowing photos and document attachments.',
      icon: UploadCloud,
      tag: 'Storage',
    },
    {
      title: 'Offline / Error Screen',
      desc: 'Custom native error screen when internet drops with automatic retry button.',
      icon: WifiOff,
      tag: 'Resilience',
    },
    {
      title: 'Custom Navigation',
      desc: 'Optional native bottom bar or top tab bar overlaying your website content.',
      icon: Navigation,
      tag: 'Navigation',
    },
    {
      title: 'APK Generation',
      desc: 'Generate signed, installable .apk packages ready for sideloading or internal distribution.',
      icon: Package,
      tag: 'Build',
    },
    {
      title: 'AAB Generation',
      desc: 'Compile Android App Bundles (.aab) strictly meeting Google Play Store requirements.',
      icon: Cpu,
      tag: 'Build',
    },
    {
      title: 'Build History',
      desc: 'Full record of historical builds, live compiler log streams, and direct artifact downloads.',
      icon: History,
      tag: 'DevOps',
    },
    {
      title: 'Project Management',
      desc: 'Organize multiple client websites, apps, version numbers, and update deployments.',
      icon: FolderGit2,
      tag: 'Dashboard',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-[#635BFF]/15 to-purple-400/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#635BFF] animate-pulse" />
              <span>Next-Gen Android WebView Compiler v2.4</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#635BFF] font-bold">SDK 34 Ready</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] tracking-tight leading-[1.12]">
              Turn Any Website Into an <span className="text-[#635BFF]">Android App</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Create, customize, preview, and build your Android app from your website — without writing mobile code.
            </p>

            {/* Quick URL Input Bar */}
            <form onSubmit={handleHeroSubmit} className="max-w-xl mx-auto pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50">
                <div className="flex items-center gap-2 px-3 w-full sm:w-auto flex-1">
                  <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="url"
                    required
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full py-2 bg-transparent text-sm text-gray-900 focus:outline-none placeholder:text-gray-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#635BFF] hover:bg-[#5248E5] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#635BFF]/25 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <span>Create Your App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No coding required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Android APK & AAB</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Custom branding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Fast builds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Project dashboard</span>
              </div>
            </div>
          </div>

          {/* Hero Visual: Phone Preview */}
          <div className="mt-14 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-10 flex flex-col items-center justify-center">
              <div className="mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Instant Android Preview
              </div>
              <PhonePreview
                project={{
                  name: previewName,
                  websiteUrl: heroUrl,
                  primaryColor: '#635BFF',
                  statusBarColor: '#0F172A',
                  splashBgColor: '#0F172A',
                  navigationType: 'bottom',
                  navigationItems: [
                    { id: '1', label: 'Home', url: heroUrl, icon: 'Home' },
                    { id: '2', label: 'Shop', url: `${heroUrl}/shop`, icon: 'ShoppingBag' },
                    { id: '3', label: 'Cart', url: `${heroUrl}/cart`, icon: 'ShoppingCart' },
                    { id: '4', label: 'Account', url: `${heroUrl}/account`, icon: 'User' },
                  ],
                }}
                showControls={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#635BFF] uppercase tracking-wider bg-[#635BFF]/10 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3">How Web2APK Studio Works</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            No complex Android Studio setups, Gradle configuration, or Kotlin coding required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-[#635BFF] text-[#635BFF] group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-gray-200 group-hover:text-indigo-100 transition-colors">
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES SECTION (15 Feature Cards) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#635BFF] uppercase tracking-wider bg-[#635BFF]/10 px-3 py-1 rounded-full">
            Full Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] mt-3">
            Engineered for Modern Web & Mobile
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Everything you need to turn responsive web applications, stores, blogs, and SaaS platforms into real
            installable Android binaries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs hover:border-[#635BFF]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#635BFF]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {f.tag}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">{f.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRODUCT LIMITATIONS & ARCHITECTURAL DISCLOSURE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">Important Product Scope & Technical Transparency</h3>
              <p className="text-xs text-amber-800">
                Web2APK Studio creates an optimized, hardware-accelerated native Android WebView wrapper around your website.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-amber-900/90 pt-2 leading-relaxed">
            <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/60">
              <span className="font-bold block mb-1">What Works Great:</span>
              Mobile-responsive web applications, e-commerce stores (Shopify, WooCommerce), blogs, SaaS dashboards, PWAs,
              HTML5 apps, client-side session cookies, camera uploads, and geolocation.
            </div>
            <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/60">
              <span className="font-bold block mb-1">Website Limitations:</span>
              Websites enforcing strict anti-bot systems (like Cloudflare Turnstile blocks), captive intranet networks, or
              desktop-fixed widths will require adaptive web layout adjustments.
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-[#111827] to-[#1E293B] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to publish your Android App?</h2>
            <p className="text-sm sm:text-base text-gray-300">
              Start now by analyzing your website URL. Preview the mobile experience and compile your first APK package in minutes.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onStartWizard()}
                className="px-6 py-3 bg-[#635BFF] hover:bg-[#5248E5] text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#635BFF]/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch App Wizard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                View Plans & Pricing
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
