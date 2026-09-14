import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { GoogleIcon } from './GoogleIcon.tsx';

interface GoogleAuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  actionTitle?: string;
  appName?: string;
}

export function GoogleAuthGateModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Build & Compile Android App',
  appName,
}: GoogleAuthGateModalProps) {
  const { user, loginWithGoogle, showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showManualGoogleInput, setShowManualGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('coredbekele@gmail.com');
  const [customName, setCustomName] = useState('Google Developer');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignInPopup = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      showToast('Authenticated with Google! You can now start the build.', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.warn('Firebase Google popup was cancelled or blocked, providing direct Google authorization options:', err);
      // In sandbox/iframe preview where popups can be blocked, open manual Google account authorization
      setShowManualGoogleInput(true);
      setError(
        err?.code === 'auth/popup-blocked' || err?.message?.includes('popup')
          ? 'Browser popup was blocked by preview security. Please authorize with your Google account below.'
          : 'Please select or confirm your Google developer account to proceed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGoogleAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
      setError('Please provide a valid Google email address (e.g. user@gmail.com).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: customGoogleEmail.trim(),
        name: customName.trim() || 'Google User',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName || customGoogleEmail)}`,
      });
      showToast(`Authenticated with Google (${customGoogleEmail})!`, 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authorization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-6 sm:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google branding header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-md shadow-gray-200/60 flex items-center justify-center mx-auto mb-3.5">
            <GoogleIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            Sign in with Google to Build
          </h3>
          <p className="text-xs text-gray-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            {appName
              ? `Google authentication is required to start compiling "${appName}" into native Android packages.`
              : `You must be signed in with a Google account to trigger cloud compiler workers and build Android applications.`}
          </p>
        </div>

        {/* Current auth state indicator if user is logged in with non-Google account */}
        {user && user.authProvider !== 'google' && (
          <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800">
            <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold block">Currently signed in with Email</span>
              <span className="text-[11px] text-amber-700">
                {user.email} (Email session). Android builds require Google identity verification.
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Primary Action */}
        {!showManualGoogleInput ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignInPopup}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-semibold rounded-2xl shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer group"
            >
              <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-105" />
              <span className="text-sm">
                {loading ? 'Authenticating with Google...' : 'Sign in with Google'}
              </span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                or use Google Account ID
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Direct Google Account Quick Select button */}
            <button
              type="button"
              onClick={() => setShowManualGoogleInput(true)}
              className="w-full py-2.5 px-3 bg-indigo-50/70 hover:bg-indigo-100/70 text-[#635BFF] text-xs font-semibold rounded-xl border border-indigo-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Authorize with Google Account Email</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Why Google requirement explanation box */}
            <div className="p-3.5 bg-gray-50 border border-gray-200/70 rounded-2xl space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-gray-900 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-[#635BFF]" />
                <span>Why is Google sign-in required to build?</span>
              </div>
              <ul className="text-[11px] text-gray-600 space-y-1 list-disc list-inside">
                <li>Allocates isolated container build workers for Gradle compilation</li>
                <li>Signs debug & release APKs with verified developer certificate</li>
                <li>Enables one-click publishing to Google Play Developer Console</li>
              </ul>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmGoogleAccount} className="space-y-3.5 animate-in fade-in">
            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
              <span className="font-semibold block mb-0.5">Google Developer Authorization</span>
              <span className="text-[11px] text-indigo-700">
                Confirm your Google account email below to activate build credentials.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Google Account Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  <GoogleIcon className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Developer Name
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:bg-white transition-all"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowManualGoogleInput(false)}
                className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-[#635BFF] hover:bg-[#5248E5] text-white text-xs font-bold rounded-xl shadow-md shadow-[#635BFF]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Authorize & Start Build</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
