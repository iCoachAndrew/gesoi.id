import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Download, Phone, Mail } from "lucide-react";
import { authConfig } from "../lib/editorFields";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUS = {
  pending: { label: "Baru", cls: "bg-amber-100 text-amber-800" },
  contacted: { label: "Dihubungi", cls: "bg-blue-100 text-blue-800" },
  completed: { label: "Selesai", cls: "bg-emerald-100 text-emerald-800" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);

  const load = () => {
    axios.get(`${API}/admin/orders`, authConfig()).then((r) => setOrders(r.data)).catch(() => setOrders([]));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/admin/orders/${id}`, { status }, authConfig());
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success("Status diperbarui");
    } catch {
      toast.error("Gagal memperbarui status");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Publikasi", "Harga", "Nama", "Email", "Telepon", "Organisasi", "Status", "Tanggal"],
      ...orders.map((o) => [
        o.publication_title, o.price, o.name, o.email, o.phone, o.organization || "",
        STATUS[o.status]?.label || o.status,
        new Date(o.created_at).toLocaleString("id-ID"),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gesoi-pembelian-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!orders) return <div className="p-10 text-[#4B5563]" data-testid="orders-loading">Memuat...</div>;

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10" data-testid="admin-orders">
      <h1 className="font-serif-display text-4xl text-[#0B1F3A] mb-8">Pembelian Publikasi</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-[#0B1F3A] p-6 text-white" data-testid="orders-stat-total">
          <p className="font-serif-display text-4xl text-[#D4AF37]">{orders.length}</p>
          <p className="text-xs text-white/60 mt-1 uppercase tracking-wider">Total Pesanan</p>
        </div>
        {Object.entries(STATUS).map(([key, v]) => (
          <div key={key} className="rounded-2xl bg-white border border-[#0B1F3A]/10 p-6" data-testid={`orders-stat-${key}`}>
            <p className="font-serif-display text-4xl text-emerald-700">{orders.filter((o) => o.status === key).length}</p>
            <p className="text-xs text-[#4B5563] mt-1 uppercase tracking-wider">{v.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#4B5563]">
          {pendingCount > 0 ? `${pendingCount} pesanan baru menunggu tindak lanjut.` : "Tidak ada pesanan baru."}
        </p>
        <button
          onClick={exportCsv}
          data-testid="orders-export-csv-btn"
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#D4AF37] text-[#0B1F3A] text-xs uppercase tracking-wider font-semibold hover:bg-[#e5c657] transition-colors duration-300"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-[#0B1F3A]/10 overflow-x-auto shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
        <table className="w-full text-sm" data-testid="orders-table">
          <thead>
            <tr className="border-b border-[#0B1F3A]/10 text-left text-xs uppercase tracking-wider text-[#4B5563]">
              <th className="px-6 py-4 font-medium">Publikasi</th>
              <th className="px-6 py-4 font-medium">Pembeli</th>
              <th className="px-6 py-4 font-medium">Kontak</th>
              <th className="px-6 py-4 font-medium">Harga</th>
              <th className="px-6 py-4 font-medium">Tanggal</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-[#9CA3AF]" data-testid="orders-empty">Belum ada pesanan.</td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[#0B1F3A]/5 hover:bg-[#F9F9F7] transition-colors duration-200" data-testid={`order-row-${o.id}`}>
                <td className="px-6 py-4 font-medium text-[#0B1F3A] max-w-xs">{o.publication_title}</td>
                <td className="px-6 py-4 text-[#4B5563]">
                  {o.name}
                  {o.organization && <span className="block text-xs text-[#9CA3AF]">{o.organization}</span>}
                </td>
                <td className="px-6 py-4 text-[#4B5563]">
                  <span className="flex items-center gap-1.5 text-xs"><Mail size={12} className="text-emerald-600" />{o.email}</span>
                  <span className="flex items-center gap-1.5 text-xs mt-1"><Phone size={12} className="text-emerald-600" />{o.phone}</span>
                </td>
                <td className="px-6 py-4 text-[#0B1F3A] whitespace-nowrap">{o.price}</td>
                <td className="px-6 py-4 text-[#9CA3AF] whitespace-nowrap">{new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-6 py-4">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    data-testid={`order-status-${o.id}`}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border-0 cursor-pointer ${STATUS[o.status]?.cls || ""}`}
                  >
                    {Object.entries(STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
