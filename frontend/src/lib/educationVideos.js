const SAMPLE_URLS = new Set([
  "https://videos.pexels.com/video-files/3191572/3191572-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/5377684/5377684-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/4065924/4065924-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/3209828/3209828-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/4440933/4440933-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/3195394/3195394-hd_1280_720_25fps.mp4",
]);

export const isSampleVideoUrl = (url = "") => SAMPLE_URLS.has((url || "").trim());

export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const total = Math.round(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const getYoutubeEmbedUrl = (url = "") => {
  if (!url) return null;
  const m =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/) ||
    null;
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
};

export const humanizeFilename = (filename = "", lang = "id") => {
  const withoutExt = String(filename || "")
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[-_]?/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!withoutExt) {
    return lang === "en" ? "GESOI Brain Health Education Video" : "Video Edukasi Sehat Otak GESOI";
  }

  return withoutExt
    .split(" ")
    .map((word) => {
      if (/^(gesoi|icb|icc|sdm|hr|ai|qeeg|adhd)$/i.test(word)) return word.toUpperCase();
      if (/^otaqku$/i.test(word)) return "otaQku";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export const videoItemFromGalleryFile = (file, lang = "id") => {
  const rawName = file?.original_filename || file?.storage_path || "";
  const lower = rawName.toLowerCase();
  const isAndrew = /andrew|ketua|pengurus|headtalking/i.test(lower);
  const isMental = /mental|stres|stress|emosi|burnout|depresi|cemas|anxiety/i.test(lower);
  const isSleep = /tidur|sleep|istirahat|fokus|focus|layar|screen|gadget|gawai/i.test(lower);
  const isChild = /anak|remaja|sekolah|bayi|ibu|keluarga|stunting/i.test(lower);

  let category = lang === "en" ? "Brain Health" : "Kesehatan Otak";
  if (isAndrew) category = lang === "en" ? "Leadership Message" : "Pesan Tokoh";
  else if (isMental) category = lang === "en" ? "Mental Health" : "Kesehatan Mental";
  else if (isSleep) category = lang === "en" ? "Lifestyle & Focus" : "Gaya Hidup & Fokus";
  else if (isChild) category = lang === "en" ? "Children & Family" : "Anak & Keluarga";

  const speaker = isAndrew
    ? "Andrew Tani"
    : lang === "en"
    ? "Turag Works · GESOI"
    : "Karya Turag · GESOI";

  const role = isAndrew
    ? lang === "en"
      ? "Chair, Board of Management GESOI"
      : "Ketua Dewan Pengurus GESOI"
    : lang === "en"
    ? "Public Brain Health Education"
    : "Edukasi Publik Sehat Otak";

  const title = humanizeFilename(rawName, lang);
  const desc =
    lang === "en"
      ? "Free public educational video presented by Yayasan Gerakan Sehat Otak Indonesia (GESOI) to build daily awareness of brain and mental health."
      : "Video edukasi gratis persembahan Yayasan Gerakan Sehat Otak Indonesia (GESOI) untuk meningkatkan kesadaran masyarakat akan pentingnya kesehatan otak dan mental.";

  return {
    title,
    category,
    speaker,
    role,
    duration: "",
    desc,
    url: file.url || `/api/files/${file.storage_path}`,
    poster: "",
    _fromGallery: true,
    _fileId: file.id,
  };
};

export const autoClassifyGalleryVideo = videoItemFromGalleryFile;

const normalizeUrlKey = (u = "") =>
  String(u || "")
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "");

export const buildEducationVideoList = (cmsItems = [], galleryVideos = [], lang = "id") => {
  const safeCms = Array.isArray(cmsItems) ? cmsItems.filter((it) => it && it.url) : [];
  const safeGallery = Array.isArray(galleryVideos) ? galleryVideos.filter((f) => f && (f.url || f.storage_path)) : [];

  const cmsUrlSet = new Set(safeCms.map((it) => normalizeUrlKey(it.url)));
  const extraFromGallery = safeGallery
    .filter((f) => {
      const u = normalizeUrlKey(f.url || `/api/files/${f.storage_path}`);
      return u && !cmsUrlSet.has(u);
    })
    .map((f) => videoItemFromGalleryFile(f, lang));

  const customCmsItems = safeCms.filter((it) => !isSampleVideoUrl(it.url));
  const hasRealVideos = customCmsItems.length > 0 || extraFromGallery.length > 0;

  if (hasRealVideos) {
    return [...customCmsItems, ...extraFromGallery];
  }
  return safeCms;
};
