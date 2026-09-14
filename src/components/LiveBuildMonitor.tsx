import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Terminal,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  Zap,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import type { Build, BuildStatus } from '../types.ts';
import { api } from '../lib/api.ts';

interface LiveBuildMonitorProps {
  build: Build;
  onBuildUpdated?: (updatedBuild: Build) => void;
  onNavigate?: (view: string, id?: string) => void;
  compact?: boolean;
}

const STAGES: Array<{ id: BuildStatus; label: string; icon: any }> = [
  { id: 'QUEUED', label: 'Queued', icon: Clock },
  { id: 'PREPARING', label: 'Preparing', icon: Zap },
  { id: 'GENERATING', label: 'Generating', icon: Smartphone },
  { id: 'BUILDING', label: 'Compiling', icon: Cpu },
  { id: 'SIGNING', label: 'Signing', icon: ShieldCheck },
  { id: 'UPLOADING', label: 'Uploading', icon: RotateCw },
  { id: 'COMPLETED', label: 'Ready', icon: CheckCircle2 },
];

export function LiveBuildMonitor({
  build: initialBuild,
  onBuildUpdated,
  onNavigate,
  compact = false,
}: LiveBuildMonitorProps) {
  const [build, setBuild] = useState<Build>(initialBuild);
  const [logsExpanded, setLogsExpanded] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Sync state if prop changes
  useEffect(() => {
    setBuild(initialBuild);
  }, [initialBuild]);

  // Real-time polling while build is active
  useEffect(() => {
    const isFinished = build.status === 'COMPLETED' || build.status === 'FAILED';
    if (isFinished) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getBuild(build.id);
        setBuild(res.build);
        onBuildUpdated?.(res.build);
      } catch (e) {
        // silent fail during poll
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [build.id, build.status, onBuildUpdated]);

  const getStageIndex = (status: BuildStatus) => {
    return STAGES.findIndex((s) => s.id === status);
  };

  const currentIndex = getStageIndex(build.status);
  const isFinished = build.status === 'COMPLETED';
  const isFailed = build.status === 'FAILED';
  const isActive = !isFinished && !isFailed;

  const handleCopyLogs = () => {
    const text = build.logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  if (compact) {
    return (
      <div className="bg-[#111827] text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {isActive ? (
              <RotateCw className="w-4 h-4 text-[#635BFF] animate-spin" />
            ) : isFinished ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">{build.projectName}</span>
              <span className="text-[10px] text-gray-400 font-mono">#{build.id}</span>
              <span className="px-1.5 py-0.5 rounded bg-gray-800 text-[9px] font-bold uppercase text-purple-300">
                {build.buildType}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate max-w-[280px]">
              {build.stepDescription || build.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-emerald-400">{build.progress}%</span>
          {isFinished && build.apkUrl && (
            <a
              href={build.apkUrl}
              download
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>APK</span>
            </a>
          )}
          <button
            onClick={() => onNavigate?.('build-details', build.id)}
            className="text-xs text-gray-400 hover:text-white underline cursor-pointer"
          >
            Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs space-y-0 transition-all">
      {/* Header bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-900 via-slate-900 to-[#111827] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isActive
                ? 'bg-[#635BFF]/20 text-[#635BFF] border border-[#635BFF]/40'
                : isFinished
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isActive ? (
              <RotateCw className="w-5 h-5 animate-spin" />
            ) : isFinished ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold">{build.projectName}</span>
              <span className="px-2 py-0.5 bg-gray-800 text-[10px] font-mono font-bold rounded text-gray-300">
                #{build.id}
              </span>
              <span className="px-2 py-0.5 bg-[#635BFF]/30 text-[#818cf8] text-[10px] font-bold rounded uppercase">
                {build.buildType}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isActive
                ? `Worker Node: compiling target SDK 34 with release keystore`
                : isFinished
                ? `Compilation completed successfully • Android package ready`
                : `Compilation failed during build execution`}
            </p>
          </div>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isFinished && (
            <>
              {build.apkUrl && (
                <a
                  href={build.apkUrl}
                  download
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK</span>
                </a>
              )}
              {build.aabUrl && (
                <a
                  href={build.aabUrl}
                  download
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download AAB</span>
                </a>
              )}
            </>
          )}

          <button
            onClick={() => onNavigate?.('build-details', build.id)}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Full Console</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Real-time Progress tracker */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900 flex items-center gap-2">
              {isActive && <span className="w-2 h-2 rounded-full bg-[#635BFF] animate-ping" />}
              <span>{build.stepDescription || `Current Status: ${build.status}`}</span>
            </span>
            <span className="font-mono font-bold text-sm text-[#635BFF]">{build.progress}%</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFinished
                  ? 'bg-emerald-500'
                  : isFailed
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-[#635BFF] to-indigo-500'
              }`}
              style={{ width: `${build.progress}%` }}
            />
          </div>
        </div>

        {/* 7-Step Horizontal Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {STAGES.map((stg, idx) => {
            const Icon = stg.icon;
            const isStepCompleted = currentIndex > idx || isFinished;
            const isStepCurrent = currentIndex === idx && !isFinished && !isFailed;

            return (
              <div
                key={stg.id}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                  isStepCurrent
                    ? 'bg-purple-50 border-[#635BFF] text-[#635BFF] shadow-xs ring-1 ring-[#635BFF]/30'
                    : isStepCompleted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {isStepCurrent ? (
                    <RotateCw className="w-4 h-4 animate-spin text-[#635BFF]" />
                  ) : isStepCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{stg.label}</span>
              </div>
            );
          })}
        </div>

        {/* Streaming Live Terminal Logs Toggle */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setLogsExpanded(!logsExpanded)}
              className="text-xs font-bold text-gray-700 hover:text-gray-900 flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Terminal className="w-3.5 h-3.5 text-[#635BFF]" />
              <span>Real-Time Compiler Logs ({build.logs?.length || 0} entries)</span>
              {logsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {logsExpanded && (
              <button
                onClick={handleCopyLogs}
                className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-1 font-semibold"
              >
                {copiedLogs ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Logs</span>
                  </>
                )}
              </button>
            )}
          </div>

          {logsExpanded && (
            <div className="mt-3 p-3.5 bg-[#0F172A] rounded-2xl font-mono text-[11px] text-gray-300 max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-700">
              {build.logs?.map((l, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-gray-500 select-none">[{l.timestamp}]</span>
                  <span
                    className={`font-bold ${
                      l.level === 'error'
                        ? 'text-rose-400'
                        : l.level === 'warn'
                        ? 'text-amber-400'
                        : l.level === 'success'
                        ? 'text-emerald-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {l.message}
                  </span>
                </div>
              ))}
              {isActive && (
                <div className="flex items-center gap-2 text-[#818cf8] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
                  <span>Streaming compiler output...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
