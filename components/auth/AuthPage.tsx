"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "admin@bookshelf.com";
const ADMIN_PASSWORD = "admin02112005";

type Tab = "login" | "signup";
type View = "tabs" | "forgot" | "forgot-sent" | "signup-success";

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" className="w-[19px] h-[19px]">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[15px] h-[15px]">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MiniBook({ title, author, pct, color, style }: {
  title: string; author: string; pct: number; color: string; style?: React.CSSProperties;
}) {
  const abbr = title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="bg-bs-panel border border-bs-border rounded-[10px] py-3 px-[14px] flex items-center gap-3 max-w-[300px] shadow-sm" style={style}>
      <div className="w-9 h-[50px] rounded flex items-center justify-center shrink-0 text-white/60 font-serif text-sm font-bold" style={{ background: color }}>{abbr}</div>
      <div className="flex-1">
        <div className="text-[12px] font-semibold leading-tight">{title}</div>
        <div className="text-[11px] text-bs-muted mt-[1px]">{author}</div>
        <div className="bg-bs-tag rounded-full h-[3px] mt-[7px] overflow-hidden">
          <div className="h-full bg-bs-accent rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[10px] text-bs-accent font-semibold mt-1">{pct}%</div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [view, setView] = useState<View>("tabs");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Signup
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPw, setSignupPw] = useState("");
  const [signupPw2, setSignupPw2] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showSignupPw2, setShowSignupPw2] = useState(false);
  const [terms, setTerms] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [pwStrength, setPwStrength] = useState(0);

  // Forgot
  const [forgotEmail, setForgotEmail] = useState("");

  function checkStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setPwStrength(score);
  }

  const strengthColors = ["#e05c5c", "#e07a1a", "#c1a20e", "#3a9a5a"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) errs.email = "Please enter a valid email";
    if (!loginPw) errs.pw = "Please enter your password";
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    if (loginEmail !== ADMIN_EMAIL || loginPw !== ADMIN_PASSWORD) {
      setLoginErrors({ pw: "Incorrect email or password" });
      return;
    }
    setLoginErrors({});
    router.push("/library");
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!first.trim()) errs.first = "Required";
    if (!last.trim()) errs.last = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) errs.email = "Please enter a valid email";
    if (signupPw.length < 8) errs.pw = "Password must be at least 8 characters";
    if (signupPw !== signupPw2) errs.pw2 = "Passwords do not match";
    if (!terms) errs.terms = "Please accept the terms";
    if (Object.keys(errs).length) { setSignupErrors(errs); return; }
    setSignupErrors({});
    setView("signup-success");
  }

  function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) setView("forgot-sent");
  }

  const inputCls = "w-full bg-bs-panel border border-bs-border rounded-[10px] py-[11px] px-[14px] text-[13px] text-bs-text outline-none transition-all placeholder:text-bs-faint focus:border-bs-accent focus:ring-[3px] focus:ring-bs-accent/10";
  const labelCls = "block text-[12px] font-medium text-bs-muted mb-[6px]";
  const errCls = "text-[11px] text-bs-accent mt-1";

  return (
    <div className="flex min-h-screen overflow-hidden font-sans">

      {/* Left decorative panel */}
      <div className="w-[46%] bg-bs-sidebar flex flex-col justify-between py-[40px] px-[48px] relative overflow-hidden hidden lg:flex">
        <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(135deg,transparent,transparent 28px,rgba(193,68,14,0.04) 28px,rgba(193,68,14,0.04) 29px)" }} />

        <div className="flex items-center gap-[11px] relative z-10">
          <div className="w-9 h-9 bg-bs-accent rounded-lg flex items-center justify-center shrink-0">
            <BookIcon />
          </div>
          <span className="font-fraunces text-[20px] font-semibold text-bs-text">Bookshelf</span>
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 py-10">
          <h1 className="font-fraunces text-[38px] font-semibold leading-[1.18] text-bs-text mb-[18px]">
            Your reading life,<br /><em className="text-bs-accent not-italic italic">beautifully</em> organized.
          </h1>
          <p className="text-[14px] text-bs-muted leading-[1.6] max-w-[320px]">
            Track every book you've read, discover what to read next, and hit your yearly reading goal — all in one place.
          </p>
          <div className="flex flex-col gap-[10px] mt-9">
            <MiniBook title="Project Hail Mary" author="Andy Weir" pct={65} color="#5a3a1a" />
            <MiniBook title="The Name of the Wind" author="Patrick Rothfuss" pct={82} color="#1a3a5a" style={{ opacity: 0.75, marginLeft: 20 }} />
            <MiniBook title="Circe" author="Madeline Miller" pct={47} color="#3a2a1a" style={{ opacity: 0.45, marginLeft: 40 }} />
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-bs-faint leading-[1.6]">
          © {new Date().getFullYear()} Bookshelf · Built for readers who love their books
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center py-[40px] px-[48px] overflow-y-auto bg-bs-bg">
        <div className="w-full max-w-[380px]">

          {/* Tab switcher — shown when viewing login/signup tabs */}
          {view === "tabs" && (
            <div className="flex bg-bs-tag rounded-[10px] p-1 mb-7 gap-1">
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 text-center py-2 rounded-[7px] text-[13px] font-medium transition-all cursor-pointer ${
                    tab === t
                      ? "bg-bs-panel text-bs-text shadow-sm"
                      : "text-bs-muted hover:text-bs-text"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>
          )}

          {/* ── LOGIN ── */}
          {view === "tabs" && tab === "login" && (
            <form onSubmit={handleLogin} noValidate>
              <h2 className="font-fraunces text-[28px] font-semibold mb-[6px]">Welcome back</h2>
              <p className="text-[13px] text-bs-muted mb-8 leading-[1.5]">
                New to Bookshelf?{" "}
                <button type="button" onClick={() => setTab("signup")} className="text-bs-accent font-medium hover:underline cursor-pointer">
                  Create a free account
                </button>
              </p>

              <div className="mb-[14px]">
                <label className={labelCls}>Email address</label>
                <input className={inputCls} type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="email" />
                {loginErrors.email && <p className={errCls}>{loginErrors.email}</p>}
              </div>

              <div className="mb-1">
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input className={inputCls + " pr-10"} type={showLoginPw ? "text" : "password"} placeholder="Your password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-bs-faint hover:text-bs-muted cursor-pointer p-1">
                    <EyeIcon open={showLoginPw} />
                  </button>
                </div>
                {loginErrors.pw && <p className={errCls}>{loginErrors.pw}</p>}
              </div>

              <button type="button" onClick={() => setView("forgot")} className="block text-right text-[12px] text-bs-accent hover:underline -mt-2 mb-[14px] ml-auto cursor-pointer">
                Forgot your password?
              </button>

              <button type="submit" className="w-full bg-bs-accent text-white rounded-[10px] py-3 text-[14px] font-semibold mt-[6px] hover:bg-bs-accent-hover hover:-translate-y-px active:translate-y-0 transition-all cursor-pointer">
                Sign In
              </button>
            </form>
          )}

          {/* ── SIGNUP ── */}
          {view === "tabs" && tab === "signup" && (
            <form onSubmit={handleSignup} noValidate>
              <h2 className="font-fraunces text-[28px] font-semibold mb-[6px]">Create your account</h2>
              <p className="text-[13px] text-bs-muted mb-8 leading-[1.5]">
                Already have one?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-bs-accent font-medium hover:underline cursor-pointer">
                  Sign in
                </button>
              </p>

              <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input className={inputCls} type="text" placeholder="Marcus" value={first} onChange={(e) => setFirst(e.target.value)} />
                  {signupErrors.first && <p className={errCls}>{signupErrors.first}</p>}
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input className={inputCls} type="text" placeholder="Santos" value={last} onChange={(e) => setLast(e.target.value)} />
                  {signupErrors.last && <p className={errCls}>{signupErrors.last}</p>}
                </div>
              </div>

              <div className="mb-[14px]">
                <label className={labelCls}>Email address</label>
                <input className={inputCls} type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                {signupErrors.email && <p className={errCls}>{signupErrors.email}</p>}
              </div>

              <div className="mb-[14px]">
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    className={inputCls + " pr-10"}
                    type={showSignupPw ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={signupPw}
                    onChange={(e) => { setSignupPw(e.target.value); checkStrength(e.target.value); }}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowSignupPw(!showSignupPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-bs-faint hover:text-bs-muted cursor-pointer p-1">
                    <EyeIcon open={showSignupPw} />
                  </button>
                </div>
                {signupPw && (
                  <>
                    <div className="flex gap-1 mt-[6px]">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-[3px] flex-1 rounded-full transition-colors" style={{ background: i < pwStrength ? strengthColors[pwStrength - 1] : "var(--color-bs-tag)" }} />
                      ))}
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: pwStrength > 0 ? strengthColors[pwStrength - 1] : "var(--color-bs-faint)" }}>
                      {strengthLabels[pwStrength - 1] ?? ""}
                    </div>
                  </>
                )}
                {signupErrors.pw && <p className={errCls}>{signupErrors.pw}</p>}
              </div>

              <div className="mb-[14px]">
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <input className={inputCls + " pr-10"} type={showSignupPw2 ? "text" : "password"} placeholder="Repeat your password" value={signupPw2} onChange={(e) => setSignupPw2(e.target.value)} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowSignupPw2(!showSignupPw2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-bs-faint hover:text-bs-muted cursor-pointer p-1">
                    <EyeIcon open={showSignupPw2} />
                  </button>
                </div>
                {signupErrors.pw2 && <p className={errCls}>{signupErrors.pw2}</p>}
              </div>

              <div className="flex items-start gap-[9px] mb-[14px]">
                <input type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-[2px] accent-bs-accent shrink-0 cursor-pointer" />
                <label htmlFor="terms" className="text-[12px] text-bs-muted leading-[1.5] cursor-pointer">
                  I agree to the <a href="#" className="text-bs-accent hover:underline">Terms of Service</a> and <a href="#" className="text-bs-accent hover:underline">Privacy Policy</a>
                </label>
              </div>
              {signupErrors.terms && <p className={errCls + " -mt-2 mb-3"}>{signupErrors.terms}</p>}

              <button type="submit" className="w-full bg-bs-accent text-white rounded-[10px] py-3 text-[14px] font-semibold mt-[6px] hover:bg-bs-accent-hover hover:-translate-y-px active:translate-y-0 transition-all cursor-pointer">
                Create Account
              </button>
            </form>
          )}

          {/* ── SIGNUP SUCCESS ── */}
          {view === "signup-success" && (
            <div className="text-center py-5">
              <div className="w-14 h-14 bg-bs-accent/10 rounded-full flex items-center justify-center mx-auto mb-[18px]">
                <svg viewBox="0 0 24 24" fill="none" stroke="#c1440e" strokeWidth="2.5" className="w-[26px] h-[26px]">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="font-fraunces text-[22px] font-semibold mb-2">Welcome to Bookshelf!</div>
              <p className="text-[13px] text-bs-muted mb-6 leading-[1.6]">Your account has been created.<br />Ready to start tracking your reading?</p>
              <button
                onClick={() => { setView("tabs"); setTab("login"); }}
                className="bg-bs-accent text-white rounded-[10px] px-7 py-3 text-[14px] font-semibold hover:bg-bs-accent-hover transition-colors cursor-pointer"
              >
                Go to Sign In →
              </button>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {view === "forgot" && (
            <form onSubmit={handleForgot} noValidate>
              <h2 className="font-fraunces text-[28px] font-semibold mb-[6px]">Reset password</h2>
              <p className="text-[13px] text-bs-muted mb-8 leading-[1.5]">
                Enter your email and we'll send you a reset link.{" "}
                <button type="button" onClick={() => setView("tabs")} className="text-bs-accent font-medium hover:underline cursor-pointer">
                  Back to sign in
                </button>
              </p>
              <div className="mb-[14px]">
                <label className={labelCls}>Email address</label>
                <input className={inputCls} type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-bs-accent text-white rounded-[10px] py-3 text-[14px] font-semibold hover:bg-bs-accent-hover transition-colors cursor-pointer">
                Send Reset Link
              </button>
            </form>
          )}

          {view === "forgot-sent" && (
            <div className="text-center py-[10px]">
              <div className="w-[52px] h-[52px] bg-bs-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c1440e" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="font-fraunces text-[20px] font-semibold mb-2">Check your inbox</div>
              <p className="text-[13px] text-bs-muted mb-6 leading-[1.6]">
                We've sent a reset link to your email. It expires in 15 minutes.
              </p>
              <button onClick={() => setView("tabs")} className="text-[13px] text-bs-accent font-medium cursor-pointer hover:underline">
                ← Back to sign in
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
