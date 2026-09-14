import React, { useState } from 'react';
import { Globe, ExternalLink, Camera, RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface WebsiteScreenshotThumbnailProps {
  websiteUrl: string;
  projectName: string;
}

export function WebsiteScreenshotThumbnail({ websiteUrl, projectName }: WebsiteScreenshotThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const cleanUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
  
  // Use public screenshot api or thum.io / microlink service with fallback
  const screenshotApiUrl = `https://image.thum.io/get/width/1000/crop/800/noanimate/${encodeURIComponent(cleanUrl)}`;
  const fallbackScreenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&embed=screenshot.url`;

  const [currentImgUrl, setCurrentImgUrl] = useState(screenshotApiUrl);

  const handleImageError = () => {
    if (currentImgUrl === screenshotApiUrl) {
      setCurrentImgUrl(fallbackScreenshotUrl);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#635BFF]/10 border border-[#635BFF]/20 flex items-center justify-center text-[#635BFF]">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <span>Website Thumbnail Snapshot</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                Live Capture
              </span>
            </h4>
            <p className="text-[11px] text-gray-500 truncate max-w-xs sm:max-w-md">
              Automated headless browser render of <span className="font-mono text-gray-700">{cleanUrl}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-200/70 p-1 rounded-xl text-xs font-semibold text-gray-700">
            <button
              onClick={() => setViewMode('desktop')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'desktop' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'mobile' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>
          </div>

          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition-colors shadow-xs flex items-center gap-1 text-xs font-bold"
            title="Open website in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Visit URL</span>
          </a>
        </div>
      </div>

      {/* Snapshot Preview Stage */}
      <div className="p-6 bg-slate-950 flex items-center justify-center min-h-[320px] relative overflow-hidden">
        {/* Decorative Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>

        {/* Browser Frame container */}
        <div
          className={`relative transition-all duration-300 ${
            viewMode === 'mobile'
              ? 'w-full max-w-[280px] rounded-[36px] p-3 bg-slate-900 border-4 border-slate-700 shadow-2xl'
              : 'w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden'
          }`}
        >
          {/* Browser Chrome Header */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>

            <div className="bg-slate-950 px-4 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 truncate max-w-[200px] sm:max-w-xs flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-[#635BFF]" />
              <span className="truncate">{cleanUrl}</span>
            </div>

            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">
              {viewMode} View
            </div>
          </div>

          {/* Screenshot Screen Area */}
          <div
            className={`relative bg-slate-900 overflow-hidden ${
              viewMode === 'mobile' ? 'h-[460px] rounded-[24px]' : 'h-[320px] sm:h-[380px]'
            }`}
          >
            {!isLoaded && !hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 gap-2.5 z-10">
                <RefreshCw className="w-6 h-6 animate-spin text-[#635BFF]" />
                <p className="text-xs font-semibold">Capturing high-res website snapshot...</p>
              </div>
            )}

            {hasError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-300 gap-3">
                <Globe className="w-10 h-10 text-[#635BFF]/50" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Live Screenshot Preview Unavailable</p>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Some target domains block external embedding or headless rendering. Your Web2APK wrapper will still load this URL perfectly in the native Android WebView!
                  </p>
                </div>
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#635BFF] hover:bg-[#5248E5] text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <span>Open Target Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <img
                src={currentImgUrl}
                alt={`${projectName} website screenshot`}
                onLoad={() => setIsLoaded(true)}
                onError={handleImageError}
                className={`w-full h-full object-cover object-top transition-opacity duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
