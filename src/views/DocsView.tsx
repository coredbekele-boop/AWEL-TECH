import React, { useState } from 'react';
import {
  BookOpen,
  Code,
  Shield,
  Smartphone,
  ExternalLink,
  Terminal,
  Layers,
  Key,
  HelpCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export function DocsView() {
  const [activeSection, setActiveSection] = useState<'overview' | 'playstore' | 'worker' | 'limitations' | 'deeplinks'>('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-3 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block px-3 mb-2">
            Documentation
          </span>
          {[
            { id: 'overview', label: 'Platform Architecture', icon: Layers },
            { id: 'playstore', label: 'Google Play Publishing', icon: Shield },
            { id: 'deeplinks', label: 'Deep Links & App Links', icon: ExternalLink },
            { id: 'limitations', label: 'WebView Limitations & CSP', icon: AlertTriangle },
            { id: 'worker', label: 'Docker Worker Setup', icon: Terminal },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#635BFF] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Pane */}
        <div className="md:col-span-9 bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-10 space-y-8">
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Platform Architecture Overview</h2>
                <p className="text-xs text-gray-500 mt-1">
                  How Web2APK Studio bridges modern web technologies with native Android runtimes.
                </p>
              </div>

              <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
                <p>
                  Web2APK Studio uses a modern Android Kotlin wrapper with hardware-accelerated Chromium WebView,
                  optimized caching, splash screen sequence, native swipe-to-refresh listener, and standard Android
                  WebChromeClient file chooser bridges.
                </p>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <h4 className="font-bold text-gray-900">Core Runtime Specifications:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Target SDK: API 34 (Android 14)</li>
                    <li>Minimum SDK: API 26 (Android 8.0 Oreo) - 94%+ device coverage</li>
                    <li>Language: Kotlin 2.0 with Jetpack AppCompat</li>
                    <li>Build Tooling: Gradle 8.4 with Android Gradle Plugin 8.4.0</li>
                    <li>App Signing: v2 / v3 APK Signature Scheme & Keystore</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'playstore' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Google Play Store Submission Guide</h2>
                <p className="text-xs text-gray-500 mt-1">
                  How to upload your compiled Android App Bundle (.aab) to Google Play Console.
                </p>
              </div>

              <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
                <ol className="list-decimal pl-5 space-y-3">
                  <li>
                    <strong>Create a Google Play Developer Account:</strong> Register at{' '}
                    <code className="text-[#635BFF] font-mono">play.google.com/console</code> ($25 one-time fee).
                  </li>
                  <li>
                    <strong>Compile an AAB Bundle:</strong> In Web2APK Studio, select the <strong>AAB</strong> format in
                    the Build step or trigger an AAB build from the App Overview.
                  </li>
                  <li>
                    <strong>Create App in Console:</strong> Enter your App Name, Default Language, and choose Free or Paid.
                  </li>
                  <li>
                    <strong>Upload Release Bundle:</strong> In Play Console, navigate to <em>Production &gt; Create New Release</em> and upload the downloaded <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">.aab</code> file.
                  </li>
                  <li>
                    <strong>App Privacy Policy:</strong> Provide your website&apos;s privacy policy link in the App Content section.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeSection === 'limitations' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">WebView Limitations & CSP Guidelines</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Understanding Content Security Policies, X-Frame-Options, and anti-bot systems.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Important Technical Notice</span>
                </div>
                <p>
                  While native Android WebViews can load any public HTTPS URL regardless of <code className="font-mono font-bold">X-Frame-Options</code> (because native WebViews do not act as HTML iframes), strict web server firewalls or CAPTCHA providers (like Cloudflare Turnstile bot challenges) may flag mobile user-agents if not configured with mobile-friendly bypass headers.
                </p>
              </div>

              <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                <h4 className="font-bold text-gray-900">Recommended Website Optimizations:</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Ensure responsive viewport tag: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[11px]">&lt;meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot;&gt;</code></li>
                  <li>Keep page assets under 5MB for fast mobile cold starts.</li>
                  <li>Provide touch-friendly buttons (minimum 44x44px).</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'deeplinks' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Android Deep Links & App Links</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Allow URLs clicked in emails, messaging apps, and social media to launch your mobile app directly.
                </p>
              </div>

              <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
                <p>
                  Web2APK automatically writes the required <code className="font-mono text-purple-700">&lt;intent-filter&gt;</code> inside your app&apos;s <code className="font-mono text-gray-900">AndroidManifest.xml</code>.
                </p>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <span className="font-bold text-gray-900 block">Digital Asset Links Verification:</span>
                  <p className="text-gray-600">
                    To enable seamless auto-verification on Android 12+, place an <code className="font-mono text-[11px]">assetlinks.json</code> file at:
                  </p>
                  <pre className="p-3 bg-[#0F172A] text-gray-200 rounded-xl font-mono text-[11px] overflow-x-auto">
                    <code>https://yourdomain.com/.well-known/assetlinks.json</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'worker' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Self-Hosted Docker Build Worker</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Set up your own dedicated high-speed Android compiler node.
                </p>
              </div>

              <div className="space-y-4 text-xs text-gray-700">
                <p>
                  Run the official containerized Android build worker with pre-cached Gradle dependencies and Android SDK 34 commandline-tools:
                </p>

                <pre className="p-4 bg-[#0F172A] text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>
                    {`# Pull & Launch Web2APK Build Worker
docker run -d \\
  --name web2apk-worker \\
  -e BACKEND_API_URL=https://api.web2apk.studio \\
  -e WORKER_AUTH_KEY=secret_worker_token \\
  -v /var/cache/gradle:/root/.gradle \\
  web2apk/android-builder:v2.4`}
                  </code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
