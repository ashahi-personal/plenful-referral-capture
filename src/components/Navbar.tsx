"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [showAuditModal, setShowAuditModal] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-plenful-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-plenful-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-plenful-dark">
              plenful
            </span>
          </Link>

          {/* Center - Module Label */}
          <span className="text-sm font-medium text-plenful-gray-400 tracking-wide">340B Referral Capture</span>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuditModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-plenful-teal border border-plenful-teal/30 rounded-lg hover:bg-plenful-teal-light hover:border-plenful-teal/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Audit Report
            </button>
            <div className="w-8 h-8 rounded-full bg-plenful-teal flex items-center justify-center text-white text-sm font-medium">
              AS
            </div>
          </div>
        </div>
      </nav>

      {/* HRSA Audit Report Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAuditModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-plenful-gray-200 w-full max-w-lg mx-4 p-8">
            <button onClick={() => setShowAuditModal(false)} className="absolute top-4 right-4 text-plenful-gray-400 hover:text-plenful-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-plenful-teal-light flex items-center justify-center">
                <svg className="w-5 h-5 text-plenful-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-plenful-dark">HRSA Audit Report</h2>
                <p className="text-sm text-plenful-gray-500">Export evidence packages for compliance review</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-plenful-gray-500 uppercase tracking-wider mb-1.5">Report period</label>
                <select className="w-full px-3 py-2 text-sm border border-plenful-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-plenful-teal focus:border-transparent">
                  <option>Last 6 months (Oct 2025 – Mar 2026)</option>
                  <option>Q1 2026 (Jan – Mar)</option>
                  <option>Q4 2025 (Oct – Dec)</option>
                  <option>Custom range...</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-plenful-gray-500 uppercase tracking-wider mb-1.5">Claim selection</label>
                <select className="w-full px-3 py-2 text-sm border border-plenful-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-plenful-teal focus:border-transparent">
                  <option>All approved referral claims (142)</option>
                  <option>Upload HRSA sample list (.csv)</option>
                  <option>Manually select claims</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-plenful-gray-500 uppercase tracking-wider mb-1.5">Include in report</label>
                <div className="space-y-2">
                  {["Evidence chain for each claim", "AI confidence scores & rationale", "Analyst decision log with timestamps", "Clinical source documents (de-identified)"].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-plenful-gray-300 text-plenful-teal focus:ring-plenful-teal" />
                      <span className="text-sm text-plenful-gray-700">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAuditModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-plenful-gray-600 border border-plenful-gray-200 rounded-xl hover:bg-plenful-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAuditModal(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-plenful-teal rounded-xl hover:bg-plenful-teal-dark transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Generate & Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
