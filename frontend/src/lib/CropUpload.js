import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

const ASPECTS = [
  ["1:1", 1],
  ["4:3", 4 / 3],
  ["3:4", 3 / 4],
  ["16:9", 16 / 9],
];

const CHECKER =
  "repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%) 0 0 / 20px 20px";

const hasAlpha = (file) => ["image/png", "image/webp", "image/gif"].includes(file.type);

const cropToBlob = (imageSrc, area, { bg, mime }) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(area.width);
      canvas.height = Math.round(area.height);
      const ctx = canvas.getContext("2d");
      if (bg !== "transparent") {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("crop gagal"))), mime, mime === "image/jpeg" ? 0.9 : undefined);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });

export const CropModal = ({ file, onCancel, onUpload }) => {
  const alpha = hasAlpha(file);
  const [src] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1);
  const [area, setArea] = useState(null);
  const [busy, setBusy] = useState(false);
  const [bg, setBg] = useState(alpha ? "transparent" : "#ffffff");

  const onComplete = useCallback((_, px) => setArea(px), []);

  const finish = async (blob) => {
    URL.revokeObjectURL(src);
    await onUpload(blob);
  };

  const useCrop = async () => {
    if (!area) return;
    setBusy(true);
    try {
      const mime = alpha ? "image/png" : "image/jpeg";
      const ext = mime === "image/png" ? ".png" : ".jpg";
      const blob = await cropToBlob(src, area, { bg, mime });
      blob.name = (file.name || "foto").replace(/\.[^.]+$/, "") + "-crop" + ext;
      await finish(blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6" data-testid="crop-modal">
      <div className="absolute inset-0 bg-[#0A192F]/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h3 className="font-serif-display text-xl text-[#0A192F]">Atur Area Foto</h3>
          <p className="text-xs text-slate-500 font-light mt-0.5">Geser untuk memilih bagian yang ditonjolkan, cubit/scroll untuk zoom.</p>
        </div>
        <div className="relative h-72">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
            style={{
              containerStyle: { background: bg === "transparent" ? CHECKER : bg },
            }}
          />
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mr-1">Rasio</span>
            {ASPECTS.map(([lbl, v]) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setAspect(v)}
                data-testid={`crop-aspect-${lbl.replace(":", "-")}`}
                className={`px-3 py-1 rounded-full text-xs border transition-colors duration-200 ${
                  aspect === v ? "bg-[#0A192F] border-[#0A192F] text-white" : "border-slate-200 text-slate-500 hover:border-[#0A192F]"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
          {alpha && (
            <div className="flex items-center gap-2 flex-wrap" data-testid="crop-bg-options">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mr-1">Latar PNG</span>
              <button
                type="button"
                onClick={() => setBg("transparent")}
                data-testid="crop-bg-transparent"
                className={`px-3 py-1 rounded-full text-xs border transition-colors duration-200 ${
                  bg === "transparent" ? "bg-[#0A192F] border-[#0A192F] text-white" : "border-slate-200 text-slate-500 hover:border-[#0A192F]"
                }`}
              >
                Transparan (asli)
              </button>
              <button
                type="button"
                onClick={() => setBg("#ffffff")}
                data-testid="crop-bg-white"
                className={`px-3 py-1 rounded-full text-xs border transition-colors duration-200 ${
                  bg === "#ffffff" ? "bg-[#0A192F] border-[#0A192F] text-white" : "border-slate-200 text-slate-500 hover:border-[#0A192F]"
                }`}
              >
                Putih
              </button>
              <label className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-slate-200 text-slate-500 cursor-pointer hover:border-[#0A192F]">
                Warna lain
                <input
                  type="color"
                  value={bg === "transparent" ? "#ffffff" : bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                  data-testid="crop-bg-color-picker"
                />
              </label>
            </div>
          )}
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-emerald-600"
            data-testid="crop-zoom-slider"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={useCrop}
              disabled={busy}
              data-testid="crop-confirm-btn"
              className="flex-1 min-w-[140px] py-2.5 rounded-full bg-[#059669] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#047857] transition-colors duration-200 disabled:opacity-60"
            >
              {busy ? "Memproses..." : "Gunakan & Unggah"}
            </button>
            <button
              type="button"
              onClick={() => { setBusy(true); finish(file).finally(() => setBusy(false)); }}
              disabled={busy}
              data-testid="crop-skip-btn"
              className="flex-1 min-w-[140px] py-2.5 rounded-full border border-slate-200 text-slate-500 text-xs uppercase tracking-wider hover:border-[#0A192F] hover:text-[#0A192F] transition-colors duration-200 disabled:opacity-60"
            >
              Unggah Tanpa Crop
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              data-testid="crop-cancel-btn"
              className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors duration-200"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
