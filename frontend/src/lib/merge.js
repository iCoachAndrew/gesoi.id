export const deepMerge = (base, override) => {
  if (override === undefined || override === null) return base;
  if (Array.isArray(base) || Array.isArray(override)) return override;
  if (typeof base === "object" && base !== null && typeof override === "object") {
    const out = { ...base };
    for (const k of Object.keys(override)) out[k] = deepMerge(base?.[k], override[k]);
    return out;
  }
  return override;
};
