export const slugify = (title) =>
  (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const newsUrl = (item, i) => `/berita/${i}-${slugify(item.title)}`;

export const newsIndexFromSlug = (slug) => {
  const idx = parseInt(slug, 10);
  return Number.isNaN(idx) ? -1 : idx;
};
