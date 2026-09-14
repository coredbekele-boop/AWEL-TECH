import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ToastNotification, ToastType, Build, BuildStatus } from '../types.ts';
import { api, getStoredToken } from '../lib/api.ts';

interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  notifyBuildSuccess: (
    build: {
      id: string;
      projectName?: string;
      buildType?: string;
      apkUrl?: string;
      aabUrl?: string;
      sourceZipUrl?: string;
    },
    onNavigate?: (view: string, id?: string) => void
  ) => string;
  notifyBuildError: (
    build: {
      id: string;
      projectName?: string;
      error?: string;
    },
    onRetry?: () => void,
    onNavigate?: (view: string, id?: string) => void
  ) => string;
  showToast: (message: string, type?: ToastType, title?: string) => string;
  trackBuild: (buildId: string) => void;
  simulateBuildToast: (type: 'success' | 'error') => void;
  setGlobalNavigate: (navigateFn: (view: string, id?: string) => void) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Web Audio API chime generator for pleasant auditory alerts
function playChime(type: 'success' | 'error') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    if (type === 'success') {
      // Pleasant upward two-tone harmonic chime (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6 harmonic
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.22);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    } else {
      // Gentle warning double-bump tone (F4 -> D4)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(349.23, now); // F4
      osc.frequency.setValueAtTime(293.66, now + 0.14); // D4

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch {
    // Audio contexts may be blocked by autoplay policies; fail silently
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('web2apk_toast_sound') !== 'false';
  });

  const globalNavigateRef = useRef<((view: string, id?: string) => void) | null>(null);
  const knownBuildStatuses = useRef<Map<string, BuildStatus>>(new Map());
  const notifiedBuilds = useRef<Set<string>>(new Set());
  const trackedBuildIds = useRef<Set<string>>(new Set());

  const setGlobalNavigate = useCallback((navigateFn: (view: string, id?: string) => void) => {
    globalNavigateRef.current = navigateFn;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (toastData: Omit<ToastNotification, 'id' | 'createdAt'>): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastNotification = {
        ...toastData,
        id,
        createdAt: Date.now(),
        duration: toastData.duration !== undefined ? toastData.duration : 7000,
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts

      if (soundEnabled && (newToast.type === 'success' || newToast.type === 'error')) {
        playChime(newToast.type);
      }

      return id;
    },
    [soundEnabled]
  );

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string): string => {
      const defaultTitles: Record<ToastType, string> = {
        success: 'Operation Successful',
        error: 'Error Occurred',
        warning: 'Attention Needed',
        info: 'Notification',
      };
      return addToast({
        type,
        title: title || defaultTitles[type],
        message,
        duration: 5000,
      });
    },
    [addToast]
  );

  const notifyBuildSuccess = useCallback(
    (
      build: {
        id: string;
        projectName?: string;
        buildType?: string;
        apkUrl?: string;
        aabUrl?: string;
        sourceZipUrl?: string;
      },
      onNavigate?: (view: string, id?: string) => void
    ): string => {
      const nav = onNavigate || globalNavigateRef.current;
      const bType = (build.buildType || 'apk').toUpperCase();
      const name = build.projectName || 'Android App';

      return addToast({
        type: 'success',
        title: `Build #${build.id} Succeeded`,
        message: `Your ${bType} package for "${name}" has finished compiling, signing, and is ready for download.`,
        buildId: build.id,
        projectName: name,
        buildType: (build.buildType as any) || 'apk',
        downloadUrl: build.apkUrl || `/api/builds/${build.id}/download?type=apk`,
        duration: 9000,
        action: {
          label: 'View Build Details',
          onClick: () => {
            if (nav) {
              nav('build-details', build.id);
            }
          },
          variant: 'primary',
        },
        secondaryAction: build.apkUrl
          ? {
              label: `Download ${bType}`,
              onClick: () => {
                const link = document.createElement('a');
                link.href = build.apkUrl!;
                link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-${bType.toLowerCase()}.apk`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              },
              variant: 'secondary',
            }
          : undefined,
      });
    },
    [addToast]
  );

  const notifyBuildError = useCallback(
    (
      build: {
        id: string;
        projectName?: string;
        error?: string;
      },
      onRetry?: () => void,
      onNavigate?: (view: string, id?: string) => void
    ): string => {
      const nav = onNavigate || globalNavigateRef.current;
      const name = build.projectName || 'Android App';
      const errorMsg =
        build.error ||
        'Gradle compilation encountered an unresolved reference or manifest merge failure.';

      return addToast({
        type: 'error',
        title: `Build #${build.id} Failed`,
        message: `Build compilation for "${name}" failed: ${errorMsg}`,
        buildId: build.id,
        projectName: name,
        errorDetails: errorMsg,
        duration: 10000,
        action: {
          label: 'Inspect Build Logs',
          onClick: () => {
            if (nav) {
              nav('build-details', build.id);
            }
          },
          variant: 'danger',
        },
        secondaryAction: onRetry
          ? {
              label: 'Retry Build Pipeline',
              onClick: onRetry,
              variant: 'secondary',
            }
          : undefined,
      });
    },
    [addToast]
  );

  const trackBuild = useCallback((buildId: string) => {
    trackedBuildIds.current.add(buildId);
    knownBuildStatuses.current.set(buildId, 'QUEUED');
  }, []);

  const simulateBuildToast = useCallback(
    (type: 'success' | 'error') => {
      const mockId = `bld_demo_${Math.random().toString(36).slice(2, 6)}`;
      if (type === 'success') {
        notifyBuildSuccess(
          {
            id: mockId,
            projectName: 'ShopPulse Boutique',
            buildType: 'apk',
            apkUrl: `/api/builds/${mockId}/download?type=apk`,
          },
          globalNavigateRef.current || undefined
        );
      } else {
        notifyBuildError(
          {
            id: mockId,
            projectName: 'ShopPulse Boutique',
            error: 'Task :app:compileReleaseKotlin failed (Unresolved WebView client symbol)',
          },
          () => {
            showToast('Simulated retry requested for build pipeline', 'info');
          },
          globalNavigateRef.current || undefined
        );
      }
    },
    [notifyBuildSuccess, notifyBuildError, showToast]
  );

  // Background Build Watcher Hook
  // Polls server for active builds and alerts the user automatically when any build reaches COMPLETED or FAILED
  useEffect(() => {
    let isMounted = true;

    const checkActiveBuilds = async () => {
      const token = getStoredToken();
      if (!token) return; // Only check if logged in

      try {
        const data = await api.getBuilds();
        if (!isMounted || !data.builds) return;

        data.builds.forEach((b: Build) => {
          const prevStatus = knownBuildStatuses.current.get(b.id);
          const transitionKey = `${b.id}:${b.status}`;

          // If we knew this build was in progress, or it was explicitly tracked
          const wasInProgress =
            prevStatus &&
            prevStatus !== 'COMPLETED' &&
            prevStatus !== 'FAILED';

          const isExplicitlyTracked = trackedBuildIds.current.has(b.id);

          if ((wasInProgress || isExplicitlyTracked) && !notifiedBuilds.current.has(transitionKey)) {
            if (b.status === 'COMPLETED') {
              notifiedBuilds.current.add(transitionKey);
              trackedBuildIds.current.delete(b.id);
              notifyBuildSuccess(b, globalNavigateRef.current || undefined);
            } else if (b.status === 'FAILED') {
              notifiedBuilds.current.add(transitionKey);
              trackedBuildIds.current.delete(b.id);
              notifyBuildError(
                b,
                () => {
                  api.retryBuild(b.id).catch((err) => {
                    showToast(err.message || 'Retry failed', 'error');
                  });
                },
                globalNavigateRef.current || undefined
              );
            }
          }

          // Always update current known status
          knownBuildStatuses.current.set(b.id, b.status);
        });
      } catch {
        // Silently skip if network interrupted
      }
    };

    // Run initial scan
    checkActiveBuilds();

    // Poll every 2.5s for real-time build notifications
    const interval = setInterval(checkActiveBuilds, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [notifyBuildSuccess, notifyBuildError, showToast]);

  const handleSetSoundEnabled = (val: boolean) => {
    setSoundEnabled(val);
    localStorage.setItem('web2apk_toast_sound', val ? 'true' : 'false');
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearAll,
        notifyBuildSuccess,
        notifyBuildError,
        showToast,
        trackBuild,
        simulateBuildToast,
        setGlobalNavigate,
        soundEnabled,
        setSoundEnabled: handleSetSoundEnabled,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
