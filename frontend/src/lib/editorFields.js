import { useState, createElement } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Upload, Plus, Trash2 } from "lucide-react";
import { ICONS, parseIcon, SectionIcon } from "./icons";
import { CropModal } from "./CropUpload";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
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
  ecosystem: "Ekosistem", pillars: "Pilar", programs: "Program",
  roadmap: "Peta Jalan", join: "Bergabung", news: "Kabar",
  category: "Kategori", link: "Tautan (opsional)", image: "Gambar",
  authors: "Penulis", price: "Harga", url: "URL Video (.mp4)",
  poster: "Gambar Poster Video", quote: "Kutipan", author: "Nama Narasumber",
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
];
const isLong = (k, v) => ["body", "desc", "sub", "note", "message", "quote", "banner", "policyText"].includes(k) || (typeof v === "string" && v.length > 90);
const isImage = (k) => /photo|image|bg|poster/i.test(k);

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

  return (
    <div className="space-y-2">
      {value && (
        <video src={value} muted className="w-48 rounded-lg border border-[#0B1F3A]/10 bg-black" preload="metadata" />
      )}
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="URL video (.mp4 / .webm)" className={inputCls} data-testid={testId} />
      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1F3A] text-white text-xs cursor-pointer hover:bg-[#1B3A63] transition-colors duration-200">
        <Upload size={12} /> {uploading ? "Mengunggah video..." : "Unggah Video (maks 60MB)"}
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

export function Field({ k, value, onChange, path }) {
  if (typeof value === "string") {
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
