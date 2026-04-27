"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/Spinner";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface StatsData {
  totalTracked: number;
  byStatus: { planToWatch: number; watching: number; watched: number };
  byType: { movies: number; tvShows: number };
  topGenres: { genre: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
  averageRating: number | null;
}

const STATUS_COLORS = ["#94a3b8", "#60a5fa", "#1e293b"];
const TYPE_COLORS = ["#1e293b", "#64748b"];

export default function StatsPage() {
  const { data: session } = authClient.useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: StatsData) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!stats || stats.totalTracked === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Your Stats</h1>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm">
          <p className="text-slate-500 text-sm">
            No data yet. Start tracking movies and TV shows to see your stats here.
          </p>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: "Plan to Watch", value: stats.byStatus.planToWatch },
    { name: "Watching", value: stats.byStatus.watching },
    { name: "Watched", value: stats.byStatus.watched },
  ].filter((d) => d.value > 0);

  const typeData = [
    { name: "Movies", value: stats.byType.movies },
    { name: "TV Shows", value: stats.byType.tvShows },
  ].filter((d) => d.value > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Your Stats</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Tracked" value={stats.totalTracked} />
        <StatCard label="Watched" value={stats.byStatus.watched} />
        <StatCard label="Movies" value={stats.byType.movies} />
        <StatCard label="TV Shows" value={stats.byType.tvShows} />
      </div>

      {/* Donut charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Status Breakdown">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, ""]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Movies vs TV Shows">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
              >
                {typeData.map((_, i) => (
                  <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, ""]} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bar charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {stats.topGenres.length > 0 && (
          <ChartCard title="Top Genres">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={stats.topGenres}
                layout="vertical"
                margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="genre"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  width={96}
                />
                <Tooltip cursor={{ fill: "#f1f5f9" }} />
                <Bar dataKey="count" fill="#1e293b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard title="Monthly Activity">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={stats.monthlyActivity}
              margin={{ left: -16, right: 8, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="count" fill="#1e293b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {stats.averageRating !== null && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Avg. Your Rating
          </span>
          <span className="text-2xl font-semibold text-slate-900">{stats.averageRating}</span>
          <span className="text-sm text-slate-400">/ 10</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}
