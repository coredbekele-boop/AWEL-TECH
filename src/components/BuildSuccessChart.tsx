import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { Build } from '../types.ts';
import { CheckCircle2, Clock, AlertTriangle, Cpu, TrendingUp } from 'lucide-react';

interface BuildSuccessChartProps {
  builds: Build[];
}

export function BuildSuccessChart({ builds }: BuildSuccessChartProps) {
  const completedCount = builds.filter((b) => b.status === 'COMPLETED').length;
  const failedCount = builds.filter((b) => b.status === 'FAILED').length;
  const activeCount = builds.filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'FAILED'
  ).length;

  const totalBuilds = builds.length;
  const successRate =
    totalBuilds > 0 ? Math.round((completedCount / (completedCount + failedCount || 1)) * 100) : 100;

  const pieData = [
    { name: 'Completed', value: completedCount, color: '#10B981' },
    { name: 'Active / Queued', value: activeCount, color: '#635BFF' },
    { name: 'Failed', value: failedCount, color: '#EF4444' },
  ].filter((item) => item.value > 0);

  const barData = [
    { name: 'Completed', count: completedCount, fill: '#10B981' },
    { name: 'In Progress', count: activeCount, fill: '#635BFF' },
    { name: 'Failed', count: failedCount, fill: '#EF4444' },
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">APK Build Success & Pipeline Analytics</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {successRate}% Success Rate
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time status breakdown across all queued, building, and compiled Android packages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700">
            <Cpu className="w-3.5 h-3.5 text-[#635BFF]" />
            <span>Total Builds: {totalBuilds}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-gray-900">{completedCount}</span>
            <span className="text-xs font-semibold text-emerald-700 block">Completed APKs</span>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#635BFF] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-gray-900">{activeCount}</span>
            <span className="text-xs font-semibold text-[#635BFF] block">Queued / Building</span>
          </div>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-gray-900">{failedCount}</span>
            <span className="text-xs font-semibold text-rose-700 block">Failed Builds</span>
          </div>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Donut Chart */}
        <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 self-start">
            Build Status Distribution
          </span>
          <div className="w-full h-56">
            {totalBuilds === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No builds recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      borderColor: '#111827',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-600 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed ({completedCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#635BFF]"></span> Active ({activeCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Failed ({failedCount})
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200 flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Build Volume by Status
          </span>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4B5563' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#4B5563' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#111827',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <span className="text-[11px] text-gray-400 text-center mt-2">
            Updated live from container compilation engine
          </span>
        </div>
      </div>
    </div>
  );
}
