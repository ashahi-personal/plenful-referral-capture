"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const CLAIMS = [
  { id: "RC-2026-04821", mrn: "MRN-889421", patient: "Maria S.", prescriber: "Dr. James Chen, NPI 1234567890", specialist: "Dr. Lisa Park — Rheumatology", drug: "Humira (adalimumab)", confidence: 96, status: "pending", priority: "high", evidence: "Outgoing referral order + specialist consult note found", date: "2026-03-08", savings: 7200 },
  { id: "RC-2026-04819", mrn: "MRN-667234", patient: "Robert J.", prescriber: "Dr. Priya Mehta, NPI 9876543210", specialist: "Dr. Alan Foster — Oncology", drug: "Keytruda (pembrolizumab)", confidence: 92, status: "pending", priority: "high", evidence: "Referral scheduling language in clinician notes", date: "2026-03-08", savings: 12400 },
  { id: "RC-2026-04815", mrn: "MRN-443198", patient: "Diane K.", prescriber: "Dr. Marcus Webb, NPI 5678901234", specialist: "Dr. Sarah Nguyen — Endocrinology", drug: "Ozempic (semaglutide)", confidence: 88, status: "pending", priority: "medium", evidence: "Care coordination note + external provider NPI mismatch", date: "2026-03-07", savings: 4800 },
  { id: "RC-2026-04812", mrn: "MRN-221067", patient: "Thomas R.", prescriber: "Dr. Angela Torres, NPI 3456789012", specialist: "Dr. Kevin Liu — Gastroenterology", drug: "Stelara (ustekinumab)", confidence: 84, status: "flagged", priority: "medium", evidence: "Referral order found; consult note missing", date: "2026-03-07", savings: 8900 },
  { id: "RC-2026-04808", mrn: "MRN-558934", patient: "Susan L.", prescriber: "Dr. William Hayes, NPI 7890123456", specialist: "Dr. Rachel Kim — Dermatology", drug: "Skyrizi (risankizumab)", confidence: 79, status: "pending", priority: "medium", evidence: "Specialist scheduling + prescription pattern match", date: "2026-03-06", savings: 6100 },
  { id: "RC-2026-04801", mrn: "MRN-334521", patient: "James W.", prescriber: "Dr. Olivia Martinez, NPI 2345678901", specialist: "Dr. David Patel — Neurology", drug: "Ocrevus (ocrelizumab)", confidence: 73, status: "flagged", priority: "low", evidence: "Weak referral signal — follow up recommended", date: "2026-03-06", savings: 11200 },
  { id: "RC-2026-04798", mrn: "MRN-112889", patient: "Patricia M.", prescriber: "Dr. Robert Chang, NPI 6789012345", specialist: "Dr. Emily Watson — Pulmonology", drug: "Dupixent (dupilumab)", confidence: 91, status: "approved", priority: "high", evidence: "Complete referral chain verified", date: "2026-03-05", savings: 5300 },
  { id: "RC-2026-04795", mrn: "MRN-990456", patient: "Michael B.", prescriber: "Dr. Sarah Johnson, NPI 4567890123", specialist: "Dr. Thomas Grant — Cardiology", drug: "Repatha (evolocumab)", confidence: 87, status: "approved", priority: "medium", evidence: "Referral order + care coordination confirmed", date: "2026-03-05", savings: 3800 },
];

type TabKey = "all" | "pending" | "flagged" | "approved";

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClaims = CLAIMS.filter((c) => {
    const matchesTab = activeTab === "all" || c.status === activeTab;
    const matchesSearch = searchQuery === "" ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.drug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: CLAIMS.length },
    { key: "pending", label: "Pending Review", count: CLAIMS.filter(c => c.status === "pending").length },
    { key: "flagged", label: "Flagged", count: CLAIMS.filter(c => c.status === "flagged").length },
    { key: "approved", label: "Approved", count: CLAIMS.filter(c => c.status === "approved").length },
  ];

  const totalSavings = CLAIMS.reduce((sum, c) => sum + c.savings, 0);
  const pendingCount = CLAIMS.filter(c => c.status === "pending").length;
  const avgConfidence = Math.round(CLAIMS.reduce((sum, c) => sum + c.confidence, 0) / CLAIMS.length);

  return (
    <div className="min-h-screen bg-plenful-gray-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded bg-plenful-teal-light flex items-center justify-center">
              <svg className="w-4 h-4 text-plenful-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-plenful-dark">340B Referral Capture Workqueue</h1>
          </div>
          <p className="text-sm text-plenful-gray-500 ml-8">AI-identified referral claims pending analyst review</p>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1 - Total Claims Processed */}
          <div className="bg-white rounded-xl border border-plenful-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-plenful-gray-500">Referral candidates identified</span>
              <div className="w-8 h-8 rounded-lg bg-plenful-teal-light flex items-center justify-center">
                <svg className="w-4 h-4 text-plenful-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-plenful-dark">{CLAIMS.length}</p>
            <p className="text-xs text-plenful-green mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              +12 from last week
            </p>
          </div>

          {/* Card 2 - Pending Review */}
          <div className="bg-white rounded-xl border border-plenful-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-plenful-gray-500">Pending review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-plenful-dark">{pendingCount}</p>
            <p className="text-xs text-plenful-gray-400 mt-1">Requires analyst action</p>
          </div>

          {/* Card 3 - Avg Confidence */}
          <div className="bg-white rounded-xl border border-plenful-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-plenful-gray-500">Avg. AI confidence</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-plenful-dark">{avgConfidence}%</p>
            <p className="text-xs text-plenful-gray-400 mt-1">Across all candidates</p>
          </div>

          {/* Card 4 - Potential Savings */}
          <div className="bg-white rounded-xl border border-plenful-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-plenful-gray-500">Potential dollar value</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-plenful-dark">${totalSavings.toLocaleString()}</p>
            <p className="text-xs text-plenful-green mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              Estimated annual capture
            </p>
          </div>
        </div>

        {/* Donut Chart + Table Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Donut Chart Card */}
          <div className="bg-white rounded-xl border border-plenful-gray-200 p-6">
            <h3 className="text-sm font-medium text-plenful-gray-700 mb-4">Claims processed today</h3>
            <div className="flex justify-center mb-4">
              <svg width="140" height="140" viewBox="0 0 140 140">
                {/* Background circle */}
                <circle cx="70" cy="70" r="55" fill="none" stroke="#E5E7EB" strokeWidth="18" />
                {/* Auto-reviewed (teal) - 91% */}
                <circle cx="70" cy="70" r="55" fill="none" stroke="#0F766E" strokeWidth="18"
                  strokeDasharray={`${0.91 * 2 * Math.PI * 55} ${2 * Math.PI * 55}`}
                  strokeDashoffset="0" transform="rotate(-90 70 70)" strokeLinecap="round" />
                {/* Manually reviewed (light teal) - 4% */}
                <circle cx="70" cy="70" r="55" fill="none" stroke="#5EEAD4" strokeWidth="18"
                  strokeDasharray={`${0.04 * 2 * Math.PI * 55} ${2 * Math.PI * 55}`}
                  strokeDashoffset={`${-0.91 * 2 * Math.PI * 55}`} transform="rotate(-90 70 70)" strokeLinecap="round" />
                {/* Pending (orange) - 5% */}
                <circle cx="70" cy="70" r="55" fill="none" stroke="#F59E0B" strokeWidth="18"
                  strokeDasharray={`${0.05 * 2 * Math.PI * 55} ${2 * Math.PI * 55}`}
                  strokeDashoffset={`${-0.95 * 2 * Math.PI * 55}`} transform="rotate(-90 70 70)" strokeLinecap="round" />
                <text x="70" y="66" textAnchor="middle" className="text-2xl font-semibold" fill="#0F2D2D" fontSize="24" fontWeight="600">324</text>
                <text x="70" y="84" textAnchor="middle" fill="#6B7280" fontSize="11">total</text>
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                  <span className="text-plenful-gray-600">Auto reviewed</span>
                </div>
                <span className="font-medium text-plenful-gray-800">295</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5EEAD4]" />
                  <span className="text-plenful-gray-600">Manually reviewed</span>
                </div>
                <span className="font-medium text-plenful-gray-800">13</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-plenful-gray-600">Pending follow up</span>
                </div>
                <span className="font-medium text-plenful-gray-800">16</span>
              </div>
            </div>
          </div>

          {/* Claims Table */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-plenful-gray-200">
            {/* Table Header with Tabs */}
            <div className="px-5 pt-5 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 bg-plenful-gray-50 rounded-lg p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.key
                          ? "bg-white text-plenful-dark shadow-sm border border-plenful-gray-200"
                          : "text-plenful-gray-500 hover:text-plenful-gray-700"
                      }`}
                    >
                      {tab.label}
                      <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-plenful-teal" : "text-plenful-gray-400"}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-plenful-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-plenful-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-plenful-teal focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b border-plenful-gray-100">
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Claim</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Referred Specialist</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Drug</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Flags</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => (
                    <tr key={claim.id} className="border-b border-plenful-gray-50 hover:bg-plenful-gray-50/50 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5">
                        <Link href="/review" className="text-sm font-medium text-plenful-teal-dark hover:underline">{claim.id}</Link>
                        <p className="text-xs text-plenful-gray-400 mt-0.5">{claim.date}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-plenful-gray-800">{claim.patient}</p>
                        <p className="text-xs text-plenful-gray-400">{claim.mrn}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-plenful-gray-700">{claim.specialist}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-plenful-gray-700">{claim.drug}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-1.5 rounded-full bg-plenful-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                claim.confidence >= 90 ? "bg-plenful-teal" :
                                claim.confidence >= 80 ? "bg-amber-400" : "bg-orange-400"
                              }`}
                              style={{ width: `${claim.confidence}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            claim.confidence >= 90 ? "text-plenful-teal-dark" :
                            claim.confidence >= 80 ? "text-amber-600" : "text-orange-600"
                          }`}>{claim.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          {claim.priority === "high" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">High value</span>
                          )}
                          {claim.confidence < 80 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Low conf.</span>
                          )}
                          {claim.evidence.includes("missing") && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">Doc needed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          claim.status === "approved" ? "bg-green-50 text-green-700" :
                          claim.status === "flagged" ? "bg-amber-50 text-amber-700" :
                          "bg-blue-50 text-blue-700"
                        }`}>
                          {claim.status === "approved" && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                          {claim.status === "flagged" && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                          {claim.status === "pending" && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-plenful-gray-800">${claim.savings.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 flex items-center justify-between border-t border-plenful-gray-100">
              <span className="text-sm text-plenful-gray-500">Rows per page: <span className="font-medium">8</span></span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-plenful-gray-500">1–{filteredClaims.length} of {filteredClaims.length}</span>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-plenful-gray-100 text-plenful-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button className="p-1 rounded hover:bg-plenful-gray-100 text-plenful-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
