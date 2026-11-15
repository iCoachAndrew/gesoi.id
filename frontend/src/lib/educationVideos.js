const SAMPLE_URLS = new Set([
  "https://videos.pexels.com/video-files/3191572/3191572-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/5377684/5377684-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/4065924/4065924-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/3209828/3209828-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/4440933/4440933-hd_1280_720_25fps.mp4",
  "https://videos.pexels.com/video-files/3195394/3195394-hd_1280_720_25fps.mp4",
]);

export const isSampleVideoUrl = (url = "") => SAMPLE_URLS.has((url || "").trim());

// Rewrite /api/files/gesoi/uploads/<file> to direct static /api/uploads/<file> served by LiteSpeed/Apache
export const toDirectMediaUrl = (url = "") =>
  String(url || "")
    .trim()
    .replace(/^(https?:\/\/[^/]+)?\/api\/files\/gesoi\/uploads\//i, "$1/api/uploads/");

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
    return lang === "en" ? "GESOI Brain Health Shorts" : "Video Edukasi Sehat Otak GESOI";
  }

  if (/^gesoi\s*introduction$/i.test(withoutExt) || /^introduction$/i.test(withoutExt)) {
    return "GESOI Introduction";
  }

  if (/^\d+$/.test(withoutExt)) {
    return String(parseInt(withoutExt, 10));
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

const LEGACY_SPEAKER_RE = /turag|andrew\s*tani/i;
const LEGACY_ROLE_RE = /^(ketua\s*dewan\s*pengurus\s*gesoi|chair,\s*board\s*of\s*management\s*gesoi|edukasi\s*publik\s*sehat\s*otak|public\s*brain\s*health\s*education)$/i;
const DELETED_VIDEO_URLS = new Set([
  "/api/files/gesoi/uploads/3c0139a3-663a-471c-a64d-d91c8729509b.mp4",
]);

export const normalizeEducationItem = (item = {}, lang = "id") => {
  const rawSpeaker = String(item.speaker || "").trim();
  const speaker = !rawSpeaker || LEGACY_SPEAKER_RE.test(rawSpeaker) ? "Karya GESOI" : rawSpeaker;

  const rawRole = String(item.role || "").trim();
  const role = LEGACY_ROLE_RE.test(rawRole) ? "" : rawRole;

  let title = String(item.title || "").trim();
  if (/^gesoi\s*[-–]?\s*introduction(\s*video)?$/i.test(title)) {
    title = "GESOI Introduction";
  }

  const rawCat = String(item.category || "").trim();
  let category = rawCat;
  if (!category || /^(pesan\s*tokoh|leadership\s*message)$/i.test(category)) {
    category = /intro/i.test(title)
      ? lang === "en"
        ? "Introduction"
        : "Pengantar"
      : lang === "en"
      ? "Brain Health"
      : "Kesehatan Otak";
  }

  return {
    ...item,
    url: item.url ? toDirectMediaUrl(item.url) : item.url,
    title,
    category,
    speaker,
    role,
  };
};

export const getEducationSortKey = (item = {}) => {
  const title = String(item.title || "").trim();
  const rawName = String(item._rawFilename || "").trim();
  const combined = `${title} ${rawName}`.trim();

  if (/intro/i.test(combined)) {
    return { bucket: 0, num: 0, label: title };
  }

  // Exact number title like "1", "2", ..., "59"
  if (/^\d+$/.test(title)) {
    return { bucket: 1, num: parseInt(title, 10), label: title };
  }

  // Number in filename or title
  const numMatch = rawName.match(/^(\d+)\b/) || title.match(/(?:^|#|\b)(\d+)\b/);
  if (numMatch) {
    return { bucket: 1, num: parseInt(numMatch[1], 10), label: title };
  }

  return { bucket: 2, num: 999999, label: title };
};

export const sortEducationVideos = (items = []) => {
  return [...items].sort((a, b) => {
    const ka = getEducationSortKey(a);
    const kb = getEducationSortKey(b);
    if (ka.bucket !== kb.bucket) return ka.bucket - kb.bucket;
    if (ka.num !== kb.num) return ka.num - kb.num;
    return ka.label.localeCompare(kb.label, undefined, { numeric: true, sensitivity: "base" });
  });
};

export const videoItemFromGalleryFile = (file, lang = "id") => {
  const rawName = file?.original_filename || file?.storage_path || "";
  const lower = rawName.toLowerCase();
  const isIntro = /intro/i.test(lower);
  const isMental = /mental|stres|stress|emosi|burnout|depresi|cemas|anxiety/i.test(lower);
  const isSleep = /tidur|sleep|istirahat|fokus|focus|layar|screen|gadget|gawai/i.test(lower);
  const isChild = /anak|remaja|sekolah|bayi|ibu|keluarga|stunting/i.test(lower);

  let category = lang === "en" ? "Brain Health" : "Kesehatan Otak";
  if (isIntro) category = lang === "en" ? "Introduction" : "Pengantar";
  else if (isMental) category = lang === "en" ? "Mental Health" : "Kesehatan Mental";
  else if (isSleep) category = lang === "en" ? "Lifestyle & Focus" : "Gaya Hidup & Fokus";
  else if (isChild) category = lang === "en" ? "Children & Family" : "Anak & Keluarga";

  const title = humanizeFilename(rawName, lang);
  const desc =
    lang === "en"
      ? "Free public educational video presented by Yayasan Gerakan Sehat Otak Indonesia (GESOI) to build daily awareness of brain and mental health."
      : "Video edukasi gratis persembahan Yayasan Gerakan Sehat Otak Indonesia (GESOI) untuk meningkatkan kesadaran masyarakat akan pentingnya kesehatan otak dan mental.";

  return {
    title,
    category,
    speaker: "Karya GESOI",
    role: "",
    duration: "",
    desc,
    url: toDirectMediaUrl(file.url || `/api/files/${file.storage_path}`),
    poster: "",
    _fromGallery: true,
    _fileId: file.id,
    _rawFilename: rawName,
  };
};

export const autoClassifyGalleryVideo = videoItemFromGalleryFile;

const normalizeUrlKey = (u = "") =>
  String(u || "")
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/api\/uploads\//i, "/api/files/gesoi/uploads/");

export const buildEducationVideoList = (cmsItems = [], galleryVideos = [], lang = "id") => {
  const safeCms = Array.isArray(cmsItems) ? cmsItems.filter((it) => it && it.url) : [];
  const safeGallery = Array.isArray(galleryVideos)
    ? galleryVideos.filter((f) => f && (f.url || f.storage_path))
    : [];

  const galleryByUrl = new Map();
  for (const f of safeGallery) {
    const key = normalizeUrlKey(f.url || `/api/files/${f.storage_path}`);
    if (key) galleryByUrl.set(key, f);
  }

  // Filter out sample Pexels URLs and any deleted /api/files/ entries no longer in Galeri Media
  const customCmsItems = safeCms
    .filter((it) => {
      if (isSampleVideoUrl(it.url)) return false;
      const key = normalizeUrlKey(it.url);
      if (DELETED_VIDEO_URLS.has(key)) return false;
      if (safeGallery.length > 0 && key.startsWith("/api/files/") && !galleryByUrl.has(key)) {
        return false;
      }
      return true;
    })
    .map((it) => {
      const key = normalizeUrlKey(it.url);
      const gFile = galleryByUrl.get(key);
      return normalizeEducationItem(
        {
          ...it,
          _rawFilename: it._rawFilename || gFile?.original_filename || "",
        },
        lang
      );
    });

  const cmsUrlSet = new Set(customCmsItems.map((it) => normalizeUrlKey(it.url)));
  const hasIntroInCms = customCmsItems.some((it) => /intro/i.test(it.title || ""));

  const extraFromGallery = safeGallery
    .filter((f) => {
      const u = normalizeUrlKey(f.url || `/api/files/${f.storage_path}`);
      if (!u || cmsUrlSet.has(u)) return false;
      if (hasIntroInCms && /intro/i.test(f.original_filename || "")) return false;
      return true;
    })
    .map((f) => videoItemFromGalleryFile(f, lang));

  const hasRealVideos = customCmsItems.length > 0 || extraFromGallery.length > 0;
  if (hasRealVideos) {
    return sortEducationVideos([...customCmsItems, ...extraFromGallery]);
  }
  return sortEducationVideos(safeCms.map((it) => normalizeEducationItem(it, lang)));
};

// Lightweight fuzzy matching for search queries (supports substring, multi-token, and subsequence/typo matching)
const isSubsequence = (needle, haystack) => {
  let i = 0;
  let j = 0;
  while (i < needle.length && j < haystack.length) {
    if (needle[i] === haystack[j]) i++;
    j++;
  }
  return i === needle.length;
};

const editDistanceAtMost1 = (a, b) => {
  if (Math.abs(a.length - b.length) > 1) return false;
  let edits = 0;
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else {
      edits++;
      if (edits > 1) return false;
      if (a.length > b.length) i++;
      else if (b.length > a.length) j++;
      else {
        i++;
        j++;
      }
    }
  }
  if (i < a.length || j < b.length) edits++;
  return edits <= 1;
};

export const fuzzyMatchVideo = (item, query = "", globalIdx = 0) => {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return true;

  const numStr = String(globalIdx + 1);
  const padNum = String(globalIdx + 1).padStart(2, "0");
  const hay = `${item.title || ""} ${item.category || ""} ${item.speaker || ""} ${item.desc || ""} shorts ${numStr} #${numStr} #${padNum}`.toLowerCase();

  if (hay.includes(q)) return true;

  const hayWords = hay.split(/[^a-z0-9]+/).filter(Boolean);
  const tokens = q.split(/\s+/).filter(Boolean);

  return tokens.every((tok) => {
    if (hay.includes(tok)) return true;
    if (tok.length >= 3 && hayWords.some((w) => editDistanceAtMost1(tok, w))) return true;
    if (tok.length >= 3 && isSubsequence(tok, hay.replace(/\s+/g, ""))) return true;
    return false;
  });
};
