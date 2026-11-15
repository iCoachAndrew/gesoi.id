import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Save, RotateCcw, Film, ExternalLink } from "lucide-react";
import { content as defaultContent, sharedDefaults } from "../i18n";
import { deepMerge } from "../lib/merge";
import { Field, label, authConfig } from "../lib/editorFields";
import { buildEducationVideoList } from "../lib/educationVideos";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

const toCleanEditorEducationItems = (cmsItems, galleryVideos, lang) => {
  return buildEducationVideoList(cmsItems || [], galleryVideos || [], lang).map((it) => ({
    title: it.title || "",
    category: it.category || "",
    speaker: it.speaker || "Karya GESOI",
    duration: it.duration || "",
    url: it.url || "",
    poster: it.poster || "",
    desc: it.desc || "",
  }));
};

const SECTIONS = [
  { key: "shared", label: "Pengaturan Situs & Tokoh (Global)" },
  { key: "seo", label: "SEO & Browser" },
  { key: "nav", label: "Navigasi" },
  { key: "hero", label: "Hero" },
  { key: "marquee", label: "Teks Berjalan" },
  { key: "problem", label: "01 · Urgensi" },
  { key: "ecosystem", label: "02 · Ekosistem" },
  { key: "pillars", label: "03 · Pilar Misi" },
  { key: "programs", label: "04 · Program" },
  { key: "education", label: "04B · Edukasi" },
  { key: "roadmap", label: "05 · Peta Jalan" },
  { key: "governance", label: "06 · Kepemimpinan" },
  { key: "news", label: "07 · Kabar / News" },
  { key: "video", label: "08 · Video" },
  { key: "publications", label: "09 · Publikasi Ilmiah" },
  { key: "join", label: "10 · Ajakan & Form" },
  { key: "privacy", label: "Privasi & Cookie" },
  { key: "footer", label: "Footer" },
];

export default function AdminEditor() {
  const [data, setData] = useState(null);
  const [langTab, setLangTab] = useState("id");
  const [section, setSection] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [syncingGallery, setSyncingGallery] = useState(false);

  const syncGalleryVideos = async () => {
    setSyncingGallery(true);
    try {
      const { data: res } = await axios.get(`${API}/admin/files`, authConfig());
      const list = Array.isArray(res) ? res : res.files || [];
      const vids = list
        .filter(
          (f) => (f.content_type || "").startsWith("video/") || /\.(mp4|webm|mov)$/i.test(f.storage_path || "")
        )
        .map((f) => ({ ...f, url: `${BACKEND_URL}${f.url || `/api/files/${f.storage_path}`}` }));
      if (vids.length === 0) {
        toast.info("Belum ada file video di Galeri Media.");
        return;
      }
      setData((prev) => ({
        ...prev,
        id: {
          ...prev.id,
          education: {
            ...prev.id.education,
            items: toCleanEditorEducationItems(prev.id?.education?.items, vids, "id"),
          },
        },
        en: {
          ...prev.en,
          education: {
            ...prev.en.education,
            items: toCleanEditorEducationItems(prev.en?.education?.items, vids, "en"),
          },
        },
      }));
      toast.success(
        `${vids.length} video telah disinkronkan & diurutkan (Introduction, 1-59). Klik Simpan Perubahan untuk menyimpan.`
      );
    } catch {
      toast.error("Gagal memuat video dari Galeri Media.");
    } finally {
      setSyncingGallery(false);
    }
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/content`).catch(() => ({ data: {} })),
      axios.get(`${API}/videos`).catch(() => ({ data: [] })),
    ]).then(([contentRes, videosRes]) => {
      const merged = deepMerge({ ...defaultContent, shared: sharedDefaults }, contentRes.data || {});
      const vids = Array.isArray(videosRes.data) ? videosRes.data : [];
      const idItems = toCleanEditorEducationItems(merged.id?.education?.items, vids, "id");
      const enItems = toCleanEditorEducationItems(merged.en?.education?.items, vids, "en");
      const nextData = {
        ...merged,
        id: { ...merged.id, education: { ...merged.id.education, items: idItems } },
        en: { ...merged.en, education: { ...merged.en.education, items: enItems } },
      };
      setData(nextData);
      // Otomatis simpan ke database CMS jika jumlah/urutan item di DB belum tersinkron dengan Galeri Media
      const rawIdItems = contentRes.data?.id?.education?.items || [];
      if (vids.length > 0 && JSON.stringify(rawIdItems) !== JSON.stringify(idItems)) {
        axios.put(`${API}/admin/content`, nextData, authConfig()).catch(() => {});
      }
    });
  }, []);

  if (!data) return <div className="p-10 text-[#4B5563]" data-testid="editor-loading">Memuat editor...</div>;

  const isShared = section === "shared";
  const scope = isShared ? data.shared : data[langTab][section];

  const setScope = (newVal) => {
    setData((prev) =>
      isShared
        ? { ...prev, shared: newVal }
        : { ...prev, [langTab]: { ...prev[langTab], [section]: newVal } }
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/content`, data, authConfig());
      toast.success("Perubahan tersimpan! Halaman utama sudah diperbarui.");
    } catch {
      toast.error("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const resetAll = async () => {
    if (!window.confirm("Kembalikan SEMUA konten website ke bawaan? Perubahan Anda akan hilang.")) return;
    try {
      await axios.delete(`${API}/admin/content`, authConfig());
      setData({ ...defaultContent, shared: sharedDefaults });
      toast.success("Konten dikembalikan ke bawaan.");
    } catch {
      toast.error("Gagal mereset.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8" data-testid="admin-editor">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif-display text-3xl text-[#0B1F3A]">Editor Website</h1>
          <p className="text-sm text-[#6B7280] font-light mt-1">Ubah teks, ikon, dan gambar setiap bagian, lalu klik Simpan.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={resetAll} data-testid="editor-reset-btn" className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#0B1F3A]/20 text-[#4B5563] text-xs uppercase tracking-wider hover:border-red-400 hover:text-red-500 transition-colors duration-200">
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={save} disabled={saving} data-testid="editor-save-btn" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 text-white text-xs uppercase tracking-wider font-semibold hover:bg-emerald-500 transition-colors duration-200 disabled:opacity-60">
            <Save size={14} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        <aside className="space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              data-testid={`editor-section-${s.key}`}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                section === s.key ? "bg-[#0B1F3A] text-white" : "text-[#4B5563] hover:bg-[#F1F1EC]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </aside>

        <div>
          {!isShared && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center rounded-full border border-[#0B1F3A]/15 overflow-hidden text-xs w-fit" data-testid="editor-lang-toggle">
                {["id", "en"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLangTab(l)}
                    data-testid={`editor-lang-${l}`}
                    className={`px-4 py-2 uppercase tracking-wider transition-colors duration-200 ${
                      langTab === l ? "bg-[#0B1F3A] text-white" : "text-[#4B5563]"
                    }`}
                  >
                    {l === "id" ? "Indonesia" : "English"}
                  </button>
                ))}
              </div>

              {section === "education" && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={syncGalleryVideos}
                    disabled={syncingGallery}
                    data-testid="education-sync-gallery-btn"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B1F3A] text-white text-xs font-medium hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-60"
                  >
                    <Film size={13} />
                    {syncingGallery ? "Memuat..." : "Muat Video dari Galeri Media"}
                  </button>
                  <a
                    href="/edukasi"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#0B1F3A]/15 text-xs text-[#0B1F3A] hover:border-emerald-500 hover:text-emerald-700 transition-colors duration-200"
                  >
                    Lihat Halaman /edukasi <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

          {section === "education" && (
            <div className="mb-5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 px-4 py-3 text-xs text-[#0B1F3A] leading-relaxed">
              <strong className="font-semibold text-emerald-800">Tips Halaman Edukasi (Shorts 9:16):</strong> Semua video yang diunggah ke{" "}
              <strong className="font-semibold">Galeri Media</strong> otomatis masuk ke daftar di bawah ini dengan urutan <strong className="font-semibold">GESOI Introduction</strong> diikuti nomor <strong className="font-semibold">1 hingga 59</strong> (Karya GESOI). Anda dapat langsung mengubah judul, kategori, atau deskripsi pada setiap item lalu menekan <strong className="font-semibold">Simpan Perubahan</strong>.
            </div>
          )}

          <div className="rounded-2xl border border-[#0B1F3A]/10 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
            {Array.isArray(scope) || typeof scope === "string" ? (
              <Field k={section} value={scope} path={section} onChange={setScope} />
            ) : (
              <div className="space-y-5">
                {Object.entries(scope).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs uppercase tracking-[0.15em] text-[#0B1F3A] font-medium mb-2">{label(k)}</p>
                    <Field k={k} value={v} path={`${section}-${k}`} onChange={(nv) => setScope({ ...scope, [k]: nv })} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
