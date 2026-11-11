import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Save, RotateCcw } from "lucide-react";
import { content as defaultContent, sharedDefaults } from "../i18n";
import { deepMerge } from "../lib/merge";
import { Field, label, authConfig } from "../lib/editorFields";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

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

  useEffect(() => {
    axios
      .get(`${API}/content`)
      .then((r) => setData(deepMerge({ ...defaultContent, shared: sharedDefaults }, r.data || {})))
      .catch(() => setData({ ...defaultContent, shared: sharedDefaults }));
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
            <div className="flex items-center rounded-full border border-[#0B1F3A]/15 overflow-hidden text-xs w-fit mb-6" data-testid="editor-lang-toggle">
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
