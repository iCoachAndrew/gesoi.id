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
      } else {
        out[k] = deepMerge(base?.[k], override[k]);
      }
    }
    return out;
  }
  return override;
};
