"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Lock, Mail, User, Phone, Store, ArrowRight, 
  CheckCircle, ArrowLeft, ShieldCheck, AlertCircle, RefreshCw,
  Tv, Radio, Home, Eye, EyeOff
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [siteLogo, setSiteLogo] = useState<string>("/api/logo");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Captcha state for spam protection
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const fetchCaptcha = async () => {
    try {
      const res = await fetch("/api/admin/captcha");
      const data = await res.json();
      if (data.question && data.token) {
        setCaptchaQuestion(data.question);
        setCaptchaToken(data.token);
        setCaptchaInput("");
      }
    } catch (e) {}
  };

  // Check if already authenticated & load brand logo & captcha
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/streamer/login");
        const data = await res.json();
        if (data.authenticated) {
          router.push("/streams/studio");
        }
      } catch (e) {
        // Continue
      }
    }

    async function loadLogo() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.settings?.logo) {
          setSiteLogo(data.settings.logo);
        }
      } catch (e) {
        // Fallback to /api/logo
      }
    }

    checkSession();
    loadLogo();
    fetchCaptcha();
  }, [router]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setRegisterStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === "register") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please re-enter.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const res = await fetch("/api/streamer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          router.push("/streams/studio");
        } else {
          setError(data.error || "Invalid email or password.");
        }
      } else {
        if (!captchaInput.trim()) {
          setError("Please answer the security captcha math question.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/streamer/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            storeName,
            phone,
            captchaAnswer: captchaInput,
            captchaToken,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccessMsg(data.message || "Account created! Your account is inactive and pending admin activation.");
          setMode("login");
          setRegisterStep(1);
          setPassword("");
          setConfirmPassword("");
          setCaptchaInput("");
          fetchCaptcha();
        } else {
          setError(data.error || "Registration failed.");
          fetchCaptcha();
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaedf2] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 2-Column Split Master Card */}
      <div className="w-full max-w-[1040px] bg-white rounded-3xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.08)] p-4 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch border border-slate-100">
        
        {/* LEFT COLUMN: Clean Minimalist Hero Banner */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0052cc] via-[#0047b3] to-[#1e1b4b] rounded-2xl p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden order-2 lg:order-1 min-h-[460px]">
          
          {/* Ambient Background Gradient Mesh & Geometric Light Orbs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Hero Text */}
          <div className="space-y-3.5 z-10 relative">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/20 shadow-sm">
              <span>Offerzonline Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              A Seamless, Intuitive &amp; Live Discovery Platform
            </h2>
          </div>

          {/* Bottom Clean Brand Highlight */}
          <div className="z-10 relative pt-12">
            <div className="border-t border-white/15 pt-6 flex items-center justify-between text-xs text-blue-100/80">
              <span className="font-semibold tracking-wide">Live Commerce &amp; Streaming Platform</span>
              <span className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sign In / Sign Up Form */}
        <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-6 lg:p-8 order-1 lg:order-2">
          <div>
            {/* Top Brand Logo & Home Button */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="inline-flex items-center">
                <img
                  src={siteLogo}
                  alt="Offerzonline"
                  className="h-8 w-auto object-contain shrink-0"
                />
              </Link>

              <Link
                href="/"
                title="Back to Home"
                className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-full transition cursor-pointer"
              >
                <Home size={16} />
              </Link>
            </div>

            {/* Title */}
            <div className="mb-5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {mode === "login" 
                  ? "Log in to your account" 
                  : registerStep === 1 
                    ? "Create your account" 
                    : "Set your password"}
              </h1>
            </div>

            {/* Clean Segmented Switcher */}
            <div className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setRegisterStep(1);
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setName("");
                  setStoreName("");
                  setPhone("");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setRegisterStep(1);
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setName("");
                  setStoreName("");
                  setPhone("");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Registration Step Indicator Pills (on register mode) */}
            {mode === "register" && (
              <div className="flex items-center gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setRegisterStep(1)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    registerStep === 1
                      ? "bg-blue-50 text-[#0052cc] border-blue-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">1</span>
                  <span>Basic Info</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    if (name.trim() && email.trim()) {
                      setRegisterStep(2);
                    } else {
                      setError("Please fill in your name and email first.");
                    }
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    registerStep === 2
                      ? "bg-blue-50 text-[#0052cc] border-blue-200"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">2</span>
                  <span>Set Password</span>
                </button>
              </div>
            )}

            {/* Error / Success Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-700 flex items-center gap-2">
                <CheckCircle size={15} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={mode === "register" && registerStep === 1 ? handleNextStep : handleSubmit} className="space-y-4" autoComplete={mode === "register" ? "off" : "on"}>
              
              {/* LOGIN MODE FIELDS */}
              {mode === "login" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0052cc] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0052cc] rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#0052cc] focus:ring-0 cursor-pointer accent-[#0052cc]"
                      />
                      <span>Remember for 30 days</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => alert("Please contact administrator to reset credentials.")}
                      className="text-xs font-semibold text-[#0052cc] hover:underline cursor-pointer"
                    >
                      Forgot password
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-[#0052cc] hover:bg-[#0045b0] text-white font-semibold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      <span>Log in</span>
                    )}
                  </button>
                </>
              )}

              {/* REGISTER STEP 1: Basic Info */}
              {mode === "register" && registerStep === 1 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0052cc] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Business Name
                      </label>
                      <div className="relative">
                        <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          autoComplete="off"
                          placeholder="Business / Brand name"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0052cc] rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          autoComplete="off"
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0052cc] rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        autoComplete="new-email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0052cc] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#0052cc] hover:bg-[#0045b0] text-white font-semibold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Continue to Password</span>
                    <ArrowRight size={15} />
                  </button>
                </>
              )}

              {/* REGISTER STEP 2: Password & Confirm Password */}
              {mode === "register" && registerStep === 2 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0052cc] rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full bg-slate-50/60 hover:bg-slate-50 focus:bg-white border rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition ${
                          confirmPassword && confirmPassword !== password
                            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                            : "border-slate-200 focus:border-[#0052cc] focus:ring-blue-600/10"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-[11px] text-rose-500 font-medium mt-1">Passwords do not match</p>
                    )}
                  </div>

                  {/* Security Captcha Anti-Spam Challenge */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-[#0052cc]" />
                        <span>Security Captcha</span>
                      </label>
                      <button
                        type="button"
                        onClick={fetchCaptcha}
                        className="text-[11px] font-semibold text-[#0052cc] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Refresh question"
                      >
                        <RefreshCw size={11} />
                        <span>Refresh</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-black text-slate-800 tracking-wider shadow-xs select-none min-w-[110px] text-center">
                        {captchaQuestion || "Loading..."}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Answer"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 focus:border-[#0052cc] rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setRegisterStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-[#0052cc] hover:bg-[#0045b0] text-white font-semibold text-sm shadow-sm transition active:scale-[0.99] cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Creating account...</span>
                        </div>
                      ) : (
                        <span>Complete Registration</span>
                      )}
                    </button>
                  </div>
                </>
              )}

            </form>
          </div>

          {/* Bottom Footer Note */}
          <div className="pt-8 text-center text-xs text-slate-400">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-600 font-medium">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
