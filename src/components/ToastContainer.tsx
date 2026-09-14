import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
  Download,
  RotateCw,
  Terminal,
  Volume2,
  VolumeX,
  Package,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.tsx';
import type { ToastNotification } from '../types.ts';

interface ToastItemProps {
  key?: React.Key;
  toast: ToastNotification;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration || 7000);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const duration = toast.duration;
    const intervalMs = 50;

    const updateProgress = () => {
      if (isPaused) return;

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (remaining / duration) * 100;
      setProgress(pct);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        onDismiss(toast.id);
      }
    };

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(updateProgress, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [toast.id, toast.duration, isPaused, onDismiss]);

  const handleMouseEnter = () => {
    if (!toast.duration || toast.duration <= 0) return;
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (!toast.duration || toast.duration <= 0) return;
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  // Border & Accent Styling per Toast Type
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  const isInfo = toast.type === 'info';

  const borderColor = isSuccess
    ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
    : isError
    ? 'border-rose-500/50 ring-1 ring-rose-500/20'
    : isWarning
    ? 'border-amber-500/40 ring-1 ring-amber-500/20'
    : 'border-[#635BFF]/40 ring-1 ring-[#635BFF]/20';

  const progressBg = isSuccess
    ? 'bg-emerald-400'
    : isError
    ? 'bg-rose-400'
    : isWarning
    ? 'bg-amber-400'
    : 'bg-[#635BFF]';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl bg-[#0F172A] text-white shadow-2xl border ${borderColor} backdrop-blur-md transition-shadow hover:shadow-emerald-950/20`}
    >
      {/* Glow highlight */}
      <div
        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none ${
          isSuccess ? 'bg-emerald-400' : isError ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-[#635BFF]'
        }`}
      />

      <div className="p-4 sm:p-4.5 space-y-3">
        {/* Header Row: Icon + Type Badge + Title + Close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Status Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isError
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : isWarning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-[#635BFF]/20 text-[#818CF8] border border-[#635BFF]/30'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5" />}
              {isError && <AlertCircle className="w-5 h-5" />}
              {isWarning && <AlertTriangle className="w-5 h-5" />}
              {isInfo && <Info className="w-5 h-5" />}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isSuccess
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isError
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-[#635BFF]/10 text-[#818CF8] border-[#635BFF]/30'
                  }`}
                >
                  {isSuccess
                    ? toast.buildType
                      ? `${toast.buildType.toUpperCase()} READY`
                      : 'BUILD SUCCESS'
                    : isError
                    ? 'BUILD ERROR'
                    : isWarning
                    ? 'WARNING'
                    : 'UPDATE'}
                </span>

                {toast.projectName && (
                  <span className="text-[11px] font-semibold text-slate-400 truncate max-w-[170px]">
                    {toast.projectName}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                {toast.title}
              </h4>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        {toast.message && (
          <p className="text-xs text-slate-300 leading-relaxed font-normal pl-12">
            {toast.message}
          </p>
        )}

        {/* Optional Error Details Monospace Block */}
        {toast.errorDetails && (
          <div className="ml-12 p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-xl font-mono text-[11px] text-rose-300 overflow-x-auto">
            <code>{toast.errorDetails}</code>
          </div>
        )}

        {/* Action Buttons Row */}
        {(toast.action || toast.secondaryAction) && (
          <div className="flex items-center gap-2 pl-12 pt-1 flex-wrap">
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  toast.action.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : isSuccess
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold'
                    : 'bg-[#635BFF] hover:bg-[#5248E5] text-white'
                }`}
              >
                {isSuccess ? (
                  <Package className="w-3.5 h-3.5" />
                ) : isError ? (
                  <Terminal className="w-3.5 h-3.5" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                <span>{toast.action.label}</span>
              </button>
            )}

            {toast.secondaryAction && (
              <button
                onClick={() => {
                  toast.secondaryAction?.onClick();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {toast.type === 'error' ? (
                  <RotateCw className="w-3.5 h-3.5" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{toast.secondaryAction.label}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress countdown indicator line */}
      {toast.duration && toast.duration > 0 && (
        <div className="w-full bg-slate-800/60 h-1">
          <div
            className={`h-full transition-all duration-75 ease-linear ${progressBg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast, clearAll, soundEnabled, setSoundEnabled } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-3 sm:px-0 pointer-events-none"
    >
      {/* Toast Tray Control Header (when multiple toasts) */}
      {toasts.length > 1 && (
        <div className="pointer-events-auto flex items-center justify-between px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-[11px] text-slate-300 shadow-md">
          <span className="font-semibold text-slate-400">
            {toasts.length} notifications active
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute alert chimes' : 'Enable alert chimes'}
              className="p-1 hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button
              onClick={clearAll}
              className="text-[11px] text-slate-400 hover:text-white font-medium hover:underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
