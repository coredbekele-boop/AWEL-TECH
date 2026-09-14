import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Cpu,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Clock,
  Terminal,
  ArrowLeft,
  FileCode,
  Share2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Bug,
  Volume2,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import type { Build } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { WebsiteScreenshotThumbnail } from '../components/WebsiteScreenshotThumbnail.tsx';

interface BuildDetailsViewProps {
  buildId: string;
  onNavigate: (view: string, id?: string) => void;
}

export function BuildDetailsView({ buildId, onNavigate }: BuildDetailsViewProps) {
  const { showToast } = useAuth();
  const { notifyBuildSuccess, notifyBuildError, trackBuild } = useToast();
  const [build, setBuild] = useState<Build | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const previousStatusRef = useRef<string | null>(null);

  const fetchBuild = async () => {
    try {
      const data = await api.getBuild(buildId);
      const newBuild = data.build;
      setBuild(newBuild);

      // Trigger toast if status changed while on this view
      if (
        previousStatusRef.current &&
        previousStatusRef.current !== newBuild.status
      ) {
        if (newBuild.status === 'COMPLETED') {
          notifyBuildSuccess(newBuild);
        } else if (newBuild.status === 'FAILED') {
          notifyBuildError(newBuild);
        }
      }
      previousStatusRef.current = newBuild.status;

      if (newBuild.status === 'COMPLETED' || newBuild.status === 'FAILED') {
        setPolling(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching build', 'error');
      setPolling(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    previousStatusRef.current = null;
    fetchBuild();
  }, [buildId]);

  // Live polling while in progress
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(() => {
      fetchBuild();
    }, 1500);
    return () => clearInterval(interval);
  }, [polling, buildId]);

  const handleRetry = async () => {
    try {
      showToast('Retrying build compilation...', 'info');
      const res = await api.retryBuild(buildId);
      setBuild(res.build);
      trackBuild(res.build.id);
      previousStatusRef.current = res.build.status;
      setPolling(true);
    } catch (err: any) {
      showToast(err.message || 'Retry failed', 'error');
    }
  };

  const handleSimulateFail = async () => {
    try {
      showToast('Simulating build failure...', 'warning');
      const res = await api.failBuild(
        buildId,
        'Execution failed for task :app:compileReleaseKotlin (Syntax error in WebAppInterface.kt: Unresolved reference)'
      );
      setBuild(res.build);
      notifyBuildError(res.build);
      setPolling(false);
    } catch (err: any) {
      showToast(err.message || 'Simulation failed', 'error');
    }
  };

  const handleTestSuccessToast = () => {
    notifyBuildSuccess({
      id: build?.id || 'bld_sample',
      projectId: build?.projectId || 'proj_1',
      projectName: build?.projectName || 'ShopPulse Boutique',
      websiteUrl: build?.websiteUrl || 'https://yesufapp.com',
      userId: 'usr_1',
      buildType: build?.buildType || 'apk',
      status: 'COMPLETED',
      progress: 100,
      stepDescription: 'Build complete! Release artifacts ready.',
      logs: [],
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      apkUrl: build?.apkUrl || `/api/builds/${build?.id || 'bld_1'}/download?type=apk`,
    });
  };

  const handleTestErrorToast = () => {
    notifyBuildError({
      id: build?.id || 'bld_sample',
      projectId: build?.projectId || 'proj_1',
      projectName: build?.projectName || 'ShopPulse Boutique',
      websiteUrl: build?.websiteUrl || 'https://yesufapp.com',
      userId: 'usr_1',
      buildType: build?.buildType || 'apk',
      status: 'FAILED',
      progress: 60,
      stepDescription: 'Gradle compilation failed with exit code 1',
      error: 'Execution failed for task :app:compileReleaseKotlin (Syntax error in WebAppInterface.kt: unresolved reference)',
      logs: [],
      createdAt: new Date().toISOString(),
    });
  };

  if (loading && !build) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <RotateCw className="w-8 h-8 animate-spin text-[#635BFF] mx-auto mb-3" />
        <p className="text-xs text-gray-500 font-medium">Connecting to Android Build Pipeline...</p>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm font-semibold text-gray-700">Build record not found</p>
        <button
          onClick={() => onNavigate('builds')}
          className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Builds
        </button>
      </div>
    );
  }

  const isCompleted = build.status === 'COMPLETED';
  const isFailed = build.status === 'FAILED';
  const isRunning = !isCompleted && !isFailed;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('builds')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Builds</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{build.projectName}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isFailed
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-indigo-50 text-[#635BFF] border border-indigo-200 animate-pulse'
              }`}
            >
              {build.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-mono">Job ID: {build.id}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isCompleted && (
            <>
              <a
                href={build.apkUrl}
                download
                className="px-4 py-2.5 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl shadow-md shadow-[#635BFF]/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download APK</span>
              </a>
              <a
                href={build.aabUrl}
                download
                className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Download AAB</span>
              </a>
            </>
          )}

          {isRunning && (
            <button
              onClick={handleSimulateFail}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Simulate a compilation error to verify the error toast notification"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Simulate Failure</span>
            </button>
          )}

          <button
            onClick={handleRetry}
            disabled={isRunning}
            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Build Again</span>
          </button>
        </div>
      </div>

      {/* Notification Toast System Quick Test Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#635BFF]/20 border border-[#635BFF]/30 flex items-center justify-center text-[#818CF8] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Build Alert Toast System</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Alerts trigger automatically when background builds finish or fail, with audio chime & quick action buttons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleTestSuccessToast}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Test Success Toast</span>
          </button>

          <button
            onClick={handleTestErrorToast}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Test Error Toast</span>
          </button>
        </div>
      </div>

      {/* Progress & Status Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">Current Pipeline Phase:</span>
            <span className="text-gray-600">{build.stepDescription}</span>
          </div>
          <span className="font-extrabold text-[#635BFF] text-sm">{build.progress}%</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-emerald-500'
                : isFailed
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] animate-pulse'
            }`}
            style={{ width: `${build.progress}%` }}
          />
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs border-t border-gray-100">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Artifact Format</span>
            <span className="font-bold text-gray-800 uppercase">{build.buildType}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Queue Timestamp</span>
            <span className="font-medium text-gray-800">
              {new Date(build.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Artifact Size</span>
            <span className="font-medium text-gray-800">
              {build.fileSizeBytes ? `${(build.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : 'Compiling...'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Signing Scheme</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>v2 / v3 Keystore</span>
            </span>
          </div>
        </div>
      </div>

      {/* Automated Website Screenshot Thumbnail Preview */}
      <WebsiteScreenshotThumbnail websiteUrl={build.websiteUrl} projectName={build.projectName} />

      {/* Live Terminal Build Logs Console */}
      <div className="bg-[#0F172A] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-[#1E293B]/80 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#635BFF]" />
            <span className="font-mono text-xs font-bold text-gray-300">Android Build Worker Logs (STDOUT)</span>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="flex items-center gap-1.5 text-[10px] text-indigo-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#635BFF] animate-ping" />
                <span>STREAMING</span>
              </span>
            )}
            <span className="text-[10px] text-gray-500 font-mono">{build.logs.length} events logged</span>
          </div>
        </div>

        <div className="p-5 font-mono text-xs text-gray-300 max-h-[380px] overflow-y-auto space-y-2">
          {build.logs.map((entry, idx) => (
            <div key={idx} className="flex items-start gap-3 leading-relaxed">
              <span className="text-gray-500 shrink-0 text-[11px]">[{entry.timestamp}]</span>
              <span
                className={`flex-1 ${
                  entry.level === 'success'
                    ? 'text-emerald-400 font-semibold'
                    : entry.level === 'error'
                    ? 'text-red-400 font-semibold'
                    : entry.level === 'warn'
                    ? 'text-amber-300'
                    : 'text-gray-300'
                }`}
              >
                {entry.message}
              </span>
            </div>
          ))}

          {isRunning && (
            <div className="flex items-center gap-2 text-indigo-400 animate-pulse pt-2 text-[11px]">
              <span>› Executing next compiler stage...</span>
            </div>
          )}
        </div>
      </div>

      {/* Developer Source Code Download Pill */}
      {isCompleted && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-gray-900 block">Android Project Source Code</span>
              <span className="text-gray-500 text-[11px]">
                Inspect MainActivity.kt, AndroidManifest.xml, and build.gradle.kts
              </span>
            </div>
          </div>
          <a
            href={`/api/builds/${build.id}/download?type=source`}
            download
            className="px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-800 transition-colors shadow-xs"
          >
            Download Source Code (JSON/Manifest)
          </a>
        </div>
      )}
    </div>
  );
}
