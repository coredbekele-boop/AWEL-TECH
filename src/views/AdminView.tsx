import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Smartphone,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Terminal,
  Activity,
  Layers,
  Server,
  Lock,
  Radio,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import type { SystemStats, User, Project, Build } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export function AdminView({ onNavigate }: AdminViewProps) {
  const { user, showToast } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [buildsList, setBuildsList] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'projects' | 'queue' | 'worker'>('overview');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, projectsData, buildsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getProjects(),
        api.getBuilds(),
      ]);
      setStats(statsData.stats);
      setUsersList(usersData.users || []);
      setProjectsList(projectsData.projects || []);
      setBuildsList(buildsData.builds || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch admin telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Admin Access Required</h2>
        <p className="text-xs text-gray-500">
          You are currently signed in as a standard user. You can switch to the Administrator role using the top navigation toggle.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 font-bold text-[10px] rounded-full uppercase tracking-wider">
              Control Plane
            </span>
            <span className="text-xs text-gray-400">| System Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Web2APK Admin Console
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-px overflow-x-auto">
        {[
          { id: 'overview', label: 'System Overview', icon: Activity },
          { id: 'users', label: `Users (${usersList.length})`, icon: Users },
          { id: 'projects', label: `All Apps (${projectsList.length})`, icon: Smartphone },
          { id: 'queue', label: `Build Queue (${buildsList.length})`, icon: Cpu },
          { id: 'worker', label: 'Worker Architecture', icon: Server },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                active
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeSubTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Registered Users</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalUsers}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">Live SaaS accounts</span>
            </div>

            <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Android Projects</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalProjects}</p>
              <span className="text-[11px] text-indigo-600 font-semibold">Active apps configured</span>
            </div>

            <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Compilation Jobs</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalBuilds}</p>
              <span className="text-[11px] text-purple-600 font-semibold">{stats.activeBuilds} in progress</span>
            </div>

            <div className="p-5 bg-white border border-gray-200 rounded-3xl shadow-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Compiler Success Rate</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{stats.successRate}%</p>
              <span className="text-[11px] text-emerald-600 font-semibold">Gradle verification passed</span>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Worker Node Fleet Status</h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>2 Active Workers</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-gray-800">
                  <span>worker-primary-01</span>
                  <span className="text-emerald-600">IDLE / READY</span>
                </div>
                <p className="text-gray-500 text-[11px]">Android SDK 34, JDK 17, Gradle 8.4 runtime cached</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-gray-800">
                  <span>worker-secondary-02</span>
                  <span className="text-emerald-600">IDLE / READY</span>
                </div>
                <p className="text-gray-500 text-[11px]">Keystore signer v2/v3, AAB bundletool v1.15</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. USERS TAB */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Builds Used</th>
                  <th className="px-5 py-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <span className="font-bold text-gray-900 block">{u.name}</span>
                          <span className="text-gray-500 text-[11px]">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 capitalize">{u.plan}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {u.monthlyBuildsUsed} / {u.monthlyBuildsLimit}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ALL PROJECTS TAB */}
      {activeSubTab === 'projects' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">App Name</th>
                  <th className="px-5 py-3">Website</th>
                  <th className="px-5 py-3">Package ID</th>
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projectsList.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img src={p.iconUrl} alt={p.name} className="w-7 h-7 rounded-lg object-cover" />
                        <span className="font-bold text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 truncate max-w-[200px]">{p.websiteUrl}</td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-gray-500">{p.packageName}</td>
                    <td className="px-5 py-3.5 text-gray-600">v{p.versionName}</td>
                    <td className="px-5 py-3.5 text-gray-500">{p.userId}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onNavigate('app-details', p.id)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BUILD QUEUE TAB */}
      {activeSubTab === 'queue' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Job ID</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Progress</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {buildsList.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-mono text-gray-600">#{b.id}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">{b.projectName}</td>
                    <td className="px-5 py-3.5 uppercase font-bold text-[10px] text-gray-600">{b.buildType}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-gray-800">{b.status}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-[#635BFF]">{b.progress}%</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => onNavigate('build-details', b.id)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                      >
                        View Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. WORKER ARCHITECTURE TAB */}
      {activeSubTab === 'worker' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Build Worker Infrastructure Specification</h3>
            <p className="text-xs text-gray-500">
              Technical documentation explaining the containerized Gradle compiler worker pipeline.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 text-xs text-gray-700">
            <span className="font-bold text-gray-900 block">Production Worker Flow:</span>
            <ol className="list-decimal pl-5 space-y-1.5 text-gray-600">
              <li>Web client triggers build job request via <code className="font-mono text-[11px] text-purple-700">POST /api/builds</code>.</li>
              <li>Backend stores build job with status <code className="font-mono text-[11px] text-purple-700">QUEUED</code>.</li>
              <li>Worker daemon fetches task, provisions isolated directory at <code className="font-mono text-[11px] text-purple-700">/tmp/builds/{'{buildId}'}</code>.</li>
              <li>App template engine populates Kotlin source, Gradle scripts, and icons.</li>
              <li>Worker invokes <code className="font-mono text-[11px] text-purple-700">./gradlew assembleRelease</code> or <code className="font-mono text-[11px] text-purple-700">bundleRelease</code>.</li>
              <li>APK/AAB signed using Java Keystore (JKS) and zipalign tool.</li>
              <li>Result uploaded to object storage and download URL exposed to the user.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
