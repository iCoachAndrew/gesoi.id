import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock } from "lucide-react";
import { Toaster } from "sonner";

const LOGO = "https://customer-assets.emergentagent.com/job_social-impact-web-2/artifacts/e6k8en9x_image.png";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatApiErrorDetail(detail) {
  if (detail == null) return "Terjadi kesalahan. Coba lagi.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
      localStorage.setItem("gesoi_token", data.access_token);
      navigate("/admin");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl bg-white/10 border border-white/20 px-5 py-4 text-white placeholder:text-white/40 text-sm font-light focus:outline-none focus:border-emerald-300 transition-colors duration-300";

  return (
    <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center px-6 grain-overlay relative" data-testid="admin-login-page">
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <span className="bg-white rounded-lg px-3 py-2 inline-flex items-center">
            <img src={LOGO} alt="GESOI" className="h-8 w-auto" />
          </span>
          <span className="text-white font-medium tracking-[0.25em]">ADMIN</span>
        </div>
        <form onSubmit={submit} className="rounded-3xl backdrop-blur-xl bg-white/5 border border-white/15 p-8 lg:p-10 space-y-5" data-testid="admin-login-form">
          <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-[0.25em] mb-2">
            <Lock size={13} /> Masuk Dashboard
          </div>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email admin" className={inputCls} data-testid="admin-email-input" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputCls} data-testid="admin-password-input" />
          {error && <p className="text-red-300 text-sm" data-testid="admin-login-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full py-4 rounded-full bg-emerald-500 text-white text-sm uppercase tracking-[0.2em] font-medium hover:bg-emerald-400 transition-colors duration-300 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
