"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Shield, Sparkles, Home } from "lucide-react";

export default function TermsOfServicePage() {
  const [siteLogo, setSiteLogo] = useState<string>("/api/logo");

  useEffect(() => {
    async function loadLogo() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data && data.logo_url) {
          setSiteLogo(data.logo_url);
        }
      } catch {
        // Fallback
      }
    }
    loadLogo();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img
              src={siteLogo}
              alt="Offerzonline"
              className="h-8 w-auto object-contain"
            />
            <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
              Offerzonline
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition flex items-center gap-1.5"
            >
              <Home size={13} />
              <span>Home</span>
            </Link>
            <Link
              href="/auth"
              className="text-xs font-semibold text-white bg-[#0052cc] hover:bg-[#0045b0] px-3.5 py-1.5 rounded-full transition shadow-xs"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Document Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0052cc] text-xs font-bold mb-4">
            <FileText size={13} />
            <span>Legal Agreement</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-slate-600">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0052cc] rounded-full" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, registering on, or using the <strong>Offerzonline</strong> platform (the &quot;Platform&quot; or &quot;Service&quot;), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not access or use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0052cc] rounded-full" />
              2. Platform Overview &amp; Services
            </h2>
            <p>
              Offerzonline connects merchants, local business owners, and creators with consumers by providing tools for live video broadcasting, promotional deal publishing, interactive coupons, and localized offers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0052cc] rounded-full" />
              3. User Accounts &amp; Merchant Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account Security:</strong> You are responsible for safeguarding your login credentials and maintaining the security of your account.
              </li>
              <li>
                <strong>Deal Accuracy:</strong> Merchants and streamers must ensure all offers, discounts, promotional pricing, terms, and claims made during live streams or deal listings are truthful, accurate, and honored at the time of redemption.
              </li>
              <li>
                <strong>Prohibited Content:</strong> You may not upload, broadcast, or link to any defamatory, fraudulent, infringing, pornographic, or unlawful material.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0052cc] rounded-full" />
              4. Live Streaming &amp; Media Guidelines
            </h2>
            <p>
              When hosting live broadcasts or publishing video content, streamers agree to maintain appropriate community standards. Offerzonline reserves the right to suspend, terminate, or remove any live broadcast or stream account that violates our policies or infringes upon third-party rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0052cc] rounded-full" />
              5. Intellectual Property
            </h2>
            <p>
              The Offerzonline platform, including logos, designs, software, text, graphics, and interface elements, is the proprietary property of Offerzonline and protected by copyright and intellectual property laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0052cc] rounded-full" />
              6. Limitation of Liability
            </h2>
            <p>
              Offerzonline provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. We do not guarantee transactions between third-party merchants and consumers and shall not be held liable for disputes arising between buyers and sellers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0052cc] rounded-full" />
              7. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Continued use of the platform following any modifications constitutes your acknowledgment and acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#0052cc] rounded-full" />
              8. Contact &amp; Inquiries
            </h2>
            <p>
              If you have any questions or concerns regarding these Terms of Service, please reach out through our contact channels or email our support desk.
            </p>
          </section>
        </div>

        {/* Back navigation footer */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0052cc] hover:underline"
          >
            Go to Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
