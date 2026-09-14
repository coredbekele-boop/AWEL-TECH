import type {
  User,
  Project,
  Build,
  WebsiteAnalysis,
  AppNotification,
  SystemStats,
} from '../types.ts';

const TOKEN_KEY = 'web2apk_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({ error: 'Unexpected server response' }));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async loginWithGoogle(data: {
    email: string;
    name?: string;
    avatar?: string;
    idToken?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async switchRole(role: 'user' | 'admin'): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/api/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    setStoredToken(data.token);
    return data;
  },

  logout() {
    removeStoredToken();
  },

  // Analyzer
  async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    return request<WebsiteAnalysis>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  // Projects
  async getProjects(): Promise<{ projects: Project[] }> {
    return request<{ projects: Project[] }>('/api/projects');
  },

  async getProject(id: string): Promise<{ project: Project }> {
    return request<{ project: Project }>(`/api/projects/${id}`);
  },

  async createProject(projectData: Partial<Project>): Promise<{ project: Project }> {
    return request<{ project: Project }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<{ project: Project }> {
    return request<{ project: Project }>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async getProjectSourceFiles(id: string): Promise<{ packagePath: string; files: Record<string, string> }> {
    return request<{ packagePath: string; files: Record<string, string> }>(`/api/projects/${id}/source-files`);
  },

  // Builds
  async startBuild(
    projectId: string,
    buildType: 'apk' | 'aab' | 'bundle' = 'apk',
    simulateFailure: boolean = false
  ): Promise<{ build: Build }> {
    return request<{ build: Build }>(`/api/projects/${projectId}/build`, {
      method: 'POST',
      body: JSON.stringify({ buildType, simulateFailure }),
    });
  },

  async getBuilds(): Promise<{ builds: Build[] }> {
    return request<{ builds: Build[] }>('/api/builds');
  },

  async getBuild(id: string): Promise<{ build: Build }> {
    return request<{ build: Build }>(`/api/builds/${id}`);
  },

  async getBuildLogs(id: string): Promise<{ logs: any[]; status: string; progress: number }> {
    return request<{ logs: any[]; status: string; progress: number }>(`/api/builds/${id}/logs`);
  },

  async retryBuild(id: string): Promise<{ build: Build }> {
    return request<{ build: Build }>(`/api/builds/${id}/retry`, {
      method: 'POST',
    });
  },

  async failBuild(id: string, error?: string): Promise<{ build: Build }> {
    return request<{ build: Build }>(`/api/builds/${id}/fail`, {
      method: 'POST',
      body: JSON.stringify({ error }),
    });
  },

  async simulateTestBuild(shouldFail: boolean = false, buildType: 'apk' | 'aab' = 'apk'): Promise<{ build: Build }> {
    return request<{ build: Build }>('/api/builds/simulate-test', {
      method: 'POST',
      body: JSON.stringify({ shouldFail, buildType }),
    });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: AppNotification[] }> {
    return request<{ notifications: AppNotification[] }>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/notifications/mark-all-read', {
      method: 'POST',
    });
  },

  // Worker status
  async getWorkerStatus(): Promise<{
    status: string;
    mode: string;
    workerUrl: string | null;
    queueUrl: string | null;
    capabilities: string[];
    message: string;
  }> {
    return request('/api/worker/status');
  },

  // Admin
  async getAdminStats(): Promise<{ stats: SystemStats; auditLogs: any[] }> {
    return request<{ stats: SystemStats; auditLogs: any[] }>('/api/admin/stats');
  },

  async getAdminUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/api/admin/users');
  },

  async suspendUser(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/admin/users/${id}/suspend`, {
      method: 'POST',
    });
  },
};
