import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

const hasConsent = () => localStorage.getItem("gesoi_cookie_consent") === "accepted";

const getVisitorId = () => {
  let id = localStorage.getItem("gesoi_vid");
  if (!id) {
    id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("gesoi_vid", id);
  }
  return id;
};

const refSource = () => {
  try {
    if (!document.referrer) return "direct";
    const host = new URL(document.referrer).hostname;
    return host === window.location.hostname ? null : host;
  } catch {
    return "direct";
  }
};

const send = (type, name, lang) => {
  if (!hasConsent()) return;
  axios
    .post(`${API}/track`, {
      type,
      name: name || null,
      visitor_id: getVisitorId(),
      lang: lang || null,
      device: window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop",
      referrer: type === "pageview" ? refSource() : null,
    })
    .catch(() => {});
};

let lastPageview = 0;

export const trackPageview = (lang) => {
  const now = Date.now();
  if (now - lastPageview < 800) return;
  lastPageview = now;
  send("pageview", null, lang);
};

export const trackEvent = (name, lang) => send("event", name, lang);
