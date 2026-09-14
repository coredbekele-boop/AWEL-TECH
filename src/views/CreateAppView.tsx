import React, { useState, useEffect } from 'react';
import {
  Globe,
  Palette,
  Navigation,
  Sliders,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Search,
  UploadCloud,
  Check,
  Code,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Bell,
  Fingerprint,
  Bluetooth,
  Moon,
  Zap,
  Shield,
  FileText,
  Database,
  SlidersHorizontal,
  Terminal,
  Link,
  Copy,
  Radio,
  Activity,
  Eye,
  Info,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { PhonePreview } from '../components/PhonePreview.tsx';
import { GoogleAuthGateModal } from '../components/GoogleAuthGateModal.tsx';
import { GoogleIcon } from '../components/GoogleIcon.tsx';
import type {
  Project,
  NavigationType,
  NavItem,
  WebsiteAnalysis,
  AppPermissions,
  DeepLinkConfig,
} from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface CreateAppViewProps {
  initialUrl?: string;
  onAppCreated: (projectId: string, buildId?: string) => void;
  onCancel: () => void;
}

const JAVA_RESERVED_WORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
  'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
  'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
  'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public',
  'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
  'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null'
]);

function getPackageNameIssues(pkg: string): string[] {
  const issues: string[] = [];
  if (!pkg.trim()) {
    return ['Package name cannot be empty'];
  }
  const parts = pkg.split('.');
  if (parts.length < 2) {
    issues.push('Must contain at least two segments separated by dots (e.g. com.example.app)');
  }
  if (!/^[a-z0-9._]+$/.test(pkg)) {
    issues.push('Only lowercase letters (a-z), digits (0-9), and underscores are allowed');
  }
  for (const p of parts) {
    if (!p) {
      issues.push('Segments cannot be empty (no consecutive dots)');
    } else if (/^[0-9]/.test(p)) {
      issues.push(`Segment "${p}" cannot start with a digit`);
    } else if (JAVA_RESERVED_WORDS.has(p)) {
      issues.push(`"${p}" is a reserved Java keyword and cannot be used`);
    }
  }
  return issues;
}

export function CreateAppView({ initialUrl = '', onAppCreated, onCancel }: CreateAppViewProps) {
  const { user, showToast } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WebsiteAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);

  // Project Configuration State
  const [websiteUrl, setWebsiteUrl] = useState(initialUrl || 'https://yesufapp.com');
  const [appName, setAppName] = useState('ShopPulse Store');
  const [description, setDescription] = useState('Official mobile app for browsing catalog, purchasing, and order updates.');
  const [packageName, setPackageName] = useState('com.web2apk.shoppulse');

  // Branding
  const [primaryColor, setPrimaryColor] = useState('#635BFF');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [splashBgColor, setSplashBgColor] = useState('#0F172A');
  const [statusBarColor, setStatusBarColor] = useState('#0F172A');
  const [navBarColor, setNavBarColor] = useState('#FFFFFF');
  const [iconUrl, setIconUrl] = useState('https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=128&auto=format&fit=crop&q=80');
  const [splashUrl, setSplashUrl] = useState('https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=256&auto=format&fit=crop&q=80');

  // Navigation
  const [navigationType, setNavigationType] = useState<NavigationType>('bottom');
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: '1', label: 'Shop', url: 'https://yesufapp.com', icon: 'ShoppingBag' },
    { id: '2', label: 'Catalog', url: 'https://yesufapp.com/collections', icon: 'Grid' },
    { id: '3', label: 'Cart', url: 'https://yesufapp.com/cart', icon: 'ShoppingCart' },
    { id: '4', label: 'Account', url: 'https://yesufapp.com/account', icon: 'User' },
  ]);

  // Deep Linking Studio
  const [deepLinkConfig, setDeepLinkConfig] = useState<DeepLinkConfig>({
    enabled: true,
    scheme: 'shoppulse',
    host: 'yesufapp.com',
    pathPrefixes: ['/products', '/collections', '/cart'],
    autoVerify: true,
  });
  const [newPrefixInput, setNewPrefixInput] = useState('');

  // Granular Permissions
  const [permissions, setPermissions] = useState<AppPermissions>({
    javascript: true,
    cookies: true,
    localStorage: true,
    pullToRefresh: true,
    fileUpload: true,
    camera: true,
    microphone: false,
    geolocation: true,
    notifications: true,
    biometrics: false,
    bluetooth: false,
    wakeLock: false,
    openExternalLinks: true,
    handleDownloads: true,
    openTelLinks: true,
    openMailtoLinks: true,
    deepLinks: true,
  });

  // Android Settings & Metadata
  const [versionName, setVersionName] = useState('1.0.0');
  const [versionCode, setVersionCode] = useState(1);
  const [autoIncrementVersion, setAutoIncrementVersion] = useState(true);
  const [minSdk, setMinSdk] = useState(26);
  const [targetSdk, setTargetSdk] = useState(34);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('portrait');
  const [keepScreenOn, setKeepScreenOn] = useState(false);
  const [userAgentSuffix, setUserAgentSuffix] = useState('Web2APK/2.4 (Android; Mobile)');
  const [cacheMode, setCacheMode] = useState<'LOAD_DEFAULT' | 'LOAD_CACHE_ELSE_NETWORK' | 'LOAD_NO_CACHE'>('LOAD_DEFAULT');
  const [hardwareAccelerated, setHardwareAccelerated] = useState(true);
  const [webGlEnabled, setWebGlEnabled] = useState(true);
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');

  // Active sub-tab in Behavior (Step 5)
  const [permCategory, setPermCategory] = useState<'all' | 'hardware' | 'location' | 'system' | 'web'>('all');

  // Build options
  const { trackBuild } = useToast();
  const [buildType, setBuildType] = useState<'apk' | 'aab' | 'bundle'>('apk');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Perform initial analysis if initialUrl passed
  useEffect(() => {
    if (initialUrl) {
      handleAnalyzeUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleAnalyzeUrl = async (urlToAnalyze?: string) => {
    const target = urlToAnalyze || websiteUrl;
    if (!target.trim()) return;

    setIsAnalyzing(true);
    try {
      const data = await api.analyzeWebsite(target);
      setAnalysisResult(data);

      if (data.title && appName === 'ShopPulse Store') {
        setAppName(data.title.slice(0, 30));
      }
      if (data.description && !description) {
        setDescription(data.description);
      }
      if (data.favicon) {
        setIconUrl(data.favicon);
        setSplashUrl(data.favicon);
      }
      if (data.themeColor && data.themeColor !== '#635BFF') {
        setPrimaryColor(data.themeColor);
      }

      // Auto-suggest clean package name
      try {
        const hostname = new URL(data.url).hostname.replace(/^www\./i, '');
        const parts = hostname.split('.').reverse();
        const validParts = parts.map((p) => p.replace(/[^a-z0-9]/gi, '').toLowerCase());
        if (validParts.length >= 2) {
          setPackageName(`com.${validParts[0]}.${validParts[1] || 'app'}`);
        }
      } catch {
        // keep default
      }

      showToast('Website analysis complete!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to analyze URL', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const packageIssues = getPackageNameIssues(packageName);
  const isPackageValid = packageIssues.length === 0;

  const autoSuggestPackageName = () => {
    try {
      const urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : 'https://' + websiteUrl);
      const hostParts = urlObj.hostname.replace(/^www\./i, '').split('.').reverse();
      const cleanParts = hostParts.map((p) => p.replace(/[^a-z0-9]/gi, '').toLowerCase()).filter(Boolean);
      const cleanAppName = appName.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'app';
      if (cleanParts.length >= 2) {
        setPackageName(`com.${cleanParts[0]}.${cleanAppName.slice(0, 15)}`);
      } else {
        setPackageName(`com.${cleanAppName.slice(0, 15)}.app`);
      }
      showToast('Generated compliant package name', 'info');
    } catch {
      setPackageName('com.mybrand.app');
    }
  };

  const handleBuildAndCreate = async () => {
    if (!isPackageValid) {
      showToast(`Package Name Error: ${packageIssues[0]}`, 'error');
      setCurrentStep(2);
      return;
    }

    // Google Sign-In is strictly required to start building the app
    if (!user || user.authProvider !== 'google') {
      showToast('Google Sign-In required: Please sign in with Google to start building', 'warning');
      setShowGoogleAuthModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create project record
      const res = await api.createProject({
        name: appName,
        websiteUrl,
        packageName,
        description,
        iconUrl,
        splashUrl,
        primaryColor,
        secondaryColor,
        splashBgColor,
        statusBarColor,
        navBarColor,
        navigationType,
        navigationItems: navItems,
        permissions,
        deepLinkConfig,
        orientation,
        versionName,
        versionCode,
        minSdk,
        targetSdk,
        keepScreenOn,
        userAgentSuffix,
        customCss,
        customJs,
        cacheMode,
        hardwareAccelerated,
        webGlEnabled,
        autoIncrementVersion,
      });

      const projectId = res.project.id;
      showToast(`App "${appName}" saved. Triggering ${buildType.toUpperCase()} build...`, 'success');

      // 2. Start build job with toast tracking
      const buildRes = await api.startBuild(projectId, buildType, simulateFailure);
      trackBuild(buildRes.build.id);
      onAppCreated(projectId, buildRes.build.id);
    } catch (err: any) {
      showToast(err.message || 'Failed to start build', 'error');
      setIsSubmitting(false);
    }
  };

  const stepsHeader = [
    { num: 1, title: 'Website' },
    { num: 2, title: 'Details' },
    { num: 3, title: 'Branding' },
    { num: 4, title: 'Navigation' },
    { num: 5, title: 'Behavior' },
    { num: 6, title: 'Android' },
    { num: 7, title: 'Preview' },
    { num: 8, title: 'Build' },
  ];

  // Assemble dynamic project preview object
  const currentProjectPreview: Partial<Project> = {
    name: appName,
    websiteUrl,
    packageName,
    description,
    iconUrl,
    splashUrl,
    primaryColor,
    secondaryColor,
    splashBgColor,
    statusBarColor,
    navBarColor,
    navigationType,
    navigationItems: navItems,
    permissions,
    deepLinkConfig,
    orientation,
    targetSdk,
    versionName,
    versionCode,
    userAgentSuffix,
    cacheMode,
    hardwareAccelerated,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Wizard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold text-[#635BFF] uppercase tracking-wider">Multi-Step Studio</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Create New Android App</h1>
          <p className="text-xs text-gray-500 mt-1">Configure your web application wrapper with native capabilities.</p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors self-start sm:self-auto"
        >
          Cancel & Return
        </button>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="mb-10 overflow-x-auto pb-2">
        <div className="flex items-center min-w-[650px] justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 -z-0" />
          {stepsHeader.map((s) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className="flex flex-col items-center group relative z-10"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                      : isCurrent
                      ? 'bg-[#635BFF] text-white ring-4 ring-[#635BFF]/20 shadow-md'
                      : 'bg-white text-gray-400 border border-gray-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap ${
                    isCurrent ? 'text-[#635BFF]' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form & Phone Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Wizard Steps (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
          {/* STEP 1: WEBSITE URL & ANALYZER */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Step 1: Enter Your Website URL</h3>
                <p className="text-xs text-gray-500">
                  Enter your publicly accessible web application or website. We will verify reachability and extract metadata.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Website Address (URL)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      required
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:bg-white font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAnalyzeUrl()}
                    disabled={isAnalyzing || !websiteUrl.trim()}
                    className="px-4 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Website'}</span>
                  </button>
                </div>
              </div>

              {/* Analysis Result Card */}
              {analysisResult && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-gray-800">
                        {analysisResult.reachable ? 'Website Reachable & Connected' : 'Unreachable Warning'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                      {analysisResult.responseTimeMs ? `${analysisResult.responseTimeMs}ms response` : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 block font-medium">Page Title</span>
                      <span className="font-semibold text-gray-900 truncate block">{analysisResult.title || 'Untitled'}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                      {analysisResult.favicon && (
                        <img src={analysisResult.favicon} alt="Favicon" className="w-6 h-6 rounded-md object-contain" />
                      )}
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Favicon Detected</span>
                        <span className="font-semibold text-gray-900 text-xs">Auto-synced</span>
                      </div>
                    </div>
                  </div>

                  {/* Warnings Display */}
                  {analysisResult.warnings && analysisResult.warnings.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl space-y-1 text-xs text-amber-900">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Analysis Notes:</span>
                      </div>
                      {analysisResult.warnings.map((w, idx) => (
                        <p key={idx} className="text-[11px] leading-relaxed pl-5 list-disc">
                          • {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: APP DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Step 2: App Details & Package ID</h3>
                <p className="text-xs text-gray-500">
                  Set the public name and Android package identifier for the app store.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Application Name</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="My Store App"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Official mobile experience..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Android Package Name (Application ID)</label>
                  <button
                    type="button"
                    onClick={autoSuggestPackageName}
                    className="text-[11px] text-[#635BFF] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Suggest</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                    placeholder="com.example.app"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:bg-white pr-10 ${
                      isPackageValid
                        ? 'border-emerald-300 focus:ring-emerald-500'
                        : 'border-rose-300 focus:ring-rose-500 text-rose-800'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isPackageValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                </div>

                {isPackageValid ? (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Valid Android package identifier (Google Play compliant)</span>
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1 text-xs text-rose-700">
                    <span className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Package ID Requirements:
                    </span>
                    <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                      {packageIssues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-[11px] text-gray-400 mt-1.5">
                  The Application ID uniquely identifies your app on Google Play and Android devices. Once published, it cannot be changed.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: BRANDING & COLORS */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Step 3: Visual Branding & Assets</h3>
                <p className="text-xs text-gray-500">
                  Customize the launcher icon, splash screen visual, and brand palette.
                </p>
              </div>

              {/* Icon & Splash Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-gray-800">App Icon (Launcher)</label>
                  <div className="flex items-center gap-3">
                    <img src={iconUrl} alt="App Icon" className="w-12 h-12 rounded-xl border border-gray-300 shadow-xs" />
                    <input
                      type="text"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                      placeholder="Icon URL"
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg truncate"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-gray-800">Splash Screen Logo</label>
                  <div className="flex items-center gap-3">
                    <img src={splashUrl} alt="Splash Logo" className="w-12 h-12 rounded-xl border border-gray-300 shadow-xs" />
                    <input
                      type="text"
                      value={splashUrl}
                      onChange={(e) => setSplashUrl(e.target.value)}
                      placeholder="Splash Logo URL"
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Colors Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status Bar Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={statusBarColor}
                      onChange={(e) => setStatusBarColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={statusBarColor}
                      onChange={(e) => setStatusBarColor(e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Splash Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={splashBgColor}
                      onChange={(e) => setSplashBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={splashBgColor}
                      onChange={(e) => setSplashBgColor(e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: NAVIGATION ARCHITECTURE */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Step 4: Mobile App Navigation</h3>
                <p className="text-xs text-gray-500">
                  Select how users navigate between major sections of your app.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { type: 'bottom', label: 'Bottom Bar', desc: 'Tabs at bottom' },
                  { type: 'top', label: 'Top Bar', desc: 'App header title' },
                  { type: 'website', label: 'Pure Website', desc: 'Use site menu' },
                  { type: 'none', label: 'Full Screen', desc: 'No wrapper nav' },
                ].map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setNavigationType(opt.type as NavigationType)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      navigationType === opt.type
                        ? 'border-[#635BFF] bg-[#635BFF]/5 ring-2 ring-[#635BFF]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="block font-bold text-xs text-gray-900">{opt.label}</span>
                    <span className="text-[10px] text-gray-500">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {navigationType === 'bottom' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">Bottom Navigation Tabs</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (navItems.length < 5) {
                          setNavItems([
                            ...navItems,
                            { id: Date.now().toString(), label: 'New Tab', url: websiteUrl, icon: 'Home' },
                          ]);
                        }
                      }}
                      className="text-xs text-[#635BFF] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tab</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {navItems.map((item, idx) => (
                      <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2">
                          <select
                            value={item.icon}
                            onChange={(e) => {
                              const updated = [...navItems];
                              updated[idx].icon = e.target.value;
                              setNavItems(updated);
                            }}
                            className="w-28 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium"
                          >
                            <option value="Home">Home Icon</option>
                            <option value="ShoppingBag">Bag / Shop</option>
                            <option value="Grid">Grid / Catalog</option>
                            <option value="ShoppingCart">Cart</option>
                            <option value="User">User / Profile</option>
                            <option value="Search">Search</option>
                            <option value="Bell">Bell / Alerts</option>
                            <option value="Heart">Favorites</option>
                            <option value="Settings">Settings</option>
                          </select>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const updated = [...navItems];
                              updated[idx].label = e.target.value;
                              setNavItems(updated);
                            }}
                            placeholder="Tab Label"
                            className="w-24 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium"
                          />
                        </div>
                        <input
                          type="text"
                          value={item.url}
                          onChange={(e) => {
                            const updated = [...navItems];
                            updated[idx].url = e.target.value;
                            setNavItems(updated);
                          }}
                          placeholder="Destination URL (e.g. /products)"
                          className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs truncate"
                        />
                        {navItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setNavItems(navItems.filter((_, i) => i !== idx))}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors self-end sm:self-center"
                            title="Remove tab"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deep Linking & Android App Links Studio */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-[#635BFF]" />
                    <h4 className="text-xs font-bold text-gray-900">Deep Linking & Android App Links Studio</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={deepLinkConfig.enabled}
                      onChange={(e) => setDeepLinkConfig({ ...deepLinkConfig, enabled: e.target.checked })}
                      className="w-4 h-4 text-[#635BFF] rounded"
                    />
                    <span>Enable App Links</span>
                  </label>
                </div>
                <p className="text-[11px] text-gray-500">
                  Allow Android to launch your installed app directly whenever users click links on WhatsApp, Gmail, Twitter, or Google Search.
                </p>

                {deepLinkConfig.enabled && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Custom URL Scheme (e.g. shoppulse://)
                        </label>
                        <input
                          type="text"
                          value={deepLinkConfig.scheme}
                          onChange={(e) =>
                            setDeepLinkConfig({
                              ...deepLinkConfig,
                              scheme: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                            })
                          }
                          placeholder="myapp"
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                        />
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          Links like <code className="font-mono text-gray-600">{deepLinkConfig.scheme || 'app'}://page</code> will open the app.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Verified Domain Host (HTTPS App Link)
                        </label>
                        <input
                          type="text"
                          value={deepLinkConfig.host}
                          onChange={(e) => setDeepLinkConfig({ ...deepLinkConfig, host: e.target.value })}
                          placeholder="example.com"
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                        />
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          Domain associated with Android autoVerify intent-filters.
                        </span>
                      </div>
                    </div>

                    {/* Path Prefixes Manager */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        URL Path Prefixes to Capture in App
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={newPrefixInput}
                          onChange={(e) => setNewPrefixInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newPrefixInput.trim()) {
                                const prefix = newPrefixInput.startsWith('/') ? newPrefixInput : '/' + newPrefixInput;
                                setDeepLinkConfig({
                                  ...deepLinkConfig,
                                  pathPrefixes: [...deepLinkConfig.pathPrefixes, prefix.trim()],
                                });
                                setNewPrefixInput('');
                              }
                            }
                          }}
                          placeholder="Enter path (e.g. /products, /catalog) & press Enter"
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newPrefixInput.trim()) {
                              const prefix = newPrefixInput.startsWith('/') ? newPrefixInput : '/' + newPrefixInput;
                              setDeepLinkConfig({
                                ...deepLinkConfig,
                                pathPrefixes: [...deepLinkConfig.pathPrefixes, prefix.trim()],
                              });
                              setNewPrefixInput('');
                            }
                          }}
                          className="px-3 py-1.5 bg-[#635BFF] text-white rounded-xl text-xs font-bold hover:bg-[#5248E5]"
                        >
                          Add Path
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {deepLinkConfig.pathPrefixes.map((prefix, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-purple-200 rounded-lg text-xs font-mono text-purple-700 shadow-xs"
                          >
                            <span>{prefix}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setDeepLinkConfig({
                                  ...deepLinkConfig,
                                  pathPrefixes: deepLinkConfig.pathPrefixes.filter((_, i) => i !== idx),
                                })
                              }
                              className="text-gray-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs">
                      <input
                        type="checkbox"
                        checked={deepLinkConfig.autoVerify}
                        onChange={(e) => setDeepLinkConfig({ ...deepLinkConfig, autoVerify: e.target.checked })}
                        className="w-4 h-4 text-[#635BFF] rounded"
                      />
                      <span className="font-semibold text-gray-800">
                        Enable <code className="font-mono text-gray-900">android:autoVerify=&quot;true&quot;</code> (Bypasses Android app chooser dialog)
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: APP BEHAVIOR & GRANULAR PERMISSIONS */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Step 5: Granular Permission & Capability Management</h3>
                <p className="text-xs text-gray-500">
                  Select Android device permissions. Web2APK maps these to AndroidManifest.xml and runtime permission prompts.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-2xl">
                {[
                  { id: 'all', label: 'All Capabilities' },
                  { id: 'hardware', label: 'Hardware & Media' },
                  { id: 'location', label: 'Location & GPS' },
                  { id: 'system', label: 'System & Security' },
                  { id: 'web', label: 'Web Engine & Routing' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPermCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      permCategory === cat.id
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Granular Permission Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  // Hardware & Media
                  {
                    key: 'camera',
                    cat: 'hardware',
                    label: 'Hardware Camera',
                    desc: 'Take photos and scan QR codes in WebView',
                    manifest: 'android.permission.CAMERA',
                    badge: 'Runtime Prompt',
                  },
                  {
                    key: 'microphone',
                    cat: 'hardware',
                    label: 'Microphone & Audio Recording',
                    desc: 'Record audio memos, voice search, and video calls',
                    manifest: 'android.permission.RECORD_AUDIO',
                    badge: 'Runtime Prompt',
                  },
                  {
                    key: 'bluetooth',
                    cat: 'hardware',
                    label: 'Bluetooth LE Connectivity',
                    desc: 'Connect to peripheral devices, beacons, and printers',
                    manifest: 'android.permission.BLUETOOTH_CONNECT',
                    badge: 'Android 12+',
                  },
                  {
                    key: 'wakeLock',
                    cat: 'hardware',
                    label: 'Wake Lock (Prevent Sleep)',
                    desc: 'Keep screen awake during video playback or checkout',
                    manifest: 'android.permission.WAKE_LOCK',
                    badge: 'Power Policy',
                  },

                  // Location
                  {
                    key: 'geolocation',
                    cat: 'location',
                    label: 'GPS Precise Location',
                    desc: 'Provide exact user location for store finders & delivery',
                    manifest: 'ACCESS_FINE_LOCATION',
                    badge: 'Play Store Policy',
                  },

                  // System & Security
                  {
                    key: 'notifications',
                    cat: 'system',
                    label: 'Push & Post Notifications',
                    desc: 'Send order updates, alerts, and marketing notifications',
                    manifest: 'POST_NOTIFICATIONS',
                    badge: 'Android 13+ Prompt',
                  },
                  {
                    key: 'biometrics',
                    cat: 'system',
                    label: 'Biometric Authentication',
                    desc: 'Fingerprint & Face Unlock for sensitive checkout',
                    manifest: 'android.permission.USE_BIOMETRIC',
                    badge: 'Security',
                  },
                  {
                    key: 'fileUpload',
                    cat: 'system',
                    label: 'Photo & File Chooser',
                    desc: 'Enable HTML5 <input type="file"> photo and doc uploads',
                    manifest: 'READ_MEDIA_IMAGES',
                    badge: 'Native Chooser',
                  },
                  {
                    key: 'handleDownloads',
                    cat: 'system',
                    label: 'Android Download Manager',
                    desc: 'Save invoices, tickets, and PDFs to Downloads folder',
                    manifest: 'DownloadManager Service',
                    badge: 'System Service',
                  },

                  // Web Engine
                  {
                    key: 'javascript',
                    cat: 'web',
                    label: 'JavaScript Execution',
                    desc: 'Enable modern client-side React/Vue/Angular scripts',
                    manifest: 'WebSettings.javaScriptEnabled',
                    badge: 'Core Engine',
                  },
                  {
                    key: 'cookies',
                    cat: 'web',
                    label: 'Persistent Session Cookies',
                    desc: 'Keep users logged in across app relaunches',
                    manifest: 'CookieManager.setAcceptCookie',
                    badge: 'Session State',
                  },
                  {
                    key: 'localStorage',
                    cat: 'web',
                    label: 'DOM LocalStorage & IndexedDB',
                    desc: 'Store offline cart items and local client state',
                    manifest: 'WebSettings.domStorageEnabled',
                    badge: 'Offline Cache',
                  },
                  {
                    key: 'pullToRefresh',
                    cat: 'web',
                    label: 'Pull to Refresh Gesture',
                    desc: 'Swipe down gesture from top of screen to reload current page',
                    manifest: 'SwipeRefreshLayout',
                    badge: 'Native Gesture',
                  },
                  {
                    key: 'deepLinks',
                    cat: 'web',
                    label: 'Android App Deep Links',
                    desc: 'Open domain URLs directly inside the installed application',
                    manifest: '<intent-filter>',
                    badge: 'Intent Filter',
                  },
                  {
                    key: 'openExternalLinks',
                    cat: 'web',
                    label: 'External Browser for Outbound Links',
                    desc: 'Open social media and external links in Chrome instead of app',
                    manifest: 'Intent.ACTION_VIEW',
                    badge: 'App Boundary',
                  },
                  {
                    key: 'openTelLinks',
                    cat: 'web',
                    label: 'Direct Phone Dialing (tel:)',
                    desc: 'Tap telephone numbers to launch native Android phone dialer',
                    manifest: 'Intent.ACTION_DIAL',
                    badge: 'Telephony',
                  },
                  {
                    key: 'openMailtoLinks',
                    cat: 'web',
                    label: 'Direct Email Links (mailto:)',
                    desc: 'Tap email addresses to launch native Gmail/Outlook app',
                    manifest: 'Intent.ACTION_SENDTO',
                    badge: 'Messaging',
                  },
                ]
                  .filter((item) => permCategory === 'all' || item.cat === permCategory)
                  .map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-start gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                        (permissions as any)[item.key]
                          ? 'bg-purple-50/40 border-[#635BFF]/40 shadow-2xs'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(permissions as any)[item.key]}
                        onChange={(e) =>
                          setPermissions({ ...permissions, [item.key]: e.target.checked })
                        }
                        className="mt-1 w-4 h-4 rounded text-[#635BFF] focus:ring-[#635BFF]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-gray-900 block truncate">{item.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200/70 font-semibold text-gray-600 shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">
                          {item.desc}
                        </span>
                        <span className="font-mono text-[9px] text-gray-400 block mt-1">
                          {item.manifest}
                        </span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {/* STEP 6: ADVANCED ANDROID COMPILATION SETTINGS */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Step 6: Advanced Android Metadata & Engine</h3>
                <p className="text-xs text-gray-500">
                  Target Android SDK versions, versioning numbers, cache policies, and code injections.
                </p>
              </div>

              {/* Versioning and SDK Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Semantic Version Name</label>
                    <span className="text-[10px] text-gray-400">Shown to users</span>
                  </div>
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Android Version Code</label>
                    <span className="text-[10px] text-gray-400">Integer for Google Play</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={versionCode}
                    onChange={(e) => setVersionCode(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Minimum Android Version (minSdk)</label>
                    <span className="text-[10px] text-emerald-600 font-bold">Device Reach</span>
                  </div>
                  <select
                    value={minSdk}
                    onChange={(e) => setMinSdk(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  >
                    <option value={21}>Android 5.0 (API 21) - 99.4% of Android devices</option>
                    <option value={24}>Android 7.0 (API 24) - 96.2% of Android devices</option>
                    <option value={26}>Android 8.0 (API 26) - 94.0% (Recommended)</option>
                    <option value={30}>Android 11.0 (API 30) - 84.8% of Android devices</option>
                    <option value={33}>Android 13.0 (API 33) - 65.2% of Android devices</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Target SDK Version (targetSdk)</label>
                    <span className="text-[10px] text-purple-600 font-bold">Play Store Requirement</span>
                  </div>
                  <select
                    value={targetSdk}
                    onChange={(e) => setTargetSdk(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  >
                    <option value={34}>API 34 (Android 14) - Play Store Mandatory Requirement</option>
                    <option value={33}>API 33 (Android 13) - Legacy devices</option>
                  </select>
                </div>
              </div>

              {/* Cache Mode & Custom User Agent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">WebView Cache Policy</label>
                  <select
                    value={cacheMode}
                    onChange={(e) => setCacheMode(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  >
                    <option value="LOAD_DEFAULT">LOAD_DEFAULT - Standard HTTP caching rules</option>
                    <option value="LOAD_CACHE_ELSE_NETWORK">LOAD_CACHE_ELSE_NETWORK - Offline-first instant load</option>
                    <option value="LOAD_NO_CACHE">LOAD_NO_CACHE - Always bypass cache (Always fresh)</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Controls how cached pages and local assets are served inside the Android WebView.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Custom User-Agent Suffix</label>
                  <input
                    type="text"
                    value={userAgentSuffix}
                    onChange={(e) => setUserAgentSuffix(e.target.value)}
                    placeholder="Web2APK/2.4 (Android; Mobile)"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Appends identification to navigator.userAgent so your server knows requests originate from your app.
                  </p>
                </div>
              </div>

              {/* Screen Orientation & Performance Flags */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Screen Orientation</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'portrait', label: 'Portrait Only' },
                      { id: 'landscape', label: 'Landscape Only' },
                      { id: 'auto', label: 'Auto Rotate (Sensor)' },
                    ].map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setOrientation(o.id as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          orientation === o.id
                            ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] ring-1 ring-[#635BFF]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keepScreenOn}
                      onChange={(e) => setKeepScreenOn(e.target.checked)}
                      className="w-4 h-4 text-[#635BFF] rounded"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-800 block">Keep Screen On</span>
                      <span className="text-[10px] text-gray-400">FLAG_KEEP_SCREEN_ON window policy</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hardwareAccelerated}
                      onChange={(e) => setHardwareAccelerated(e.target.checked)}
                      className="w-4 h-4 text-[#635BFF] rounded"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-800 block">Hardware GPU Acceleration</span>
                      <span className="text-[10px] text-gray-400">60fps smooth scrolling & Canvas/WebGL</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom CSS and JS Injections */}
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Inject Custom CSS (Hide elements like website headers or banners)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomCss((prev) => prev + '\nheader, .site-header { display: none !important; }')}
                        className="text-[10px] text-[#635BFF] hover:underline font-semibold"
                      >
                        + Hide Header
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomCss((prev) => prev + '\nfooter, .site-footer { display: none !important; }')}
                        className="text-[10px] text-[#635BFF] hover:underline font-semibold"
                      >
                        + Hide Footer
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    placeholder="/* Custom CSS injected into page DOM */&#10;header { display: none !important; }"
                    className="w-full px-3 py-2 bg-[#0F172A] text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-800">
                      Inject Custom JavaScript (Run native hooks or listeners)
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomJs((prev) => prev + "\nconsole.log('Web2APK Native Wrapper Active');")}
                      className="text-[10px] text-[#635BFF] hover:underline font-semibold"
                    >
                      + Add Log Hook
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={customJs}
                    onChange={(e) => setCustomJs(e.target.value)}
                    placeholder="/* Custom JavaScript executed after page finish */&#10;console.log('App ready');"
                    className="w-full px-3 py-2 bg-[#0F172A] text-sky-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: INTERACTIVE PREVIEW & INSPECTION */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Step 7: Verify Mobile Experience</h3>
                <p className="text-xs text-gray-500">
                  Test your splash screen, navigation, and mobile viewport before compiling the APK.
                </p>
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Sparkles className="w-4 h-4 text-[#635BFF]" />
                  <span>Preview Verification Checklist</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Status bar & brand colors aligned</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Splash screen logo configured</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pull-to-refresh hook active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Target SDK 34 verified</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-gray-800 block">Current Configuration Summary:</span>
                <p className="text-gray-600 leading-relaxed">
                  App <strong className="text-gray-900">{appName}</strong> targeting{' '}
                  <span className="font-mono text-[11px] text-gray-800">{websiteUrl}</span> with package{' '}
                  <span className="font-mono text-[11px] text-gray-800">{packageName}</span>.
                </p>
              </div>
            </div>
          )}

          {/* STEP 8: BUILD SUMMARY & TRIGGER */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Step 8: Build Android Package</h3>
                <p className="text-xs text-gray-500">
                  Select your compilation target and launch the asynchronous Android build pipeline.
                </p>
              </div>

              {/* Build Type Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBuildType('apk')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    buildType === 'apk'
                      ? 'border-[#635BFF] bg-[#635BFF]/5 ring-2 ring-[#635BFF]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">Android APK (.apk)</span>
                    <Package className="w-4 h-4 text-[#635BFF]" />
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">
                    Standard signed package ready for direct installation, internal testing, and sideloading.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setBuildType('aab')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    buildType === 'aab'
                      ? 'border-[#635BFF] bg-[#635BFF]/5 ring-2 ring-[#635BFF]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">Android App Bundle (.aab)</span>
                    <Code className="w-4 h-4 text-[#635BFF]" />
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">
                    Optimized Google Play Store publishing format with dynamic feature delivery.
                  </p>
                </button>
              </div>

              {/* Configuration Checklist */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">App Name:</span>
                  <span className="font-bold text-gray-900">{appName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Package ID:</span>
                  <span className="font-mono text-gray-900">{packageName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Version:</span>
                  <span className="font-mono text-gray-900">{versionName} (code {versionCode})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Target Platform:</span>
                  <span className="font-medium text-gray-900">Android 14 (API 34)</span>
                </div>
              </div>

              {/* Toast Notification Verification / Failure Simulation Toggle */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Simulate Error Alert (Toast Test)</span>
                  <span className="text-[11px] text-gray-500 block">
                    Intentionally injects a Gradle compiler error to test the Error Toast alert.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {/* Google Authentication Requirement Gate Card */}
              {user?.authProvider === 'google' ? (
                <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 shadow-xs flex items-center justify-center shrink-0">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-950">Verified Google Account</span>
                        <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 font-bold text-[10px] rounded-full">
                          Authorized to Build
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                        {user.email} &bull; Cloud compiler pipeline allocated
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                      <GoogleIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-amber-950 block">
                        Google Sign-In Required to Build
                      </span>
                      <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                        You must sign in with a Google account to start compiling Android APK and AAB packages.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleAuthModal(true)}
                    className="w-full py-2.5 px-3 bg-white hover:bg-amber-100/50 border border-amber-300 text-gray-900 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>Sign in with Google to Enable Build</span>
                  </button>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleBuildAndCreate}
                disabled={isSubmitting}
                className={`w-full py-3.5 text-white text-sm font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                  user?.authProvider === 'google'
                    ? 'bg-[#635BFF] hover:bg-[#5248E5] shadow-[#635BFF]/30'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                }`}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : user?.authProvider === 'google' ? (
                  <Package className="w-4 h-4" />
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? 'Initializing Compiler Pipeline...'
                    : user?.authProvider === 'google'
                    ? `Build Android ${buildType.toUpperCase()}`
                    : 'Sign in with Google to Start Build'}
                </span>
              </button>
            </div>
          )}

          {/* Navigation Controls (Back & Next) */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 2 && getPackageNameIssues(packageName).length > 0) {
                    showToast(getPackageNameIssues(packageName)[0] || 'Please specify a valid package name', 'error');
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Right Side: Reactive Phone Preview Mockup (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Live Android Runtime</span>
              <span className="text-[11px] text-gray-400">Updates live with every form change</span>
            </div>
            <PhonePreview project={currentProjectPreview} showControls={true} />
          </div>
        </div>
      </div>

      <GoogleAuthGateModal
        isOpen={showGoogleAuthModal}
        onClose={() => setShowGoogleAuthModal(false)}
        onSuccess={() => {
          handleBuildAndCreate();
        }}
        appName={appName}
      />
    </div>
  );
}
