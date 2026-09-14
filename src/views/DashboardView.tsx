import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plus,
  Layers,
  Cpu,
  Download,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Settings,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import type { Project, Build } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { OnboardingGuide } from '../components/OnboardingGuide.tsx';
import { LiveBuildMonitor } from '../components/LiveBuildMonitor.tsx';
import { GoogleAuthGateModal } from '../components/GoogleAuthGateModal.tsx';
import { BuildSuccessChart } from '../components/BuildSuccessChart.tsx';

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
  onStartWizard: (url?: string) => void;
}

export function DashboardView({ onNavigate, onStartWizard }: DashboardViewProps) {
  const { user, showToast } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickUrl, setQuickUrl] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [googleAuthProject, setGoogleAuthProject] = useState<Project | null>(null);

  const loadData = async () => {
    try {
      const [projData, buildData] = await Promise.all([api.getProjects(), api.getBuilds()]);
      setProjects(projData.projects || []);
      setBuilds(buildData.builds || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time polling when any build is active
  useEffect(() => {
    const hasActiveBuild = builds.some(
      (b) => b.status !== 'COMPLETED' && b.status !== 'FAILED'
    );
    if (!hasActiveBuild) return;

    const timer = setInterval(async () => {
      try {
        const buildData = await api.getBuilds();
        setBuilds(buildData.builds || []);
      } catch {
        // silent fail during background poll
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [builds]);

  const activeBuild = builds.find(
    (b) => b.status !== 'COMPLETED' && b.status !== 'FAILED'
  );
  const featuredBuild = activeBuild || builds[0];

  const handleQuickAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickUrl.trim()) {
      onStartWizard(quickUrl.trim());
    }
  };

  const handleTriggerBuild = async (project: Project) => {
    // Strictly enforce Google authentication before building
    if (!user || user.authProvider !== 'google') {
      setGoogleAuthProject(project);
      showToast('Google Sign-In required: Please sign in with Google to start building', 'warning');
      return;
    }

    try {
      showToast(`Starting APK build for ${project.name}...`, 'info');
      const res = await api.startBuild(project.id, 'apk');
      showToast(`Build queued #${res.build.id}`, 'success');
      onNavigate('build-details', res.build.id);
    } catch (err: any) {
      if (err.message?.includes('Google') || err.message?.includes('auth') || err.message?.includes('GOOGLE_AUTH_REQUIRED')) {
        setGoogleAuthProject(project);
      }
      showToast(err.message || 'Build start failed', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await api.deleteProject(id);
      setProjects(projects.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
      showToast('Project deleted successfully', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  const successfulBuildsCount = builds.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Welcome back, {user?.name.split(' ')[0] || 'Builder'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your mobile Android wrappers, monitor compiler builds, and publish updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('create-app')}
            className="px-4 py-2.5 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-[#635BFF]/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New App</span>
          </button>
        </div>
      </div>

      {/* Interactive Onboarding Flow Checklist */}
      <OnboardingGuide
        onStartWithUrl={(url) => onStartWizard(url)}
        onNavigate={onNavigate}
        hasProjects={projects.length > 0}
        hasCompletedBuild={successfulBuildsCount > 0}
      />

      {/* Quick Website Analyzer Launch Strip */}
      <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-3xl shadow-xs">
        <form onSubmit={handleQuickAnalyze} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl flex-1 w-full text-sm">
            <Globe className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="url"
              required
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Convert new website: https://example.com"
              className="w-full bg-transparent text-xs sm:text-sm text-gray-900 focus:outline-none placeholder:text-gray-400 font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Analyze & Convert</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Real-Time Build Monitor (Active or Recent compilation) */}
      {featuredBuild && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {activeBuild ? '⚡ Active Compilation Stream' : '📦 Most Recent Build Status'}
            </span>
            <button
              onClick={() => onNavigate('builds')}
              className="text-xs font-semibold text-[#635BFF] hover:underline"
            >
              All Builds History ({builds.length}) →
            </button>
          </div>
          <LiveBuildMonitor
            build={featuredBuild}
            onNavigate={onNavigate}
            onBuildUpdated={(updated) => {
              setBuilds((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            }}
          />
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Apps</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#635BFF] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{projects.length}</span>
            <span className="text-[11px] text-gray-500 block mt-0.5">Active Android projects</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Successful Builds</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">{successfulBuildsCount}</span>
            <span className="text-[11px] text-gray-500 block mt-0.5">Compiled APKs & AABs</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Builds This Month</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {user?.monthlyBuildsUsed || 0}
              <span className="text-xs font-medium text-gray-400">/{user?.monthlyBuildsLimit || 50}</span>
            </span>
            <span className="text-[11px] text-gray-500 block mt-0.5">Quota resets in 18 days</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Current Plan</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 capitalize">
              {user?.plan || 'Pro'}
            </span>
            <button
              onClick={() => onNavigate('pricing')}
              className="text-[11px] text-[#635BFF] hover:underline block mt-0.5 font-semibold"
            >
              Upgrade / Manage Plan →
            </button>
          </div>
        </div>
      </div>

      {/* Build Success & Status Analytics Widget */}
      <BuildSuccessChart builds={builds} />

      {/* RECENT APPS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Android Applications</h2>
            <p className="text-xs text-gray-500">Configured website mobile wrappers and binaries</p>
          </div>
          <button
            onClick={() => onNavigate('apps')}
            className="text-xs font-semibold text-[#635BFF] hover:underline"
          >
            View all ({projects.length})
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
            <RotateCw className="w-6 h-6 animate-spin text-[#635BFF] mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading your applications...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#635BFF] flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No apps yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Create your first Android app from your website URL with custom branding and permissions.
              </p>
            </div>
            <button
              onClick={() => onNavigate('create-app')}
              className="px-5 py-2.5 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Create App
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">App Name</th>
                    <th className="px-5 py-3.5">Website URL</th>
                    <th className="px-5 py-3.5">Platform</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Last Updated</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={proj.iconUrl}
                            alt={proj.name}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 shadow-xs"
                          />
                          <div>
                            <button
                              onClick={() => onNavigate('app-details', proj.id)}
                              className="font-bold text-gray-900 hover:text-[#635BFF] text-sm text-left block"
                            >
                              {proj.name}
                            </button>
                            <span className="font-mono text-[10px] text-gray-400">{proj.packageName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={proj.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5 truncate max-w-[200px]"
                        >
                          <span className="truncate">{proj.websiteUrl}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                          Android (SDK {proj.targetSdk})
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {proj.latestBuildStatus === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Built (v{proj.versionName})</span>
                          </span>
                        ) : proj.latestBuildStatus === 'QUEUED' || proj.latestBuildStatus === 'BUILDING' ? (
                          <span className="inline-flex items-center gap-1 text-indigo-600 font-bold text-xs">
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Building...</span>
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">Ready</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(proj.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigate('app-details', proj.id)}
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                            title="Edit and preview"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleTriggerBuild(proj)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-[#635BFF] hover:text-white text-[#635BFF] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Build APK"
                          >
                            <Play className="w-3 h-3" />
                            <span>Build</span>
                          </button>
                          {proj.latestBuildId && (
                            <a
                              href={`/api/builds/${proj.latestBuildId}/download?type=apk`}
                              download
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                              title="Download APK"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setDeleteConfirmId(proj.id)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete this project?</h3>
              <p className="text-xs text-gray-500 mt-1">
                This will remove the configuration and historical build records from your account. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Authentication Required Modal for Builds */}
      <GoogleAuthGateModal
        isOpen={!!googleAuthProject}
        onClose={() => setGoogleAuthProject(null)}
        onSuccess={() => {
          if (googleAuthProject) {
            handleTriggerBuild(googleAuthProject);
          }
        }}
        appName={googleAuthProject?.name}
      />
    </div>
  );
}
