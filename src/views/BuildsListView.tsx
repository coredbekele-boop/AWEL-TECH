import React, { useState, useEffect } from 'react';
import {
  Package,
  Cpu,
  Download,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Terminal,
  Sparkles,
  Bug,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import type { Build } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface BuildsListViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export function BuildsListView({ onNavigate }: BuildsListViewProps) {
  const { showToast } = useAuth();
  const { trackBuild } = useToast();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [simulating, setSimulating] = useState(false);

  const loadBuilds = async () => {
    try {
      setLoading(true);
      const data = await api.getBuilds();
      setBuilds(data.builds || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch builds', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, []);

  const handleLaunchSimulatedBuild = async (shouldFail: boolean) => {
    try {
      setSimulating(true);
      showToast(
        shouldFail
          ? 'Initiated compiler test with simulated error condition...'
          : 'Initiated background compiler build job...',
        'info'
      );
      const res = await api.simulateTestBuild(shouldFail, 'apk');
      trackBuild(res.build.id);
      await loadBuilds();
    } catch (err: any) {
      showToast(err.message || 'Failed to start simulation', 'error');
    } finally {
      setSimulating(false);
    }
  };

  const filteredBuilds = builds.filter((b) => {
    const matchesSearch =
      b.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Android Build History</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time compiler jobs, Gradle logs, APK packages, and Play Store bundles.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleLaunchSimulatedBuild(false)}
            disabled={simulating}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Launch an async build that succeeds to test the success toast notification"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Test Success Build</span>
          </button>

          <button
            onClick={() => handleLaunchSimulatedBuild(true)}
            disabled={simulating}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Launch an async build that fails to test the error toast notification"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Test Failure Build</span>
          </button>

          <button
            onClick={loadBuilds}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-2xl shadow-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by app name or job ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'COMPLETED', 'BUILDING', 'FAILED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
          <RotateCw className="w-6 h-6 animate-spin text-[#635BFF] mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading build records...</p>
        </div>
      ) : filteredBuilds.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-800">No build jobs found</p>
          <p className="text-xs text-gray-500 mt-1">Start a build from your dashboard or app details page.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Job ID & App</th>
                  <th className="px-5 py-3.5">Target</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Progress</th>
                  <th className="px-5 py-3.5">Created At</th>
                  <th className="px-5 py-3.5 text-right">Artifacts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBuilds.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <button
                          onClick={() => onNavigate('build-details', b.id)}
                          className="font-bold text-gray-900 hover:text-[#635BFF] text-sm text-left block"
                        >
                          {b.projectName}
                        </button>
                        <span className="font-mono text-[10px] text-gray-400">#{b.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block uppercase font-bold text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-[#635BFF] border border-indigo-100">
                        {b.buildType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {b.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>COMPLETED</span>
                        </span>
                      ) : b.status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>FAILED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-indigo-600 font-bold">
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{b.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                          <span>{b.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${b.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-[#635BFF]'}`}
                            style={{ width: `${b.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate('build-details', b.id)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Logs
                        </button>
                        {b.status === 'COMPLETED' && (
                          <a
                            href={b.apkUrl}
                            download
                            className="p-1.5 bg-[#635BFF] hover:bg-[#5248E5] text-white rounded-lg shadow-xs transition-colors"
                            title="Download APK"
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
    </div>
  );
}
