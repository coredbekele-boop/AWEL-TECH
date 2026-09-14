import React from 'react';
import { Smartphone, Shield, ExternalLink, Terminal, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-[#635BFF]/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#111827]">
                Web2APK <span className="text-[#635BFF]">Studio</span>
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm">
              Convert any public website or web application into an installable Android APK and Google Play Ready
              Android App Bundle (AAB). Engineered with high-performance native WebView wrappers, customizable branding,
              and isolated build pipelines.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Android Build Infrastructure: Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#635BFF] transition-colors cursor-pointer font-medium">
                  Home Page
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-[#635BFF] transition-colors cursor-pointer">
                  Features & Capabilities
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how-it-works')} className="hover:text-[#635BFF] transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#635BFF] transition-colors cursor-pointer">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('create-app')} className="hover:text-[#635BFF] transition-colors cursor-pointer">
                  Create App Wizard
                </button>
              </li>
            </ul>
          </div>

          {/* Documentation & Architecture */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-[#635BFF] transition-colors">
                  Architecture Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-[#635BFF] transition-colors">
                  Keystore & Play Store Signing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-[#635BFF] transition-colors">
                  Deep Linking & FCM Push
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-[#635BFF] transition-colors">
                  Docker Worker Setup Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture Transparency Card */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Architecture</h4>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                <Terminal className="w-3.5 h-3.5 text-[#635BFF]" />
                <span>Real Pipeline</span>
              </div>
              <p className="leading-snug">
                Web2APK compiles real Android projects using Kotlin and Android SDK 34. Websites with CSP or
                iframe headers are flagged transparently with native WebView exemptions.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Web2APK Studio Inc. All rights reserved.</p>
          <div className="flex items-center gap-6 text-gray-500 text-xs">
            <span>Production SaaS Architecture</span>
            <span>Android Gradle v8.4</span>
            <span>Target SDK 34</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
