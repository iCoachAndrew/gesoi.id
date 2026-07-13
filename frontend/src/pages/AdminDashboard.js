import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, Mail, Building2, Download } from "lucide-react";
import AdminEditor from "./AdminEditor";
import AdminOrders from "./AdminOrders";
import AdminMedia from "./AdminMedia";
import AdminAnalytics from "./AdminAnalytics";
import AdminHelp from "./AdminHelp";
import { Toaster } from "sonner";

const LOGO = "https://customer-assets.emergentagent.com/job_social-impact-web-2/artifacts/e6k8en9x_image.png";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const interestLabels = {
  volunteer: { label: "Relawan", cls: "bg-emerald-100 text-emerald-800" },
  partner: { label: "Mitra", cls: "bg-blue-100 text-blue-800" },
  donor: { label: "Donatur", cls: "bg-amber-100 text-amber-800" },
  founder: { label: "Founding Circle", cls: "bg-purple-100 text-purple-800" },
};

const authConfig = () => ({
  withCredentials: true,
  headers: { Authorization: `Bearer ${localStorage.getItem("gesoi_token") || ""}` },
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState(null);
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("pendaftar");

  useEffect(() => {
    const load = async () => {
      try {
        await axios.get(`${API}/auth/me`, authConfig());
        const { data } = await axios.get(`${API}/admin/contacts`, authConfig());
        setContacts(data);
      } catch {
        navigate("/admin/login");
      }
    };
    load();
  }, [navigate]);

  const logout = async () => {
    try { await axios.post(`${API}/auth/logout`, {}, authConfig()); } catch {}
    localStorage.removeItem("gesoi_token");
    navigate("/admin/login");
  };

  if (!contacts) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center text-[#4B5563]" data-testid="admin-loading">
        Memuat...
      </div>
    );
  }

  const filtered = filter === "all" ? contacts : contacts.filter((c) => c.interest === filter);
  const counts = contacts.reduce((acc, c) => ({ ...acc, [c.interest]: (acc[c.interest] || 0) + 1 }), {});

  const exportCsv = () => {
    const rows = [
      ["Nama", "Email", "Organisasi", "Minat", "Pesan", "Tanggal"],
      ...filtered.map((c) => [
        c.name,
        c.email,
        c.organization || "",
        interestLabels[c.interest]?.label || c.interest,
        c.message || "",
        new Date(c.created_at).toLocaleString("id-ID"),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gesoi-pendaftar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="admin-dashboard">
      <header className="bg-[#0B1F3A] px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-white rounded-lg px-2.5 py-1.5 inline-flex items-center">
            <img src={LOGO} alt="GESOI" className="h-7 w-auto" />
          </span>
          <span className="text-white font-medium tracking-[0.2em] text-sm">ADMIN</span>
        </div>
        <button
          onClick={logout}
          data-testid="admin-logout-btn"
          className="flex items-center gap-2 text-white/70 hover:text-white text-xs uppercase tracking-[0.15em] transition-colors duration-300"
        >
          <LogOut size={14} /> Keluar
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 flex flex-wrap gap-2">
        {[["pendaftar", "Data Pendaftar"], ["pembelian", "Pembelian Publikasi"], ["analitik", "Analitik"], ["editor", "Editor Website"], ["media", "Galeri Media"], ["bantuan", "Bantuan"]].map(([key, lbl]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            data-testid={`admin-tab-${key}`}
            className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-colors duration-200 ${
              tab === key ? "bg-[#D4AF37] text-[#0B1F3A]" : "bg-white border border-[#0B1F3A]/15 text-[#4B5563] hover:border-[#0B1F3A]"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {tab === "editor" ? (
        <AdminEditor />
      ) : tab === "pembelian" ? (
        <AdminOrders />
      ) : tab === "media" ? (
        <AdminMedia />
      ) : tab === "analitik" ? (
        <AdminAnalytics />
      ) : tab === "bantuan" ? (
        <AdminHelp />
      ) : (
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <h1 className="font-serif-display text-4xl text-[#0B1F3A] mb-8" data-testid="admin-title">Data Pendaftar</h1>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="rounded-2xl bg-[#0B1F3A] p-6 text-white" data-testid="stat-total">
            <p className="font-serif-display text-4xl text-[#D4AF37]">{contacts.length}</p>
            <p className="text-xs text-white/60 mt-1 uppercase tracking-wider">Total Pendaftar</p>
          </div>
          {Object.entries(interestLabels).map(([key, v]) => (
            <div key={key} className="rounded-2xl bg-white border border-[#0B1F3A]/10 p-6" data-testid={`stat-${key}`}>
              <p className="font-serif-display text-4xl text-emerald-700">{counts[key] || 0}</p>
              <p className="text-xs text-[#4B5563] mt-1 uppercase tracking-wider">{v.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[["all", "Semua"], ...Object.entries(interestLabels).map(([k, v]) => [k, v.label])].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              data-testid={`filter-${key}`}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-colors duration-300 ${
                filter === key ? "bg-[#0B1F3A] border-[#0B1F3A] text-white" : "border-[#0B1F3A]/20 text-[#4B5563] hover:border-[#0B1F3A]"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={exportCsv}
            data-testid="export-csv-btn"
            className="ml-auto flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4AF37] text-[#0B1F3A] text-xs uppercase tracking-wider font-semibold hover:bg-[#e5c657] transition-colors duration-300"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-[#0B1F3A]/10 overflow-x-auto shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm" data-testid="contacts-table">
            <thead>
              <tr className="border-b border-[#0B1F3A]/10 text-left text-xs uppercase tracking-wider text-[#4B5563]">
                <th className="px-6 py-4 font-medium">Nama</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Organisasi</th>
                <th className="px-6 py-4 font-medium">Minat</th>
                <th className="px-6 py-4 font-medium">Pesan</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#9CA3AF]" data-testid="empty-state">Belum ada pendaftar.</td>
                </tr>
              )}
              {filtered.map((c) => {
                const badge = interestLabels[c.interest] || { label: c.interest, cls: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={c.id} className="border-b border-[#0B1F3A]/5 hover:bg-[#F9F9F7] transition-colors duration-200" data-testid={`contact-row-${c.id}`}>
                    <td className="px-6 py-4 font-medium text-[#0B1F3A]">{c.name}</td>
                    <td className="px-6 py-4 text-[#4B5563]"><span className="flex items-center gap-2"><Mail size={13} className="text-emerald-600" />{c.email}</span></td>
                    <td className="px-6 py-4 text-[#4B5563]">{c.organization ? <span className="flex items-center gap-2"><Building2 size={13} className="text-emerald-600" />{c.organization}</span> : "-"}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span></td>
                    <td className="px-6 py-4 text-[#4B5563] max-w-xs truncate">{c.message || "-"}</td>
                    <td className="px-6 py-4 text-[#9CA3AF] whitespace-nowrap">{new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      )}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
