export type UserRole = 'user' | 'admin';
export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  plan: PlanType;
  createdAt: string;
  monthlyBuildsUsed: number;
  monthlyBuildsLimit: number;
  authProvider?: 'google' | 'email' | 'guest';
}

export type NavigationType = 'bottom' | 'top' | 'drawer' | 'website' | 'none';

export interface NavItem {
  id: string;
  label: string;
  url: string;
  icon: string;
  badge?: string;
  openExternal?: boolean;
}

export interface DeepLinkConfig {
  enabled: boolean;
  scheme: string; // e.g. "myapp" -> myapp://
  host: string; // e.g. "mysite.com"
  pathPrefixes: string[]; // e.g. ["/products", "/checkout"]
  autoVerify: boolean; // Android App Links auto-verify (assetlinks.json)
}

export interface AppPermissions {
  javascript: boolean;
  cookies: boolean;
  localStorage: boolean;
  pullToRefresh: boolean;
  fileUpload: boolean;
  camera: boolean;
  microphone: boolean;
  geolocation: boolean;
  notifications: boolean; // POST_NOTIFICATIONS (Android 13+)
  biometrics: boolean; // USE_BIOMETRIC
  bluetooth: boolean; // BLUETOOTH_CONNECT
  wakeLock: boolean; // WAKE_LOCK
  openExternalLinks: boolean;
  handleDownloads: boolean;
  openTelLinks: boolean;
  openMailtoLinks: boolean;
  deepLinks: boolean;
}

export type AppOrientation = 'portrait' | 'landscape' | 'auto';

export interface Project {
  id: string;
  userId: string;
  name: string;
  websiteUrl: string;
  packageName: string;
  description: string;
  iconUrl: string;
  splashUrl: string;
  primaryColor: string;
  secondaryColor: string;
  splashBgColor: string;
  statusBarColor: string;
  navBarColor: string;
  navigationType: NavigationType;
  navigationItems: NavItem[];
  permissions: AppPermissions;
  orientation: AppOrientation;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  keepScreenOn: boolean;
  status: 'draft' | 'ready' | 'building' | 'published';
  createdAt: string;
  updatedAt: string;
  latestBuildId?: string;
  latestBuildStatus?: BuildStatus;
  // Advanced customization options
  deepLinkConfig?: DeepLinkConfig;
  userAgentSuffix?: string;
  customCss?: string;
  customJs?: string;
  cacheMode?: 'LOAD_DEFAULT' | 'LOAD_CACHE_ELSE_NETWORK' | 'LOAD_NO_CACHE';
  hardwareAccelerated?: boolean;
  webGlEnabled?: boolean;
  autoIncrementVersion?: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionText: string;
  viewTarget: string;
}

export type BuildStatus =
  | 'QUEUED'
  | 'PREPARING'
  | 'GENERATING'
  | 'BUILDING'
  | 'SIGNING'
  | 'UPLOADING'
  | 'COMPLETED'
  | 'FAILED';

export interface BuildLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface Build {
  id: string;
  projectId: string;
  projectName: string;
  websiteUrl: string;
  userId: string;
  buildType: 'apk' | 'aab' | 'bundle';
  status: BuildStatus;
  progress: number;
  stepDescription: string;
  logs: BuildLogEntry[];
  apkUrl?: string;
  aabUrl?: string;
  sourceZipUrl?: string;
  fileSizeBytes?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface WebsiteAnalysis {
  url: string;
  reachable: boolean;
  title: string;
  description: string;
  favicon: string;
  themeColor: string;
  viewport: string;
  https: boolean;
  hasXFrameOptions: boolean;
  hasCspIframeRestriction: boolean;
  suggestedColors: string[];
  warnings: string[];
  responseTimeMs?: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  activeBuildWorkers: number;
  workerMode: 'demo_simulation' | 'external_worker';
  workerUrl?: string;
  queueDepth: number;
  storageUsedMb: number;
  uptimeSeconds: number;
  successRate?: number;
  activeBuilds?: number;
}

export type AdminStats = SystemStats;

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  buildId?: string;
  projectId?: string;
  projectName?: string;
  buildType?: 'apk' | 'aab' | 'bundle';
  action?: ToastAction;
  secondaryAction?: ToastAction;
  duration?: number; // Duration in ms, 0 means persist until dismissed
  createdAt: number;
  errorDetails?: string;
  downloadUrl?: string;
}

