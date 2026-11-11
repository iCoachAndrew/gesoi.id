import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Copy, Trash2, Film, ImageIcon, Upload } from "lucide-react";
import { authConfig } from "../lib/editorFields";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function AdminMedia() {
  const [files, setFiles] = useState(null);
  const [filter, setFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  const fetchFiles = () => {
    axios.get(`${API}/admin/files`, authConfig()).then((r) => setFiles(r.data)).catch(() => setFiles([]));
  };

  useEffect(fetchFiles, []);

  const upload = async (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    setUploading(true);
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < list.length; i++) {
      setProgress(list.length > 1 ? `${i + 1}/${list.length}` : "");
      try {
        const fd = new FormData();
        fd.append("file", list[i]);
        await axios.post(`${API}/admin/upload`, fd, authConfig());
        ok++;
      } catch {
        fail++;
      }
    }
    setUploading(false);
    setProgress("");
    if (ok) toast.success(ok > 1 ? `${ok} file berhasil diunggah!` : "File berhasil diunggah!");
    if (fail) toast.error(`${fail} file gagal diunggah`);
    fetchFiles();
    e.target.value = "";
  };

  const copyUrl = (f) => {
    const url = `${BACKEND_URL}/api/files/${f.storage_path}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("URL disalin! Tempel di kolom gambar/video mana pun di Editor."),
      () => toast.info(url)
    );
  };

  const remove = async (f) => {
    if (!window.confirm(`Hapus "${f.original_filename}"? File tidak akan bisa diakses lagi oleh website.`)) return;
    try {
      await axios.delete(`${API}/admin/files/${f.id}`, authConfig());
      setFiles((prev) => prev.filter((x) => x.id !== f.id));
      toast.success("File dihapus");
    } catch {
      toast.error("Gagal menghapus file");
    }
  };

  if (!files) return <div className="p-10 text-[#4B5563]" data-testid="media-loading">Memuat...</div>;

  const isVideo = (f) => (f.content_type || "").startsWith("video");
  const filtered = files.filter((f) => (filter === "all" ? true : filter === "video" ? isVideo(f) : !isVideo(f)));

  return (
    <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10" data-testid="admin-media">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif-display text-4xl text-[#0B1F3A]">Galeri Media</h1>
          <p className="text-sm text-[#6B7280] font-light mt-1">
            Semua file yang pernah diunggah. Salin URL untuk dipakai ulang di Editor Website.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label
            data-testid="media-upload-btn"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs uppercase tracking-wider font-semibold hover:bg-emerald-500 transition-colors duration-200 cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}
          >
            <Upload size={14} /> {uploading ? `Mengunggah${progress ? ` ${progress}` : ""}...` : "Unggah File"}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={upload}
              disabled={uploading}
              data-testid="media-upload-input"
            />
          </label>
          <div className="flex gap-2">
            {[["all", "Semua"], ["image", "Gambar"], ["video", "Video"]].map(([key, lbl]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                data-testid={`media-filter-${key}`}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition-colors duration-200 ${
                  filter === key ? "bg-[#0B1F3A] border-[#0B1F3A] text-white" : "border-[#0B1F3A]/20 text-[#4B5563] hover:border-[#0B1F3A]"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#0B1F3A]/10 p-16 text-center text-[#9CA3AF]" data-testid="media-empty">
          Belum ada file. Klik tombol "Unggah File" di atas untuk menambahkan gambar atau video.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filtered.map((f) => (
            <div key={f.id} className="rounded-2xl bg-white border border-[#0B1F3A]/10 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.05)] group" data-testid={`media-card-${f.id}`}>
              <div className="h-36 bg-[#F1F1EC] flex items-center justify-center overflow-hidden relative">
                {isVideo(f) ? (
                  <>
                    <video src={`${BACKEND_URL}/api/files/${f.storage_path}`} muted preload="metadata" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#0B1F3A]/80 flex items-center justify-center">
                      <Film size={13} className="text-[#D4AF37]" />
                    </span>
                  </>
                ) : (
                  <img src={`${BACKEND_URL}/api/files/${f.storage_path}`} alt={f.original_filename} loading="lazy" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-[#0B1F3A] truncate" title={f.original_filename}>
                  {f.original_filename}
                </p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                  {fmtSize(f.size || 0)} · {new Date(f.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => copyUrl(f)}
                    data-testid={`media-copy-${f.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full bg-[#0B1F3A] text-white text-[10px] uppercase tracking-wider hover:bg-[#1B3A63] transition-colors duration-200"
                  >
                    <Copy size={11} /> Salin URL
                  </button>
                  <button
                    onClick={() => remove(f)}
                    data-testid={`media-delete-${f.id}`}
                    className="w-8 h-8 rounded-full border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors duration-200"
                    title="Hapus"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
