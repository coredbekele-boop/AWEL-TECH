import React, { useState } from 'react';
import { Check, Zap, Sparkles, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface PricingViewProps {
  onSelectPlan: (plan: string) => void;
}

export function PricingView({ onSelectPlan }: PricingViewProps) {
  const { user, showToast } = useAuth();
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      description: 'Ideal for trying out Web2APK and testing your website on physical Android hardware.',
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false,
      features: [
        '1 Active Android App',
        '3 APK Builds per Month',
        'Standard Build Queue (shared)',
        'Debug APK Sideload Packages',
        'Website Metadata Auto-fetch',
        'Community Documentation',
      ],
      limitations: [
        'No Google Play AAB bundles',
        'Web2APK splash screen branding',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Publisher',
      description: 'For business owners, Shopify stores, and startups publishing to the Google Play Store.',
      priceMonthly: 29,
      priceAnnual: 24,
      popular: true,
      features: [
        '5 Active Android Apps',
        '50 APK & AAB Builds per Month',
        'Google Play Store AAB Bundles',
        'Custom Splash Screens & Colors',
        'Hardware Permissions (Camera, GPS)',
        'Fast Docker Build Pipeline',
        'FCM Push Notification Integration',
        'Email Technical Support',
      ],
      limitations: [],
    },
    {
      id: 'business',
      name: 'Business Studio',
      description: 'For agencies and high-traffic brands managing multiple client mobile applications.',
      priceMonthly: 79,
      priceAnnual: 64,
      popular: false,
      features: [
        'Unlimited Android Apps',
        '250 High-Speed Builds per Month',
        'Priority Dedicated Build Queue',
        '100% White-Label (no watermarks)',
        'Custom Keystore Management',
        'Deep Linking & Universal Links',
        'Priority 24/7 Slack & Email Support',
        'Team Member Collaboration',
      ],
      limitations: [],
    },
  ];

  const handlePlanClick = (planId: string) => {
    showToast(`Switched plan to ${planId.toUpperCase()}!`, 'success');
    onSelectPlan(planId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#635BFF] uppercase tracking-wider bg-[#635BFF]/10 px-3 py-1 rounded-full">
          Simple, Transparent Pricing
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
          Turn your website into an app today
        </h1>
        <p className="text-base text-gray-600">
          No hidden fees or unexpected Gradle build charges. Cancel or upgrade anytime.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${!annualBilling ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setAnnualBilling(!annualBilling)}
            className="w-12 h-6 bg-[#635BFF] rounded-full p-1 flex items-center transition-colors cursor-pointer"
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform ${
                annualBilling ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${annualBilling ? 'text-gray-900' : 'text-gray-500'}`}>
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => {
          const isCurrent = user?.plan === p.id;
          const price = annualBilling ? p.priceAnnual : p.priceMonthly;

          return (
            <div
              key={p.id}
              className={`relative bg-white rounded-3xl p-8 border flex flex-col justify-between transition-all ${
                p.popular
                  ? 'border-[#635BFF] shadow-xl ring-2 ring-[#635BFF]/20'
                  : 'border-gray-200 shadow-xs hover:border-gray-300'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#635BFF] text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                  Most Popular Choice
                </div>
              )}

              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 min-h-[32px]">{p.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">${price}</span>
                    <span className="text-xs text-gray-500 font-medium">/ month</span>
                  </div>
                  {annualBilling && p.priceAnnual > 0 && (
                    <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                      Billed annually (${price * 12}/yr)
                    </span>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">
                    What&apos;s included:
                  </span>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-6">
                <button
                  type="button"
                  onClick={() => handlePlanClick(p.id)}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    p.popular
                      ? 'bg-[#635BFF] hover:bg-[#5248E5] text-white shadow-md shadow-[#635BFF]/25'
                      : 'bg-gray-900 hover:bg-black text-white'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : `Choose ${p.name}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto pt-8 space-y-6">
        <h3 className="text-2xl font-extrabold text-gray-900 text-center">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {[
            {
              q: 'Can I publish the APK or AAB to Google Play Store?',
              a: 'Yes! Pro and Business plans generate signed Android App Bundles (.aab) targeting API 34, which is the current requirement for Google Play Store console submission.',
            },
            {
              q: 'Do I need Android Studio installed on my computer?',
              a: 'No. All compilation, Gradle tasks, and APK packaging are performed by Web2APK Studio cloud pipelines. You receive direct download links.',
            },
            {
              q: 'What happens if my website is updated?',
              a: 'Because Web2APK creates a native WebView client, any live website content updates (like adding new products or articles) appear instantly in your users apps without requiring a new APK release!',
            },
            {
              q: 'Can I access camera and location services?',
              a: 'Yes. You can toggle hardware permissions in Step 5 of the App Wizard. The app automatically bridges HTML5 geolocation and file upload choosers to native Android prompts.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#635BFF]" />
                <span>{item.q}</span>
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
