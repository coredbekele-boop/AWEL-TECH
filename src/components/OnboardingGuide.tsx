import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Globe,
  Palette,
  Compass,
  Smartphone,
  Cpu,
  Download,
  X,
  HelpCircle,
  Zap,
} from 'lucide-react';
import type { OnboardingStep } from '../types.ts';

interface OnboardingGuideProps {
  onStartWithUrl?: (url: string) => void;
  onNavigate?: (view: string, id?: string) => void;
  hasProjects?: boolean;
  hasCompletedBuild?: boolean;
}

const SAMPLE_SITES = [
  {
    name: 'E-Commerce Boutique',
    url: 'https://yesufapp.com',
    type: 'Shopify Store',
    tag: 'Retail & Cart',
  },
  {
    name: 'Tech & Code Portal',
    url: 'https://techstackdaily.dev',
    type: 'Developer Blog',
    tag: 'Articles & Content',
  },
  {
    name: 'Cloud SaaS Dashboard',
    url: 'https://demo-cloud-dashboard.netlify.app',
    type: 'Web App',
    tag: 'Interactive Web App',
  },
];

export function OnboardingGuide({
  onStartWithUrl,
  onNavigate,
  hasProjects = false,
  hasCompletedBuild = false,
}: OnboardingGuideProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('web2apk_onboarding_collapsed') === 'true';
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('web2apk_onboarding_dismissed') === 'true';
  });

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'step_url',
      title: 'Analyze & Validate Website URL',
      description: 'Check reachability, HTTPS headers, and auto-detect favicon, meta tags, and responsive viewport.',
      completed: hasProjects,
      actionText: 'Enter Website',
      viewTarget: 'create-app',
    },
    {
      id: 'step_branding',
      title: 'Configure Visual Identity & Splash',
      description: 'Set launcher icon, Android status bar color, and branded launch splash screen.',
      completed: hasProjects,
      actionText: 'Customize Design',
      viewTarget: 'create-app',
    },
    {
      id: 'step_nav',
      title: 'Set Navigation & Granular Permissions',
      description: 'Configure bottom bar tabs, deep linking (App Links), and hardware permissions.',
      completed: hasProjects,
      actionText: 'Configure',
      viewTarget: 'create-app',
    },
    {
      id: 'step_preview',
      title: 'Test Live Android Phone Emulator',
      description: 'Verify navigation flow, pull-to-refresh gesture, and offline fallback screens.',
      completed: hasProjects,
      actionText: 'Preview in Phone',
      viewTarget: 'create-app',
    },
    {
      id: 'step_build',
      title: 'Compile & Download APK / AAB Bundle',
      description: 'Trigger the cloud build worker to compile bytecode and download signed package.',
      completed: hasCompletedBuild,
      actionText: 'Start Build',
      viewTarget: 'dashboard',
    },
  ]);

  useEffect(() => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === 'step_build') {
          return { ...s, completed: hasCompletedBuild };
        }
        if (['step_url', 'step_branding', 'step_nav', 'step_preview'].includes(s.id)) {
          return { ...s, completed: hasProjects };
        }
        return s;
      })
    );
  }, [hasProjects, hasCompletedBuild]);

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('web2apk_onboarding_collapsed', String(next));
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('web2apk_onboarding_dismissed', 'true');
  };

  const handleReset = () => {
    setIsDismissed(false);
    setIsCollapsed(false);
    localStorage.removeItem('web2apk_onboarding_dismissed');
    localStorage.removeItem('web2apk_onboarding_collapsed');
  };

  if (isDismissed) {
    return (
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-[#635BFF] flex items-center gap-1.5 transition-colors font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Show Onboarding Guide</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-white border border-purple-100 rounded-3xl p-5 sm:p-6 shadow-xs relative transition-all">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#635BFF] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                Getting Started: Create Your First Android App
              </h3>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                {progressPercent}% Completed
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Follow this 5-step checklist to turn any live website into an installable Android APK.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleCollapse}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand checklist' : 'Collapse checklist'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
            title="Dismiss guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#635BFF] to-emerald-500 rounded-full transition-all duration-700"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {!isCollapsed && (
        <div className="mt-5 space-y-5 animate-in fade-in">
          {/* Quick Try Sample Sites (For instant zero-setup trial) */}
          <div className="p-3.5 bg-white/90 rounded-2xl border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-gray-800">
                Don&apos;t have a website ready? Test with a pre-configured sample:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_SITES.map((site) => (
                <button
                  key={site.name}
                  onClick={() => onStartWithUrl?.(site.url)}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-gray-200 rounded-xl text-[11px] font-semibold text-gray-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>{site.name}</span>
                  <span className="text-[9px] bg-gray-200/60 text-gray-600 px-1.5 py-0.5 rounded-md font-medium">
                    {site.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {steps.map((step, idx) => {
              const StepIcons = [Globe, Palette, Compass, Smartphone, Cpu];
              const Icon = StepIcons[idx] || CheckCircle2;

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    step.completed
                      ? 'bg-white/80 border-emerald-200 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          step.completed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-purple-100 text-[#635BFF]'
                        }`}
                      >
                        {step.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          step.completed ? 'text-emerald-500' : 'text-gray-400'
                        }`}
                      />
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{step.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100">
                    <button
                      onClick={() => onNavigate?.(step.viewTarget)}
                      className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        step.completed
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-[#635BFF] bg-purple-50 hover:bg-purple-100'
                      }`}
                    >
                      <span>{step.completed ? 'Completed' : step.actionText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
