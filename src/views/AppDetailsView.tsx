import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Layers,
  Palette,
  Settings,
  History,
  Code,
  Download,
  Play,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  Trash2,
  Save,
  Copy,
  Check,
  Globe,
  Sliders,
  ShieldAlert,
  ArrowLeft,
  Plus,
  Link,
  ShieldCheck,
  Bell,
  Fingerprint,
  Bluetooth,
  AlertTriangle,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { PhonePreview } from '../components/PhonePreview.tsx';
import { GoogleAuthGateModal } from '../components/GoogleAuthGateModal.tsx';
import { GoogleIcon } from '../components/GoogleIcon.tsx';
import type { Project, Build, NavItem, NavigationType, DeepLinkConfig, AppPermissions } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AppDetailsViewProps {
  projectId: string;
  onNavigate: (view: string, id?: string) => void;
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
  if (!pkg || !pkg.trim()) {
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

export function AppDetailsView({ projectId, onNavigate }: AppDetailsViewProps) {
  const { user, showToast } = useAuth();
  const { trackBuild } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [sourceCode, setSourceCode] = useState<{ [filename: string]: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'navigation' | 'permissions' | 'branding' | 'builds' | 'preview' | 'source' | 'settings'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showGoogleAuthGate, setShowGoogleAuthGate] = useState(false);
  const [pendingBuildType, setPendingBuildType] = useState<'apk' | 'aab'>('apk');

  // Deep linking helper
  const [newPrefixInput, setNewPrefixInput] = useState('');
  const [permCategory, setPermCategory] = useState<'all' | 'hardware' | 'location' | 'system' | 'web'>('all');

  // Editable form fields
  const [formData, setFormData] = useState<Partial<Project>>({});

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projData, buildsData, codeData] = await Promise.all([
        api.getProject(projectId),
        api.getBuilds(),
        api.getProjectSourceFiles(projectId),
      ]);
      setProject(projData.project);
      setBuilds((buildsData.builds || []).filter((b) => b.projectId === projectId));
      setFormData(projData.project);
      setSourceCode(codeData.files || {});
    } catch (err: any) {
      showToast(err.message || 'Failed to load project', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const res = await api.updateProject(projectId, formData);
      setProject(res.project);
      showToast('Project configuration saved!', 'success');
      // Refresh source code since settings changed
      const codeData = await api.getProjectSourceFiles(projectId);
      setSourceCode(codeData.files || {});
    } catch (err: any) {
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartBuild = async (type: 'apk' | 'aab') => {
    // Strictly enforce Google authentication to build the app
    if (!user || user.authProvider !== 'google') {
      setPendingBuildType(type);
      showToast('Google Sign-In required: Please sign in with Google to start building', 'warning');
      setShowGoogleAuthGate(true);
      return;
    }

    try {
      showToast(`Triggering ${type.toUpperCase()} build...`, 'info');
      const res = await api.startBuild(projectId, type);
      trackBuild(res.build.id);
      showToast(`Build started #${res.build.id}`, 'success');
      onNavigate('build-details', res.build.id);
    } catch (err: any) {
      if (err.message?.includes('Google') || err.message?.includes('auth') || err.message?.includes('GOOGLE_AUTH_REQUIRED')) {
        setPendingBuildType(type);
        setShowGoogleAuthGate(true);
      }
      showToast(err.message || 'Failed to start build', 'error');
    }
  };

  const handleCopyCode = (filename: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!project) return;
    try {
      setIsDeleting(true);
      await api.deleteProject(projectId);
      showToast(`Application "${project.name}" was deleted successfully`, 'info');
      setShowDeleteModal(false);
      onNavigate('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
      setIsDeleting(false);
    }
  };

  if (loading && !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RotateCw className="w-8 h-8 animate-spin text-[#635BFF] mx-auto mb-3" />
        <p className="text-xs text-gray-500">Loading project configuration...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-semibold text-gray-700">Project not found</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'config', label: 'App Configuration', icon: Sliders },
    { id: 'preview', label: 'Phone Preview', icon: Smartphone },
    { id: 'navigation', label: 'Navigation & Deep Links', icon: Link },
    { id: 'permissions', label: 'Permissions', icon: ShieldCheck },
    { id: 'branding', label: 'Branding & Assets', icon: Palette },
    { id: 'builds', label: `Builds (${builds.length})`, icon: History },
    { id: 'source', label: 'Android Source', icon: Code },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <img
              src={project.iconUrl}
              alt={project.name}
              className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{project.name}</h1>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-md uppercase">
                  v{project.versionName}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{project.packageName}</p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleStartBuild('apk')}
            className="px-4 py-2.5 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl shadow-md shadow-[#635BFF]/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Build APK</span>
          </button>
          <button
            onClick={() => handleStartBuild('aab')}
            className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Build AAB</span>
          </button>
          <button
            id="delete-app-header-btn"
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Delete Application"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Application</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pb-px">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'border-[#635BFF] text-[#635BFF]'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Target SDK</span>
                <p className="text-xl font-black text-gray-900 mt-1">API {project.targetSdk}</p>
                <span className="text-[11px] text-emerald-600 font-semibold">Play Store Compliant</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Total Builds</span>
                <p className="text-xl font-black text-gray-900 mt-1">{builds.length}</p>
                <span className="text-[11px] text-gray-500">History tracked</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Latest Build</span>
                <p className="text-xl font-black text-gray-900 mt-1">
                  {project.latestBuildStatus || 'None yet'}
                </p>
                <span className="text-[11px] text-[#635BFF] font-semibold">
                  v{project.versionName} (Code {project.versionCode})
                </span>
              </div>
            </div>

            {/* Target Website Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Target Web Asset</h3>
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#635BFF] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-mono text-xs text-gray-700 break-all">
                {project.websiteUrl}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>

            {/* App Configuration Section (Android Metadata) */}
            <div id="app-configuration-section" className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#635BFF] flex items-center justify-center border border-indigo-100">
                    <Sliders className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">App Configuration</h3>
                      <span className="px-2 py-0.5 bg-indigo-50 text-[#635BFF] text-[10px] font-bold rounded-full">
                        Android Metadata
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Customize generated Android metadata: app name, package ID, and launch splash color.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('config')}
                    className="text-xs text-[#635BFF] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>More Settings</span>
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-3.5 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. App Name */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Application Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. My App Name"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-[#635BFF] focus:border-[#635BFF] transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Label displayed below launcher icons and in Android task switcher.
                  </p>
                </div>

                {/* 2. Package ID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">
                      Package ID (Application ID) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">Play Store ID</span>
                  </div>
                  <input
                    type="text"
                    value={formData.packageName || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        packageName: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''),
                      })
                    }
                    placeholder="com.company.app"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-mono transition-all ${
                      getPackageNameIssues(formData.packageName || '').length === 0
                        ? 'border-gray-200 focus:bg-white focus:ring-1 focus:ring-[#635BFF]'
                        : 'border-rose-300 text-rose-700 bg-rose-50/40'
                    }`}
                  />
                  {getPackageNameIssues(formData.packageName || '').length > 0 ? (
                    <p className="text-[10px] text-rose-600 mt-1">
                      {getPackageNameIssues(formData.packageName || '')[0]}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Unique Java package identifier (e.g. <code>com.example.app</code>).
                    </p>
                  )}
                </div>

                {/* 3. Splash Screen Color */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Splash Screen Color</label>
                    <span className="text-[10px] text-gray-400">Launch Window</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={formData.splashBgColor || '#0F172A'}
                        onChange={(e) => setFormData({ ...formData, splashBgColor: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer overflow-hidden p-0.5 bg-white shrink-0"
                        title="Pick Splash Screen Background Color"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.splashBgColor || '#0F172A'}
                      onChange={(e) => setFormData({ ...formData, splashBgColor: e.target.value })}
                      placeholder="#0F172A"
                      className="w-28 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                    />
                    <div
                      className="flex-1 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-[10px] font-bold shadow-xs px-2 truncate transition-colors"
                      style={{
                        backgroundColor: formData.splashBgColor || '#0F172A',
                        color:
                          (formData.splashBgColor || '#0F172A').toLowerCase() === '#ffffff' ||
                          (formData.splashBgColor || '').toLowerCase() === '#fff'
                            ? '#0f172a'
                            : '#ffffff',
                      }}
                    >
                      <span>Splash Preview</span>
                    </div>
                  </div>

                  {/* Preset quick swatches */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-gray-400 mr-0.5">Presets:</span>
                    {[
                      { hex: '#0F172A', label: 'Midnight' },
                      { hex: '#000000', label: 'Black' },
                      { hex: '#635BFF', label: 'Indigo' },
                      { hex: '#1E293B', label: 'Slate' },
                      { hex: '#FFFFFF', label: 'White' },
                    ].map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setFormData({ ...formData, splashBgColor: preset.hex })}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-gray-200 hover:border-gray-400 transition-colors flex items-center gap-1 cursor-pointer bg-white"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Status Bar & Theme Accent Colors */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Status Bar & Accent Colors</label>
                    <span className="text-[10px] text-gray-400">System UI</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={formData.statusBarColor || '#0F172A'}
                          onChange={(e) => setFormData({ ...formData, statusBarColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0.5 bg-white shrink-0"
                          title="Status Bar Color"
                        />
                        <input
                          type="text"
                          value={formData.statusBarColor || '#0F172A'}
                          onChange={(e) => setFormData({ ...formData, statusBarColor: e.target.value })}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Status Bar</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={formData.primaryColor || '#635BFF'}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0.5 bg-white shrink-0"
                          title="Primary Accent Color"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor || '#635BFF'}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Primary Accent</span>
                    </div>
                  </div>
                </div>

                {/* 5. Version Info */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Version Name & Version Code</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={formData.versionName || ''}
                        onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                        placeholder="1.0.0"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                      />
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Version (e.g. 1.0.0)</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        min={1}
                        value={formData.versionCode || 1}
                        onChange={(e) =>
                          setFormData({ ...formData, versionCode: parseInt(e.target.value, 10) || 1 })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                      />
                      <span className="text-[10px] text-gray-400 mt-0.5 block">Code (Integer)</span>
                    </div>
                  </div>
                </div>

                {/* 6. Target Web URL */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Website URL</label>
                  <input
                    type="url"
                    value={formData.websiteUrl || ''}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Primary URL loaded by WebView.</span>
                </div>
              </div>

              {/* Action and status footer */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Changes apply to future compiled APK/AAB builds and live Phone Preview.</span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save App Configuration'}</span>
                </button>
              </div>
            </div>

            {/* Recent Builds Quick Table */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Recent Build Artifacts</h3>
                <button
                  onClick={() => setActiveTab('builds')}
                  className="text-xs text-[#635BFF] hover:underline font-semibold"
                >
                  View all ({builds.length})
                </button>
              </div>

              {builds.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  No builds created yet. Click &quot;Build APK&quot; to compile your first package.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {builds.slice(0, 3).map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-gray-500 font-semibold">#{b.id}</span>
                        <span className="ml-2 font-bold uppercase text-[10px] text-gray-700 px-2 py-0.5 bg-gray-100 rounded">
                          {b.buildType}
                        </span>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(b.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {b.status === 'COMPLETED' ? (
                          <a
                            href={b.apkUrl}
                            download
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => onNavigate('build-details', b.id)}
                            className="px-3 py-1.5 bg-indigo-50 text-[#635BFF] rounded-lg font-bold text-xs"
                          >
                            Logs
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Mini Phone Preview */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="sticky top-24">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block text-center mb-2">
                Simulated Screen
              </span>
              <PhonePreview project={formData} showControls={false} />
            </div>
          </div>
        </div>
      )}

      {/* 2. PREVIEW TAB */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-8 flex flex-col items-center justify-center">
          <div className="max-w-md text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Interactive Android Phone Emulator</h3>
            <p className="text-xs text-gray-500 mt-1">
              Toggle between the Splash launch sequence, live WebView render, and offline error screens.
            </p>
          </div>
          <PhonePreview project={formData} showControls={true} />
        </div>
      )}

      {/* 3. ANDROID ENGINE & METADATA CONFIGURATION TAB */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">App Configuration & Engine Settings</h3>
                <span className="px-2 py-0.5 bg-indigo-50 text-[#635BFF] text-[10px] font-bold rounded-full uppercase">
                  Android Manifest
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure Android metadata (app name, package ID, splash color), SDK targets, and WebView runtime engine.
              </p>
            </div>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>

          {/* App ID & Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Application Public Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Target Website URL</label>
              <input
                type="url"
                value={formData.websiteUrl || ''}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-gray-700">Android Package Name (Application ID)</label>
                <span className="text-[10px] text-gray-400">Play Store Identifier</span>
              </div>
              <input
                type="text"
                value={formData.packageName || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packageName: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''),
                  })
                }
                className={`w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm font-mono ${
                  getPackageNameIssues(formData.packageName || '').length === 0
                    ? 'border-gray-200'
                    : 'border-rose-400 text-rose-700'
                }`}
              />
              {getPackageNameIssues(formData.packageName || '').length > 0 && (
                <p className="text-[10px] text-rose-600 mt-1">
                  {getPackageNameIssues(formData.packageName || '')[0]}
                </p>
              )}
            </div>

            {/* Splash Screen Background Color */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-gray-700">Splash Screen Color</label>
                <span className="text-[10px] text-gray-400">Launch Window Theme</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.splashBgColor || '#0F172A'}
                  onChange={(e) => setFormData({ ...formData, splashBgColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer overflow-hidden p-0.5 bg-white shrink-0"
                  title="Pick Splash Screen Background Color"
                />
                <input
                  type="text"
                  value={formData.splashBgColor || '#0F172A'}
                  onChange={(e) => setFormData({ ...formData, splashBgColor: e.target.value })}
                  placeholder="#0F172A"
                  className="w-28 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                />
                <div
                  className="flex-1 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-[10px] font-bold shadow-xs px-2 truncate"
                  style={{
                    backgroundColor: formData.splashBgColor || '#0F172A',
                    color:
                      (formData.splashBgColor || '#0F172A').toLowerCase() === '#ffffff' ||
                      (formData.splashBgColor || '').toLowerCase() === '#fff'
                        ? '#0f172a'
                        : '#ffffff',
                  }}
                >
                  <span>Splash Swatch</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-gray-400 mr-0.5">Presets:</span>
                {[
                  { hex: '#0F172A', label: 'Midnight' },
                  { hex: '#000000', label: 'Black' },
                  { hex: '#635BFF', label: 'Indigo' },
                  { hex: '#1E293B', label: 'Slate' },
                  { hex: '#FFFFFF', label: 'White' },
                ].map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, splashBgColor: preset.hex })}
                    className="px-2 py-0.5 text-[10px] font-medium rounded-md border border-gray-200 hover:border-gray-400 transition-colors flex items-center gap-1 cursor-pointer bg-white"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Version Name & Integer Version Code</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.versionName || ''}
                  onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                  placeholder="1.0.0"
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                />
                <input
                  type="number"
                  min={1}
                  value={formData.versionCode || 1}
                  onChange={(e) =>
                    setFormData({ ...formData, versionCode: parseInt(e.target.value, 10) || 1 })
                  }
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Status Bar & Accent Colors</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={formData.statusBarColor || '#0F172A'}
                    onChange={(e) => setFormData({ ...formData, statusBarColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0.5 bg-white shrink-0"
                    title="Status Bar Color"
                  />
                  <input
                    type="text"
                    value={formData.statusBarColor || '#0F172A'}
                    onChange={(e) => setFormData({ ...formData, statusBarColor: e.target.value })}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={formData.primaryColor || '#635BFF'}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer overflow-hidden p-0.5 bg-white shrink-0"
                    title="Primary Accent Color"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor || '#635BFF'}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">App Store Short Description</label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Android SDK Targets & Cache Policy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-gray-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-gray-700">Minimum Android SDK (minSdk)</label>
                <span className="text-[10px] text-emerald-600 font-bold">Device Reach</span>
              </div>
              <select
                value={formData.minSdk || 26}
                onChange={(e) => setFormData({ ...formData, minSdk: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              >
                <option value={21}>Android 5.0 (API 21) - 99.4% market reach</option>
                <option value={24}>Android 7.0 (API 24) - 96.2% market reach</option>
                <option value={26}>Android 8.0 (API 26) - 94.0% market reach (Recommended)</option>
                <option value={30}>Android 11.0 (API 30) - 84.8% market reach</option>
                <option value={33}>Android 13.0 (API 33) - 65.2% market reach</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-gray-700">Target SDK (Play Store Policy)</label>
                <span className="text-[10px] text-purple-600 font-bold">API 34 Mandate</span>
              </div>
              <select
                value={formData.targetSdk || 34}
                onChange={(e) => setFormData({ ...formData, targetSdk: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              >
                <option value={34}>API 34 (Android 14) - Play Store Requirement</option>
                <option value={33}>API 33 (Android 13) - Legacy devices</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">WebView Cache Policy</label>
              <select
                value={formData.cacheMode || 'LOAD_DEFAULT'}
                onChange={(e) => setFormData({ ...formData, cacheMode: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              >
                <option value="LOAD_DEFAULT">LOAD_DEFAULT - Standard HTTP caching</option>
                <option value="LOAD_CACHE_ELSE_NETWORK">LOAD_CACHE_ELSE_NETWORK - Offline-first fallback</option>
                <option value="LOAD_NO_CACHE">LOAD_NO_CACHE - Always fresh (bypass cache)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Custom User-Agent Suffix</label>
              <input
                type="text"
                value={formData.userAgentSuffix || ''}
                onChange={(e) => setFormData({ ...formData, userAgentSuffix: e.target.value })}
                placeholder="Web2APK/2.4 (Android; Mobile)"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Orientation and Hardware Toggles */}
          <div className="space-y-3 pt-4 border-t border-gray-100 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-2">Screen Orientation Lock</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'portrait', label: 'Portrait' },
                  { id: 'landscape', label: 'Landscape' },
                  { id: 'auto', label: 'Auto Rotate' },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, orientation: o.id as any })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      (formData.orientation || 'portrait') === o.id
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
              <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.keepScreenOn || false}
                  onChange={(e) => setFormData({ ...formData, keepScreenOn: e.target.checked })}
                  className="w-4 h-4 text-[#635BFF] rounded"
                />
                <div>
                  <span className="font-semibold text-gray-800 block">Keep Screen On</span>
                  <span className="text-[10px] text-gray-400">FLAG_KEEP_SCREEN_ON window policy</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hardwareAccelerated ?? true}
                  onChange={(e) => setFormData({ ...formData, hardwareAccelerated: e.target.checked })}
                  className="w-4 h-4 text-[#635BFF] rounded"
                />
                <div>
                  <span className="font-semibold text-gray-800 block">Hardware GPU Acceleration</span>
                  <span className="text-[10px] text-gray-400">Smooth 60fps scrolling & canvas rendering</span>
                </div>
              </label>
            </div>
          </div>

          {/* Custom CSS and JS Injections */}
          <div className="space-y-4 pt-4 border-t border-gray-100 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-gray-800">
                  Custom CSS Injection (Hide website headers, navigation, or promo popups)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        customCss: (formData.customCss || '') + '\nheader, .header { display: none !important; }',
                      })
                    }
                    className="text-[10px] text-[#635BFF] hover:underline font-semibold"
                  >
                    + Hide Header
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        customCss: (formData.customCss || '') + '\nfooter, .footer { display: none !important; }',
                      })
                    }
                    className="text-[10px] text-[#635BFF] hover:underline font-semibold"
                  >
                    + Hide Footer
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={formData.customCss || ''}
                onChange={(e) => setFormData({ ...formData, customCss: e.target.value })}
                placeholder="header { display: none !important; }"
                className="w-full px-3 py-2 bg-[#0F172A] text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-gray-800">
                  Custom JavaScript Injection (Client-side native hooks)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      customJs: (formData.customJs || '') + "\nconsole.log('Web2APK Native Wrapper initialized');",
                    })
                  }
                  className="text-[10px] text-[#635BFF] hover:underline font-semibold"
                >
                  + Add Log Hook
                </button>
              </div>
              <textarea
                rows={3}
                value={formData.customJs || ''}
                onChange={(e) => setFormData({ ...formData, customJs: e.target.value })}
                placeholder="/* Custom JavaScript executed in WebView */&#10;console.log('Native shell loaded');"
                className="w-full px-3 py-2 bg-[#0F172A] text-sky-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3.1 NAVIGATION & DEEP LINKING STUDIO TAB */}
      {activeTab === 'navigation' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Navigation Architecture & Deep Linking</h3>
              <p className="text-xs text-gray-500">
                Manage mobile navigation bars, bottom tabs, custom schemes, and Android App Links intent filters.
              </p>
            </div>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Navigation'}</span>
            </button>
          </div>

          {/* Navigation Type Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">Navigation Presentation Mode</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { type: 'bottom', label: 'Bottom Bar', desc: 'Native bottom tabs' },
                { type: 'top', label: 'Top Bar', desc: 'App header title' },
                { type: 'website', label: 'Pure Website', desc: 'Use site menu' },
                { type: 'none', label: 'Full Screen', desc: 'No wrapper nav' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, navigationType: opt.type as NavigationType })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    (formData.navigationType || 'bottom') === opt.type
                      ? 'border-[#635BFF] bg-[#635BFF]/5 ring-2 ring-[#635BFF]/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block font-bold text-xs text-gray-900">{opt.label}</span>
                  <span className="text-[10px] text-gray-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Tabs Editor */}
          {formData.navigationType === 'bottom' && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Bottom Navigation Tabs</span>
                  <span className="text-[11px] text-gray-400">Configure up to 5 mobile bottom tabs</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentTabs = formData.navigationItems || [];
                    if (currentTabs.length < 5) {
                      setFormData({
                        ...formData,
                        navigationItems: [
                          ...currentTabs,
                          {
                            id: Date.now().toString(),
                            label: 'New Tab',
                            url: formData.websiteUrl || '/',
                            icon: 'Home',
                          },
                        ],
                      });
                    }
                  }}
                  className="text-xs text-[#635BFF] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tab</span>
                </button>
              </div>

              <div className="space-y-2">
                {(formData.navigationItems || []).map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={item.icon}
                        onChange={(e) => {
                          const updated = [...(formData.navigationItems || [])];
                          updated[idx] = { ...updated[idx], icon: e.target.value };
                          setFormData({ ...formData, navigationItems: updated });
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
                          const updated = [...(formData.navigationItems || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setFormData({ ...formData, navigationItems: updated });
                        }}
                        placeholder="Label"
                        className="w-24 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => {
                        const updated = [...(formData.navigationItems || [])];
                        updated[idx] = { ...updated[idx], url: e.target.value };
                        setFormData({ ...formData, navigationItems: updated });
                      }}
                      placeholder="Destination URL"
                      className="flex-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs truncate"
                    />
                    {(formData.navigationItems || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.navigationItems || []).filter((_, i) => i !== idx);
                          setFormData({ ...formData, navigationItems: updated });
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors self-end sm:self-center cursor-pointer"
                        title="Delete Tab"
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
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-[#635BFF]" />
                <h4 className="text-xs font-bold text-gray-900">Deep Linking & App Links Studio</h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.deepLinkConfig?.enabled ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deepLinkConfig: {
                        ...(formData.deepLinkConfig || {
                          scheme: 'myapp',
                          host: 'example.com',
                          pathPrefixes: ['/'],
                          autoVerify: true,
                        }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-[#635BFF] rounded"
                />
                <span>Enable Deep Linking</span>
              </label>
            </div>

            {(formData.deepLinkConfig?.enabled ?? true) && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Custom URL Scheme (e.g. shoppulse://)
                    </label>
                    <input
                      type="text"
                      value={formData.deepLinkConfig?.scheme || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deepLinkConfig: {
                            ...(formData.deepLinkConfig as DeepLinkConfig),
                            scheme: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                          },
                        })
                      }
                      placeholder="myapp"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Verified Host Domain (HTTPS App Links)
                    </label>
                    <input
                      type="text"
                      value={formData.deepLinkConfig?.host || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deepLinkConfig: {
                            ...(formData.deepLinkConfig as DeepLinkConfig),
                            host: e.target.value,
                          },
                        })
                      }
                      placeholder="example.com"
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Path Prefixes Manager */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    URL Path Prefixes Captured by App
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
                            const existing = formData.deepLinkConfig?.pathPrefixes || [];
                            setFormData({
                              ...formData,
                              deepLinkConfig: {
                                ...(formData.deepLinkConfig as DeepLinkConfig),
                                pathPrefixes: [...existing, prefix.trim()],
                              },
                            });
                            setNewPrefixInput('');
                          }
                        }
                      }}
                      placeholder="Enter path (e.g. /products) & press Enter"
                      className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPrefixInput.trim()) {
                          const prefix = newPrefixInput.startsWith('/') ? newPrefixInput : '/' + newPrefixInput;
                          const existing = formData.deepLinkConfig?.pathPrefixes || [];
                          setFormData({
                            ...formData,
                            deepLinkConfig: {
                              ...(formData.deepLinkConfig as DeepLinkConfig),
                              pathPrefixes: [...existing, prefix.trim()],
                            },
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
                    {(formData.deepLinkConfig?.pathPrefixes || []).map((prefix, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-purple-200 rounded-lg text-xs font-mono text-purple-700 shadow-xs"
                      >
                        <span>{prefix}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const existing = formData.deepLinkConfig?.pathPrefixes || [];
                            setFormData({
                              ...formData,
                              deepLinkConfig: {
                                ...(formData.deepLinkConfig as DeepLinkConfig),
                                pathPrefixes: existing.filter((_, i) => i !== idx),
                              },
                            });
                          }}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
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
                    checked={formData.deepLinkConfig?.autoVerify ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deepLinkConfig: {
                          ...(formData.deepLinkConfig as DeepLinkConfig),
                          autoVerify: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-[#635BFF] rounded"
                  />
                  <span className="font-semibold text-gray-800">
                    Enable <code className="font-mono text-gray-900">android:autoVerify=&quot;true&quot;</code> (Open directly without browser chooser)
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3.2 GRANULAR PERMISSIONS TAB */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Native Capabilities & Permissions Management</h3>
              <p className="text-xs text-gray-500">
                Toggle hardware access, background services, biometric auth, and link handlers.
              </p>
            </div>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Permissions'}</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-2xl">
            {[
              { id: 'all', label: 'All Capabilities' },
              { id: 'hardware', label: 'Hardware & Media' },
              { id: 'location', label: 'Location & GPS' },
              { id: 'system', label: 'System & Security' },
              { id: 'web', label: 'Web Engine' },
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

          {/* Granular Permission Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
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
                desc: 'Voice search, notes, and audio recording',
                manifest: 'android.permission.RECORD_AUDIO',
                badge: 'Runtime Prompt',
              },
              {
                key: 'bluetooth',
                cat: 'hardware',
                label: 'Bluetooth LE Connectivity',
                desc: 'Connect to receipt printers, beacons, and hardware peripherals',
                manifest: 'android.permission.BLUETOOTH_CONNECT',
                badge: 'Android 12+',
              },
              {
                key: 'wakeLock',
                cat: 'hardware',
                label: 'Wake Lock (Prevent Screen Sleep)',
                desc: 'Keep device screen active during long video or checkout sessions',
                manifest: 'android.permission.WAKE_LOCK',
                badge: 'Power Policy',
              },
              {
                key: 'geolocation',
                cat: 'location',
                label: 'GPS Precise Location',
                desc: 'Access user GPS coordinates for maps and delivery zones',
                manifest: 'ACCESS_FINE_LOCATION',
                badge: 'Play Store Disclosure',
              },
              {
                key: 'notifications',
                cat: 'system',
                label: 'Push & Post Notifications',
                desc: 'Deliver real-time order alerts and push notifications',
                manifest: 'POST_NOTIFICATIONS',
                badge: 'Android 13+ Prompt',
              },
              {
                key: 'biometrics',
                cat: 'system',
                label: 'Biometric Authentication',
                desc: 'Fingerprint & Face biometric unlock for sensitive screens',
                manifest: 'android.permission.USE_BIOMETRIC',
                badge: 'Security',
              },
              {
                key: 'fileUpload',
                cat: 'system',
                label: 'Photo & File Chooser',
                desc: 'Allow user to pick photos and documents from gallery',
                manifest: 'READ_MEDIA_IMAGES',
                badge: 'Native Chooser',
              },
              {
                key: 'handleDownloads',
                cat: 'system',
                label: 'Android Download Manager',
                desc: 'Save receipts, invoices, and PDFs directly to Downloads',
                manifest: 'DownloadManager Service',
                badge: 'System Service',
              },
              {
                key: 'javascript',
                cat: 'web',
                label: 'JavaScript Execution',
                desc: 'Execute dynamic React/Vue/Angular scripts in WebView',
                manifest: 'WebSettings.javaScriptEnabled',
                badge: 'Core Engine',
              },
              {
                key: 'cookies',
                cat: 'web',
                label: 'Persistent Session Cookies',
                desc: 'Retain customer login sessions across application restarts',
                manifest: 'CookieManager.setAcceptCookie',
                badge: 'Session State',
              },
              {
                key: 'localStorage',
                cat: 'web',
                label: 'DOM LocalStorage & IndexedDB',
                desc: 'Persist client data and shopping cart caches locally',
                manifest: 'WebSettings.domStorageEnabled',
                badge: 'Offline Cache',
              },
              {
                key: 'pullToRefresh',
                cat: 'web',
                label: 'Pull to Refresh Gesture',
                desc: 'Swipe downward gesture from top of screen to reload page',
                manifest: 'SwipeRefreshLayout',
                badge: 'Native Gesture',
              },
              {
                key: 'deepLinks',
                cat: 'web',
                label: 'Android App Deep Links',
                desc: 'Capture web links directly into the mobile application',
                manifest: '<intent-filter>',
                badge: 'Intent Filter',
              },
              {
                key: 'openExternalLinks',
                cat: 'web',
                label: 'External Browser for Outbound Links',
                desc: 'Open outbound third-party links in Chrome browser',
                manifest: 'Intent.ACTION_VIEW',
                badge: 'App Boundary',
              },
              {
                key: 'openTelLinks',
                cat: 'web',
                label: 'Direct Phone Dialing (tel:)',
                desc: 'Tap telephone links to launch phone keypad',
                manifest: 'Intent.ACTION_DIAL',
                badge: 'Telephony',
              },
              {
                key: 'openMailtoLinks',
                cat: 'web',
                label: 'Direct Email Links (mailto:)',
                desc: 'Tap email links to launch mobile email app',
                manifest: 'Intent.ACTION_SENDTO',
                badge: 'Messaging',
              },
            ]
              .filter((item) => permCategory === 'all' || item.cat === permCategory)
              .map((item) => {
                const isChecked = !!(formData.permissions as any)?.[item.key];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3.5 border rounded-2xl cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-purple-50/40 border-[#635BFF]/40 shadow-2xs'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...(formData.permissions || {}),
                            [item.key]: e.target.checked,
                          },
                        })
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
                );
              })}
          </div>
        </div>
      )}

      {/* 4. BRANDING TAB */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Visual Branding & Color Palette</h3>
              <p className="text-xs text-gray-500">Configure status bars, splash themes, and launcher icons.</p>
            </div>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Branding'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <label className="block text-xs font-bold text-gray-800">Launcher Icon URL</label>
              <div className="flex items-center gap-3">
                <img src={formData.iconUrl} alt="Icon" className="w-12 h-12 rounded-xl object-cover border" />
                <input
                  type="text"
                  value={formData.iconUrl || ''}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <label className="block text-xs font-bold text-gray-800">Splash Logo URL</label>
              <div className="flex items-center gap-3">
                <img src={formData.splashUrl} alt="Splash" className="w-12 h-12 rounded-xl object-cover border" />
                <input
                  type="text"
                  value={formData.splashUrl || ''}
                  onChange={(e) => setFormData({ ...formData, splashUrl: e.target.value })}
                  className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor || '#635BFF'}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor || '#635BFF'}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Splash Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.splashBgColor || '#0F172A'}
                  onChange={(e) => setFormData({ ...formData, splashBgColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.splashBgColor || '#0F172A'}
                  onChange={(e) => setFormData({ ...formData, splashBgColor: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status Bar Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.statusBarColor || '#0F172A'}
                  onChange={(e) => setFormData({ ...formData, statusBarColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.statusBarColor || '#0F172A'}
                  onChange={(e) => setFormData({ ...formData, statusBarColor: e.target.value })}
                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. BUILDS TAB */}
      {activeTab === 'builds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Build History for {project.name}</h3>
            <button
              onClick={() => handleStartBuild('apk')}
              className="px-3.5 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Queue New Build</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Job ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {builds.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-mono text-gray-700">#{b.id}</td>
                    <td className="px-5 py-3.5 uppercase font-bold text-[10px] text-gray-600">{b.buildType}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          b.status === 'COMPLETED' ? 'text-emerald-600' : 'text-indigo-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate('build-details', b.id)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold"
                        >
                          View Logs
                        </button>
                        {b.status === 'COMPLETED' && (
                          <a
                            href={b.apkUrl}
                            download
                            className="p-1.5 bg-[#635BFF] text-white rounded-lg shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ANDROID SOURCE CODE INSPECTOR */}
      {activeTab === 'source' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Generated Android Native Source Code</h3>
            <p className="text-xs text-gray-500">
              Web2APK produces clean Kotlin 2.0 and Gradle scripts targeting Android 14.
            </p>
          </div>

          {sourceCode && (
            <div className="space-y-6">
              {Object.entries(sourceCode).map(([filename, content]) => (
                <div key={filename} className="rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-gray-800">{filename}</span>
                    <button
                      onClick={() => handleCopyCode(filename, content as string)}
                      className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 font-semibold"
                    >
                      {copiedFile === filename ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-[#0F172A] text-gray-200 text-xs font-mono overflow-x-auto max-h-72">
                    <code>{content}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. SETTINGS & DANGER ZONE */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Project General Information</h3>
            <div className="text-xs text-gray-600 space-y-2">
              <p>Project ID: <span className="font-mono text-gray-900 font-bold">{project.id}</span></p>
              <p>Created on: <span className="text-gray-900">{new Date(project.createdAt).toLocaleDateString()}</span></p>
              <p>Owner: <span className="text-gray-900">{project.userId}</span></p>
            </div>
          </div>

          <div className="bg-red-50/70 border border-red-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-950">Danger Zone</h3>
                <p className="text-xs text-red-800">
                  Permanently delete this project and all associated compiled APK builds.
                </p>
              </div>
            </div>
            <button
              id="delete-app-settings-btn"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Application</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Application Confirmation Dialog */}
      {showDeleteModal && project && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              disabled={isDeleting}
              className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 pr-6">
                <h3 id="delete-dialog-title" className="text-lg font-bold text-gray-900 tracking-tight">
                  Delete Application?
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to permanently delete this application? This action cannot be undone.
                </p>
              </div>
            </div>

            {/* App Preview Card */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-3">
              <img
                src={project.iconUrl}
                alt={project.name}
                className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900 truncate">{project.name}</span>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-200/70 px-1.5 py-0.5 rounded">
                    v{project.versionName}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-gray-500 truncate">{project.packageName}</p>
              </div>
            </div>

            {/* Warning callout */}
            <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="leading-snug">
                All configuration, Android keystores, and compiled build records ({builds.length} build{builds.length === 1 ? '' : 's'}) will be permanently removed.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                id="cancel-delete-app-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-app-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Authentication Required Modal for Builds */}
      <GoogleAuthGateModal
        isOpen={showGoogleAuthGate}
        onClose={() => setShowGoogleAuthGate(false)}
        onSuccess={() => {
          handleStartBuild(pendingBuildType);
        }}
        appName={project?.name}
      />
    </div>
  );
}
