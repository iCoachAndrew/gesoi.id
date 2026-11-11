import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Users, MousePointerClick, Send, ShoppingCart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { authConfig } from "../lib/editorFields";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

const RANGES = [["7", "7 Hari"], ["30", "30 Hari"], ["90", "90 Hari"]];

const StatCard = ({ icon: Icon, value, label, dark, testId }) => (
  <div
    className={`rounded-2xl p-6 ${dark ? "bg-[#0B1F3A] text-white" : "bg-white border border-[#0B1F3A]/10"}`}
    data-testid={testId}
  >
    <Icon size={16} className={dark ? "text-[#D4AF37]" : "text-emerald-600"} />
    <p className={`font-serif-display text-4xl mt-3 ${dark ? "text-[#D4AF37]" : "text-emerald-700"}`}>{value}</p>
    <p className={`text-xs mt-1 uppercase tracking-wider ${dark ? "text-white/60" : "text-[#4B5563]"}`}>{label}</p>
  </div>
);

const SplitBar = ({ label, value, total, color }) => {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="uppercase tracking-wider text-[#4B5563]">{label}</span>
        <span className="text-[#0B1F3A] font-medium">{value} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-[#F1F1EC] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Panel = ({ title, children, testId }) => (
  <div className="rounded-2xl bg-white border border-[#0B1F3A]/10 p-6" data-testid={testId}>
    <p className="text-xs uppercase tracking-[0.2em] text-[#0B1F3A] font-medium mb-5">{title}</p>
    {children}
  </div>
);

export default function AdminAnalytics() {
  const [days, setDays] = useState("30");
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    axios.get(`${API}/admin/analytics?days=${days}`, authConfig()).then((r) => setData(r.data)).catch(() => setData(null));
  }, [days]);

  if (!data) return <div className="p-10 text-[#4B5563]" data-testid="analytics-loading">Memuat analitik...</div>;

  const { totals, daily, devices, langs, referrers, events } = data;
  const deviceTotal = (devices.mobile || 0) + (devices.desktop || 0);
  const langTotal = (langs.id || 0) + (langs.en || 0);
  const chartData = daily.map((d) => ({ ...d, label: d.date.slice(5) }));

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10" data-testid="admin-analytics">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif-display text-4xl text-[#0B1F3A]">Analitik Pengunjung</h1>
          <p className="text-sm text-[#6B7280] font-light mt-1">
            Data internal, privasi terjaga. Hanya pengunjung yang menerima cookie yang terekam.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map(([key, lbl]) => (
            <button
              key={key}
              onClick={() => setDays(key)}
              data-testid={`analytics-range-${key}`}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-colors duration-200 ${
                days === key ? "bg-[#0B1F3A] border-[#0B1F3A] text-white" : "border-[#0B1F3A]/20 text-[#4B5563] hover:border-[#0B1F3A]"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Eye} value={totals.views} label="Total Kunjungan" dark testId="analytics-stat-views" />
        <StatCard icon={Users} value={totals.uniques} label="Pengunjung Unik" testId="analytics-stat-uniques" />
        <StatCard icon={MousePointerClick} value={events.join_click || 0} label="Klik Bergabung" testId="analytics-stat-join" />
        <StatCard icon={Send} value={events.form_submit || 0} label="Form Terkirim" testId="analytics-stat-form" />
        <StatCard icon={ShoppingCart} value={events.buy_click || 0} label="Klik Beli Akses" testId="analytics-stat-buy" />
      </div>

      <div className="rounded-2xl bg-white border border-[#0B1F3A]/10 p-6 mb-8" data-testid="analytics-chart">
        <p className="text-xs uppercase tracking-[0.2em] text-[#0B1F3A] font-medium mb-5">Tren Kunjungan Harian</p>
        {totals.views === 0 ? (
          <p className="py-12 text-center text-[#9CA3AF] text-sm" data-testid="analytics-empty">
            Belum ada data. Data mulai terekam saat pengunjung membuka website dan menerima cookie.
          </p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B1F3A" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0B1F3A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gUniques" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0B1F3A10" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(v, n) => [v, n === "views" ? "Kunjungan" : "Pengunjung Unik"]}
                  labelFormatter={(l) => `Tanggal: ${l}`}
                  contentStyle={{ borderRadius: 12, border: "1px solid #0B1F3A20", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="views" stroke="#0B1F3A" strokeWidth={2} fill="url(#gViews)" />
                <Area type="monotone" dataKey="uniques" stroke="#D4AF37" strokeWidth={2} fill="url(#gUniques)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Panel title="Perangkat" testId="analytics-devices">
          {deviceTotal === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Belum ada data.</p>
          ) : (
            <>
              <SplitBar label="Desktop" value={devices.desktop || 0} total={deviceTotal} color="bg-[#0B1F3A]" />
              <SplitBar label="Mobile" value={devices.mobile || 0} total={deviceTotal} color="bg-emerald-500" />
            </>
          )}
        </Panel>
        <Panel title="Bahasa Pengunjung" testId="analytics-langs">
          {langTotal === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Belum ada data.</p>
          ) : (
            <>
              <SplitBar label="Indonesia" value={langs.id || 0} total={langTotal} color="bg-[#D4AF37]" />
              <SplitBar label="English" value={langs.en || 0} total={langTotal} color="bg-[#1B3A63]" />
            </>
          )}
        </Panel>
        <Panel title="Sumber Kunjungan" testId="analytics-referrers">
          {referrers.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">Belum ada data.</p>
          ) : (
            <div className="space-y-3">
              {referrers.map((r) => (
                <div key={r.source} className="flex items-center justify-between text-sm">
                  <span className="text-[#4B5563] truncate mr-3">{r.source === "direct" ? "Langsung / tautan" : r.source}</span>
                  <span className="font-medium text-[#0B1F3A] shrink-0">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </main>
  );
}
