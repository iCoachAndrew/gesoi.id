import { useState, createElement } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Upload, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Film } from "lucide-react";
import { ICONS, parseIcon, SectionIcon } from "./icons";
import { CropModal } from "./CropUpload";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export const authConfig = () => ({
  withCredentials: true,
  headers: { Authorization: `Bearer ${localStorage.getItem("gesoi_token") || ""}` },
});

export const LABELS = {
  title: "Judul", body: "Deskripsi", kicker: "Label Kecil", desc: "Deskripsi",
  name: "Nama", role: "Peran", sub: "Subjudul", lines: "Baris Judul Hero",
  badge: "Badge", cta1: "Tombol Utama", cta2: "Tombol Kedua", scroll: "Teks Scroll",
  launch: "Badge Launching", items: "Daftar Item", steps: "Langkah-langkah",
  stats: "Statistik", value: "Angka", label: "Keterangan", nodes: "Kartu Ekosistem",
  icon: "Ikon", photo: "Foto", num: "Nomor", year: "Tahun",
  heroBg: "Gambar Latar Hero", programsImage: "Gambar Bagian Program",
  joinBg: "Gambar Latar Ajakan", people: "Tokoh & Pengurus",
  role_id: "Peran (Indonesia)", role_en: "Peran (English)", note: "Catatan",
  coopLabel: "Label Pilar Kerja Sama", cooperation: "Pilar Kerja Sama",
  paradigmOld: "Paradigma Lama", paradigmNew: "Paradigma Baru", shiftLabel: "Teks Transisi",
  interests: "Pilihan Minat", form: "Form Pendaftaran", tagline: "Tagline",
  address: "Alamat", contact: "Kontak", rights: "Hak Cipta", email: "Email",
  message: "Pesan", submit: "Tombol Kirim", sending: "Teks Mengirim",
  success: "Pesan Sukses", error: "Pesan Gagal", interest: "Label Minat",
  organization: "Organisasi", nav: "Navigasi", problem: "Urgensi",
  ecosystem: "Ekosistem", pillars: "Pilar", programs: "Program", education: "Edukasi",
  roadmap: "Peta Jalan", join: "Bergabung", news: "Kabar",
  category: "Kategori", link: "Tautan (opsional)", image: "Gambar",
  authors: "Penulis", price: "Harga", url: "URL Video (.mp4 / YouTube)",
  poster: "Gambar Poster Video (opsional)", quote: "Kutipan", author: "Nama Narasumber",
  speaker: "Pembicara / Kreator", duration: "Durasi (opsional, mis. 03:20)",
  ctaPageLabel: "Label Tombol Halaman Edukasi", searchPlaceholder: "Placeholder Pencarian",
  allCategoriesLabel: "Label Semua Topik", freeBadge: "Badge Gratis",
  nowPlayingLabel: "Label Sedang Diputar", upNextLabel: "Judul Daftar Putar",
  autoPlayLabel: "Label Lanjut Otomatis", watchNowLabel: "Label Putar Video",
  backHomeLabel: "Label Kembali ke Beranda", emptyFilterText: "Teks Saat Filter Kosong",
  watchLabel: "Label Tombol Tonton", buyLabel: "Label Tombol Beli",
  priceNote: "Keterangan Harga", modalTitle: "Judul Checkout",
  payLabel: "Label Tombol Bayar", cancelLabel: "Label Tombol Batal",
  prototypeNote: "Catatan Prototipe", banner: "Teks Banner Cookie",
  accept: "Tombol Terima", decline: "Tombol Tolak",
  policyLink: "Label Tautan Kebijakan", policyTitle: "Judul Kebijakan Privasi",
  policyText: "Teks Kebijakan Privasi", video: "Video", publications: "Publikasi",
  privacy: "Privasi", layout: "Tata Letak / Template", phone: "Telepon/WhatsApp",
  date: "Tanggal", backLabel: "Label Tombol Kembali", moreLabel: "Label Berita Lainnya",
  notFound: "Teks Berita Tidak Ditemukan", shareLabel: "Label Tombol Bagikan",
  registeredTitle: "Judul Sudah Terdaftar", registeredMsg: "Pesan Sudah Terdaftar ({date} = tanggal)",
  seo: "SEO & Browser", description: "Deskripsi Meta (Google)", favicon: "Ikon Tab Browser (Favicon)",
  ogImage: "Gambar Saat Link Dibagikan (OG)", logo: "Logo Website", theme: "Warna Tema",
  navy: "Warna Utama (Navy)", emerald: "Warna Aksen Hijau", gold: "Warna Aksen Emas",
  sections: "Susunan & Tampil Section", closing: "Salam Penutup", adminLabel: "Label Portal Admin",
  email: "Email Kontak",
};

export const label = (k) => LABELS[k] || k;

export const LAYOUT_OPTIONS = {
  ecosystem: [
    ["orbit", "Orbit (interaktif, GESOI di tengah)"],
    ["grid", "Grid Kartu (klasik)"],
  ],
  pillars: [
    ["list", "Baris Editorial (teks saja / thumbnail kecil)"],
    ["cards", "Grid Kartu dengan Gambar"],
  ],
  programs: [
    ["grid", "Kartu Ikon (klasik)"],
    ["media", "Kartu dengan Gambar (foto per program)"],
  ],
  roadmap: [
    ["timeline", "Garis Waktu (teks)"],
    ["photos", "Garis Waktu dengan Foto"],
  ],
};

const IMAGE_ITEM_PATHS = /^(pillars-items|programs-items|roadmap-items)/;
const ITEM_KEY_INJECTIONS = [
  [IMAGE_ITEM_PATHS, ["image"]],
  [/^news-items/, ["date", "body"]],
  [/^education-items/, ["title", "category", "speaker", "duration", "url", "poster", "desc"]],
];
const isLong = (k, v) => ["body", "desc", "sub", "note", "message", "quote", "banner", "policyText"].includes(k) || (typeof v === "string" && v.length > 90);
const isImage = (k) => /photo|image|bg|poster|logo|favicon/i.test(k);

export const inputCls =
  "w-full rounded-lg border border-[#0B1F3A]/15 bg-white px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors duration-200";

export const ImageField = ({ value, onChange, testId }) => {
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const pick = (e) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  };

  const doUpload = async (blob) => {
    setPendingFile(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, blob.name || "foto.jpg");
      const { data } = await axios.post(`${API}/admin/upload`, fd, authConfig());
      onChange(`${BACKEND_URL}${data.url}`);
      toast.success("Foto berhasil diunggah");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal mengunggah foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F1F1EC] border border-[#0B1F3A]/10 shrink-0 flex items-center justify-center">
        {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-[#9CA3AF]">Kosong</span>}
      </div>
      <div className="flex-1 space-y-2">
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="URL gambar" className={inputCls} data-testid={testId} />
        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1F3A] text-white text-xs cursor-pointer hover:bg-[#1B3A63] transition-colors duration-200">
          <Upload size={12} /> {uploading ? "Mengunggah..." : "Unggah Foto"}
          <input type="file" accept="image/*" className="hidden" onChange={pick} disabled={uploading} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="ml-2 text-xs text-red-500 hover:underline">Hapus</button>
        )}
      </div>
      {pendingFile && <CropModal file={pendingFile} onCancel={() => setPendingFile(null)} onUpload={doUpload} />}
    </div>
  );
};

const uploadFile = async (file, onDone, setUploading, accept) => {
  setUploading(true);
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axios.post(`${API}/admin/upload`, fd, authConfig());
    onDone(`${BACKEND_URL}${data.url}`);
    toast.success("Berhasil diunggah");
  } catch (err) {
    toast.error(err.response?.data?.detail || "Gagal mengunggah");
  } finally {
    setUploading(false);
  }
};

export const IconField = ({ value, onChange }) => {
  const { base, scale, isUrl } = parseIcon(value);
  const [uploading, setUploading] = useState(false);

  const write = (newBase, newScale) => {
    const s = Math.round(newScale * 100);
    onChange(s === 100 ? newBase : `${newBase}@${s}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-lg bg-[#0B1F3A] flex items-center justify-center shrink-0 overflow-hidden">
          <SectionIcon icon={value} size={20} className="text-[#D4AF37]" />
        </span>
        <select
          value={isUrl ? "__custom" : base}
          onChange={(e) => e.target.value !== "__custom" && write(e.target.value, scale)}
          className={inputCls}
        >
          {isUrl && <option value="__custom">Ikon kustom (unggahan)</option>}
          {Object.keys(ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#0B1F3A] text-white text-xs cursor-pointer hover:bg-[#1B3A63] transition-colors duration-200 whitespace-nowrap shrink-0">
          <Upload size={12} /> {uploading ? "..." : "Unggah Ikon"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f, (url) => write(url, scale), setUploading);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] uppercase tracking-wider text-[#6B7280] w-24 shrink-0">Ukuran: {Math.round(scale * 100)}%</span>
        <input
          type="range"
          min="50"
          max="200"
          step="5"
          value={Math.round(scale * 100)}
          onChange={(e) => write(base, parseInt(e.target.value, 10) / 100)}
          className="flex-1 accent-emerald-600"
        />
        {isUrl && (
          <button type="button" onClick={() => write("brain", 1)} className="text-xs text-red-500 hover:underline shrink-0">
            Hapus kustom
          </button>
        )}
      </div>
    </div>
  );
};

export const VideoField = ({ value, onChange, testId }) => {
  const [uploading, setUploading] = useState(false);
  const [galleryVideos, setGalleryVideos] = useState(null);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const openGalleryPicker = async () => {
    if (galleryVideos !== null) {
      setGalleryVideos(null);
      return;
    }
    setLoadingGallery(true);
    try {
      const { data } = await axios.get(`${API}/admin/files`, authConfig());
      const list = Array.isArray(data) ? data : data.files || [];
      const vids = list.filter(
        (f) => (f.content_type || "").startsWith("video/") || /\.(mp4|webm|mov)$/i.test(f.storage_path || "")
      );
      setGalleryVideos(vids);
    } catch {
      toast.error("Gagal memuat daftar video dari Galeri Media");
    } finally {
      setLoadingGallery(false);
    }
  };

  return (
    <div className="space-y-2">
      {value && !/youtube\.com|youtu\.be/i.test(value) && (
        <video src={value} muted className="w-48 rounded-lg border border-[#0B1F3A]/10 bg-black" preload="metadata" />
      )}
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="URL video (.mp4 / .webm / YouTube)" className={inputCls} data-testid={testId} />
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1F3A] text-white text-xs cursor-pointer hover:bg-[#1B3A63] transition-colors duration-200">
          <Upload size={12} /> {uploading ? "Mengunggah video..." : "Unggah Video (maks 200MB)"}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile(f, onChange, setUploading);
              e.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          onClick={openGalleryPicker}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#0B1F3A]/20 bg-white text-[#0B1F3A] text-xs hover:border-emerald-500 hover:text-emerald-700 transition-colors duration-200"
        >
          <Film size={12} /> {loadingGallery ? "Memuat..." : galleryVideos !== null ? "Tutup Galeri" : "Pilih dari Galeri Media"}
        </button>
      </div>
      {galleryVideos !== null && (
        <div className="rounded-lg border border-[#0B1F3A]/15 bg-white p-2.5 max-h-48 overflow-y-auto space-y-1">
          {galleryVideos.length === 0 ? (
            <p className="text-xs text-[#6B7280] py-2 text-center">Belum ada video di Galeri Media.</p>
          ) : (
            galleryVideos.map((v) => {
              const relUrl = v.url || `/api/files/${v.storage_path}`;
              const fullUrl = `${BACKEND_URL}${relUrl}`;
              const fileName = v.original_filename || v.original_name || v.storage_path;
              const active = value === fullUrl || value === relUrl;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    onChange(fullUrl);
                    setGalleryVideos(null);
                    toast.success(`Video "${fileName}" dipilih`);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between gap-2 transition-colors ${
                    active ? "bg-emerald-50 text-emerald-800 font-medium" : "hover:bg-[#F8FAFC] text-[#0B1F3A]"
                  }`}
                >
                  <span className="truncate">{fileName}</span>
                  <span className="text-[10px] text-[#9CA3AF] shrink-0">{((v.size || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// Note: recursive fields use createElement (not JSX) to avoid a babel plugin recursion bug
const subField = (props) => createElement(Field, props);

function ObjectField({ value, onChange, path }) {
  return (
    <div className="space-y-4 rounded-xl border border-[#0B1F3A]/10 p-4 bg-white">
      {Object.entries(value).map(([ck, cv]) => (
        <div key={ck}>
          <p className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-1">{label(ck)}</p>
          {subField({ k: ck, value: cv, path: `${path}-${ck}`, onChange: (nv) => onChange({ ...value, [ck]: nv }) })}
        </div>
      ))}
    </div>
  );
}

function ArrayField({ value, onChange, path }) {
  const withInjected = (item) => {
    if (typeof item !== "object" || item === null) return item;
    let out = item;
    for (const [re, keys] of ITEM_KEY_INJECTIONS) {
      if (re.test(path)) {
        for (const k of keys) if (!(k in out)) out = { ...out, [k]: "" };
      }
    }
    return out;
  };

  const addItem = () => {
    let template = value.length
      ? (typeof value[0] === "string" ? "" : Object.fromEntries(Object.keys(value[0]).map((key) => [key, ""])))
      : "";
    template = withInjected(template);
    onChange([...value, template]);
  };

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="rounded-xl border border-[#0B1F3A]/10 bg-[#F9F9F7] p-4 relative">
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="absolute top-3 right-3 text-red-400 hover:text-red-600"
            title="Hapus item"
            data-testid={`remove-${path}-${i}`}
          >
            <Trash2 size={14} />
          </button>
          {typeof item === "string" ? (
            <input
              value={item}
              onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
              className={`${inputCls} pr-8`}
            />
          ) : (
            <div className="space-y-3 pr-6">
              {Object.entries(withInjected(item)).map(([ck, cv]) => (
                <div key={ck}>
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-1">{label(ck)}</p>
                  {subField({
                    k: ck,
                    value: cv,
                    path: `${path}-${i}-${ck}`,
                    onChange: (nv) => onChange(value.map((v, j) => (j === i ? { ...v, [ck]: nv } : v))),
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={addItem} className="flex items-center gap-2 text-xs text-emerald-700 hover:text-emerald-900 font-medium" data-testid={`add-${path}`}>
        <Plus size={14} /> Tambah Item
      </button>
    </div>
  );
}

const SECTION_NAMES = {
  marquee: "Teks Berjalan", problem: "01 Urgensi", ecosystem: "02 Ekosistem",
  pillars: "03 Pilar Misi", programs: "04 Program", education: "04B Edukasi Publik",
  roadmap: "05 Peta Jalan", governance: "06 Kepemimpinan", news: "07 Kabar",
  video: "08 Video", publications: "09 Publikasi", join: "10 Ajakan & Form",
};

function SectionsField({ value, onChange }) {
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const arr = [...value];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };
  const toggle = (i) => onChange(value.map((s, idx) => (idx === i ? { ...s, visible: s.visible === false } : s)));
  return (
    <div className="space-y-2" data-testid="sections-order-field">
      <p className="text-[11px] text-[#9CA3AF] font-light">Atur urutan (panah) dan tampil/sembunyikan (mata) setiap bagian landing page. Hero selalu di atas.</p>
      {value.map((s, i) => {
        const hidden = s.visible === false;
        return (
          <div key={s.key} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${hidden ? "border-[#0B1F3A]/10 bg-[#F9F9F7] opacity-60" : "border-[#0B1F3A]/15 bg-white"}`} data-testid={`section-row-${s.key}`}>
            <span className="flex-1 text-sm text-[#0B1F3A]">{SECTION_NAMES[s.key] || s.key}</span>
            <button type="button" onClick={() => toggle(i)} data-testid={`section-toggle-${s.key}`} title={hidden ? "Tampilkan" : "Sembunyikan"} className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 ${hidden ? "text-[#9CA3AF] hover:text-[#0B1F3A]" : "text-emerald-600 hover:text-emerald-800"}`}>
              {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} data-testid={`section-up-${s.key}`} className="w-7 h-7 rounded-full flex items-center justify-center text-[#4B5563] hover:text-[#0B1F3A] disabled:opacity-25">
              <ArrowUp size={15} />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} data-testid={`section-down-${s.key}`} className="w-7 h-7 rounded-full flex items-center justify-center text-[#4B5563] hover:text-[#0B1F3A] disabled:opacity-25">
              <ArrowDown size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function Field({ k, value, onChange, path }) {
  if (path === "shared-sections" && Array.isArray(value)) {
    return createElement(SectionsField, { value, onChange });
  }
  if (typeof value === "string") {
    if (/^shared-theme-/.test(path)) {
      return (
        <div className="flex items-center gap-3">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded-lg border border-[#0B1F3A]/15 cursor-pointer p-0.5 bg-white" data-testid={`field-${path}`} />
          <input value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} max-w-[140px]`} data-testid={`field-${path}-hex`} />
        </div>
      );
    }
    if (isImage(k)) return <ImageField value={value} onChange={onChange} testId={`field-${path}`} />;
    if (k === "icon") return <IconField value={value} onChange={onChange} />;
    if (k === "url") return <VideoField value={value} onChange={onChange} testId={`field-${path}`} />;
    if (k === "layout") {
      const opts = LAYOUT_OPTIONS[path.split("-")[0]] || LAYOUT_OPTIONS.ecosystem;
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} data-testid={`field-${path}`}>
          {opts.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      );
    }
    if (isLong(k, value))
      return <textarea rows={k === "policyText" ? 12 : k === "body" ? 6 : 3} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} data-testid={`field-${path}`} />;
    return <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} data-testid={`field-${path}`} />;
  }
  if (Array.isArray(value)) return createElement(ArrayField, { value, onChange, path });
  if (typeof value === "object" && value !== null) return createElement(ObjectField, { value, onChange, path });
  return null;
}
