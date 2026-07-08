import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Brain, LogOut, Users, Mail, Building2 } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#F9F9F7]" data-testid="admin-dashboard">
      <header className="bg-[#0A2E20] px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
            <Brain size={16} className="text-emerald-300" />
          </span>
          <span className="text-white font-medium tracking-[0.2em] text-sm">GESOI ADMIN</span>
        </div>
        <button
          onClick={logout}
          data-testid="admin-logout-btn"
          className="flex items-center gap-2 text-white/70 hover:text-white text-xs uppercase tracking-[0.15em] transition-colors duration-300"
        >
          <LogOut size={14} /> Keluar
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <h1 className="font-serif-display text-4xl text-[#0A2E20] mb-8" data-testid="admin-title">Data Pendaftar</h1>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="rounded-2xl bg-[#0A2E20] p-6 text-white" data-testid="stat-total">
            <p className="font-serif-display text-4xl text-[#D4AF37]">{contacts.length}</p>
            <p className="text-xs text-white/60 mt-1 uppercase tracking-wider">Total Pendaftar</p>
          </div>
          {Object.entries(interestLabels).map(([key, v]) => (
            <div key={key} className="rounded-2xl bg-white border border-[#0A2E20]/10 p-6" data-testid={`stat-${key}`}>
              <p className="font-serif-display text-4xl text-emerald-700">{counts[key] || 0}</p>
              <p className="text-xs text-[#4B5563] mt-1 uppercase tracking-wider">{v.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[["all", "Semua"], ...Object.entries(interestLabels).map(([k, v]) => [k, v.label])].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              data-testid={`filter-${key}`}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-colors duration-300 ${
                filter === key ? "bg-[#0A2E20] border-[#0A2E20] text-white" : "border-[#0A2E20]/20 text-[#4B5563] hover:border-[#0A2E20]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-white border border-[#0A2E20]/10 overflow-x-auto shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
          <table className="w-full text-sm" data-testid="contacts-table">
            <thead>
              <tr className="border-b border-[#0A2E20]/10 text-left text-xs uppercase tracking-wider text-[#4B5563]">
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
                  <tr key={c.id} className="border-b border-[#0A2E20]/5 hover:bg-[#F9F9F7] transition-colors duration-200" data-testid={`contact-row-${c.id}`}>
                    <td className="px-6 py-4 font-medium text-[#0A2E20]">{c.name}</td>
                    <td className="px-6 py-4 text-[#4B5563]"><span className="flex items-center gap-2"><Mail size={13} className="text-emerald-600" />{c.email}</span></td>
                    <td className="px-6 py-4 text-[#4B5563]">{c.organization ? <span className="flex items-center gap-2"><Building2 size={13} className="text-emerald-600" />{c.organization}</span> : "—"}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span></td>
                    <td className="px-6 py-4 text-[#4B5563] max-w-xs truncate">{c.message || "—"}</td>
                    <td className="px-6 py-4 text-[#9CA3AF] whitespace-nowrap">{new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
