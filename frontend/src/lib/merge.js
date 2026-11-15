import {
  isSampleVideoUrl,
  normalizeEducationItem,
  sortEducationVideos,
} from "./educationVideos.js";

const DELETED_EDU_URLS = new Set([
  "/api/files/gesoi/uploads/3c0139a3-663a-471c-a64d-d91c8729509b.mp4",
]);

const normalizeUrlKey = (u = "") =>
  String(u || "")
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "");

export const normalizeEducationItems = (savedItems = [], defaultItems = []) => {
  const safeSaved = Array.isArray(savedItems) ? savedItems : [];
  const safeDefaults = Array.isArray(defaultItems) ? defaultItems : [];

  const cleanedSaved = safeSaved
    .filter((it) => {
      if (!it || !it.url) return false;
      if (isSampleVideoUrl(it.url)) return false;
      const key = normalizeUrlKey(it.url);
      if (DELETED_EDU_URLS.has(key)) return false;
      return true;
    })
    .map((it) => normalizeEducationItem(it));

  const seenUrls = new Set(cleanedSaved.map((it) => normalizeUrlKey(it.url)));
  const hasIntro = cleanedSaved.some((it) => /intro/i.test(it.title || ""));

  const missingDefaults = safeDefaults
    .filter((def) => {
      if (!def || !def.url) return false;
      const key = normalizeUrlKey(def.url);
      if (!key || seenUrls.has(key)) return false;
      if (hasIntro && /intro/i.test(def.title || "")) return false;
      return true;
    })
    .map((def) => normalizeEducationItem(def));

  return sortEducationVideos([...cleanedSaved, ...missingDefaults]);
};

export const normalizeSections = (savedSections, defaultSections = []) => {
  if (!Array.isArray(savedSections) || !savedSections.length) return defaultSections;
  const existingKeys = new Set(savedSections.map((s) => s?.key).filter(Boolean));
  const out = [...savedSections];
  for (let i = 0; i < defaultSections.length; i++) {
    const def = defaultSections[i];
    if (!def?.key || existingKeys.has(def.key)) continue;
    const prevKey = i > 0 ? defaultSections[i - 1]?.key : null;
    const prevIdx = prevKey ? out.findIndex((s) => s?.key === prevKey) : -1;
    if (prevIdx >= 0) {
      out.splice(prevIdx + 1, 0, { ...def });
    } else {
      out.push({ ...def });
    }
    existingKeys.add(def.key);
  }
  return out;
};

export const deepMerge = (base, override) => {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override;
  if (typeof base === "object" && base !== null && typeof override === "object") {
    const out = { ...base };
    for (const k of Object.keys(override)) {
      if (k === "sections" && Array.isArray(base?.sections) && Array.isArray(override?.sections)) {
        out[k] = normalizeSections(override.sections, base.sections);
      } else if (k === "education" && typeof base?.education === "object" && typeof override?.education === "object") {
        const mergedEdu = deepMerge(base.education, override.education);
        if (Array.isArray(base.education?.items) || Array.isArray(override.education?.items)) {
          mergedEdu.items = normalizeEducationItems(override.education?.items, base.education?.items);
        }
        if (typeof mergedEdu.body === "string" && /turag|andrew\s*tani/i.test(mergedEdu.body)) {
          mergedEdu.body = typeof base.education.body === "string" && !/turag|andrew\s*tani/i.test(base.education.body)
            ? base.education.body
            : "Koleksi video edukasi ringkas berformat vertikal (Shorts 9:16) Karya GESOI, dirancang praktis untuk ditonton di ponsel maupun desktop demi membangun kesadaran sehat otak dan mental setiap hari.";
        }
        out[k] = mergedEdu;
      } else {
        out[k] = deepMerge(base?.[k], override[k]);
      }
    }
    return out;
  }
  return override;
};
