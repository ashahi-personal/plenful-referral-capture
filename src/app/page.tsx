import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-plenful-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-plenful-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-plenful-dark">plenful</span>
          </div>
          <span className="text-sm text-plenful-gray-400">340B Referral Capture — Prototypes</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-[1400px] mx-auto px-6 pt-20 pb-16">
        <p className="text-sm font-semibold tracking-widest uppercase text-plenful-teal mb-4">
          340B REFERRAL CAPTURE
        </p>
        <h1 className="text-5xl font-semibold text-plenful-dark leading-tight max-w-2xl mb-6">
          AI-powered referral capture for modern 340B programs
        </h1>
        <p className="text-lg text-plenful-gray-500 max-w-xl mb-12">
          Interactive prototypes for the referral review workflow — built to validate UX hypotheses with 340B analysts before platform configuration.
        </p>

        {/* Prototype Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Card 1 */}
          <Link href="/queue" className="group">
            <div className="border border-plenful-gray-200 rounded-2xl p-8 hover:border-plenful-teal hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-plenful-teal-light flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-plenful-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-plenful-dark mb-3">Referral Review Queue</h2>
              <p className="text-plenful-gray-500 text-sm leading-relaxed mb-6">
                Workqueue for 340B analysts to review AI-identified referral claims. Includes KPI dashboard, confidence scores, filterable claim table, and prioritized review pipeline.
              </p>
              <span className="text-plenful-teal text-sm font-semibold group-hover:underline flex items-center gap-1">
                Open Prototype
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/review" className="group">
            <div className="border border-plenful-gray-200 rounded-2xl p-8 hover:border-plenful-teal hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-plenful-teal-light flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-plenful-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-plenful-dark mb-3">Claim Evidence Review</h2>
              <p className="text-plenful-gray-500 text-sm leading-relaxed mb-6">
                Detailed evidence review for individual referral claims. AI-extracted clinical evidence, confidence scoring, EHR source linking, and one-click analyst approval flow.
              </p>
              <span className="text-plenful-teal text-sm font-semibold group-hover:underline flex items-center gap-1">
                Open Prototype
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-plenful-gray-100 mt-20">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-plenful-gray-400">Plenful AI — Product Leadership Exercise</span>
          <span className="text-xs text-plenful-gray-400">Aman Shahi · March 2026</span>
        </div>
      </div>
    </div>
  );
}
