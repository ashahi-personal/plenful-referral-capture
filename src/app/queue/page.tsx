"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

const CLAIMS = [
  { id: "RC-2026-04821", mrn: "MRN-889421", patient: "Maria S.", prescriber: "Dr. James Chen, NPI 1891734562", specialist: "Dr. Lisa Park — Rheumatology", drug: "Humira (adalimumab)", confidence: 96, status: "pending", priority: "high", evidence: "Outgoing referral order + specialist consult note found", date: "2026-03-08", savings: 28400 },
  { id: "RC-2026-04819", mrn: "MRN-667234", patient: "Robert J.", prescriber: "Dr. Priya Mehta, NPI 1326847950", specialist: "Dr. Alan Foster — Oncology", drug: "Keytruda (pembrolizumab)", confidence: 92, status: "pending", priority: "high", evidence: "Referral scheduling language in clinician notes", date: "2026-03-08", savings: 52800 },
  { id: "RC-2026-04815", mrn: "MRN-443198", patient: "Diane K.", prescriber: "Dr. Marcus Webb, NPI 1750382916", specialist: "Dr. Sarah Nguyen — Endocrinology", drug: "Ozempic (semaglutide)", confidence: 88, status: "pending", priority: "medium", evidence: "Care coordination note + external provider NPI mismatch", date: "2026-03-07", savings: 4200 },
  { id: "RC-2026-04812", mrn: "MRN-221067", patient: "Thomas R.", prescriber: "Dr. Angela Torres, NPI 1284693750", specialist: "Dr. Kevin Liu — Gastroenterology", drug: "Stelara (ustekinumab)", confidence: 84, status: "flagged", priority: "medium", evidence: "Referral order confirmed — awaiting specialist consult note from Dr. Liu's office", date: "2026-03-07", savings: 14600 },
  { id: "RC-2026-04808", mrn: "MRN-558934", patient: "Susan L.", prescriber: "Dr. William Hayes, NPI 1932567048", specialist: "Dr. Rachel Kim — Dermatology", drug: "Skyrizi (risankizumab)", confidence: 79, status: "pending", priority: "medium", evidence: "Specialist scheduling + prescription pattern match", date: "2026-03-06", savings: 18300 },
  { id: "RC-2026-04801", mrn: "MRN-334521", patient: "James W.", prescriber: "Dr. Olivia Martinez, NPI 1467829305", specialist: "Dr. David Patel — Neurology", drug: "Ocrevus (ocrelizumab)", confidence: 73, status: "flagged", priority: "low", evidence: "No specialist consult note in EHR or HIE — fax request sent to Dr. Patel", date: "2026-03-06", savings: 26100 },
  { id: "RC-2026-04798", mrn: "MRN-112889", patient: "Patricia M.", prescriber: "Dr. Robert Chang, NPI 1658203947", specialist: "Dr. Emily Watson — Pulmonology", drug: "Dupixent (dupilumab)", confidence: 91, status: "approved", priority: "high", evidence: "Complete referral chain verified", date: "2026-03-05", savings: 15800 },
  { id: "RC-2026-04795", mrn: "MRN-990456", patient: "Michael B.", prescriber: "Dr. Sarah Johnson, NPI 1543976281", specialist: "Dr. Thomas Grant — Cardiology", drug: "Repatha (evolocumab)", confidence: 87, status: "approved", priority: "medium", evidence: "Referral order + care coordination confirmed", date: "2026-03-05", savings: 6200 },
];

type TabKey = "all" | "pending" | "flagged" | "approved";
type SortColumn = "confidence" | "date" | "savings" | "status" | "drug" | null;
type SortDirection = "asc" | "desc";
type DateFilter = "all_pending" | "today" | "last_7" | "last_30";

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all_pending");


  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const dateFilteredClaims = useMemo(() => {
    if (dateFilter === "all_pending") return CLAIMS.filter(c => c.status !== "approved");
    if (dateFilter === "today") return CLAIMS.filter(c => c.date === "2026-03-08");
    return CLAIMS;
  }, [dateFilter]);

  const barStats = useMemo(() => {
    switch (dateFilter) {
      case "all_pending":
        return { label: "50 referrals processed today", total: 50, auto: 20, reviewed: 22, awaiting: 8 };
      case "today":
        return { label: "50 referrals processed today", total: 50, auto: 20, reviewed: 22, awaiting: 8 };
      case "last_7":
        return { label: "312 referrals this week", total: 312, auto: 140, reviewed: 152, awaiting: 20 };
      case "last_30":
        return { label: "1,247 referrals this month", total: 1247, auto: 580, reviewed: 612, awaiting: 55 };
    }
  }, [dateFilter]);

  const filteredAndSortedClaims = useMemo(() => {
    let result = dateFilteredClaims.filter((c) => {
      const matchesTab = activeTab === "all" || c.status === activeTab;
      const matchesSearch = searchQuery === "" ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.drug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specialist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        let comparison = 0;
        switch (sortColumn) {
          case "confidence":
            comparison = a.confidence - b.confidence;
            break;
          case "date":
            comparison = a.date.localeCompare(b.date);
            break;
          case "savings":
            comparison = a.savings - b.savings;
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "drug":
            comparison = a.drug.localeCompare(b.drug);
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [activeTab, searchQuery, sortColumn, sortDirection, dateFilteredClaims]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "All", count: dateFilteredClaims.length },
    { key: "pending", label: "Pending Review", count: dateFilteredClaims.filter(c => c.status === "pending").length },
    { key: "flagged", label: "Flagged", count: dateFilteredClaims.filter(c => c.status === "flagged").length },
    { key: "approved", label: "Approved", count: dateFilteredClaims.filter(c => c.status === "approved").length },
  ];

  const totalSavings = CLAIMS.reduce((sum, c) => sum + c.savings, 0);
  const pendingCount = CLAIMS.filter(c => c.status === "pending").length;
  const avgConfidence = Math.round(CLAIMS.reduce((sum, c) => sum + c.confidence, 0) / CLAIMS.length);

  const SortArrow = ({ column }: { column: SortColumn }) => (
    <span className={`ml-1 inline-flex ${sortColumn === column ? "text-plenful-teal" : "text-plenful-gray-300"}`}>
      {sortColumn === column && sortDirection === "asc" ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      )}
    </span>
  );

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
              +12 vs. prior week
            </p>
          </div>

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

        {/* Claims Table */}
        <div>
          {/* Horizontal Processing Bar with Date Chips */}
          <div className="bg-white rounded-xl border border-plenful-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-plenful-gray-50 rounded-lg p-0.5">
                  {(["all_pending", "today", "last_7", "last_30"] as DateFilter[]).map((filter) => {
                    const labels: Record<DateFilter, string> = {
                      all_pending: "All pending",
                      today: "Today",
                      last_7: "Last 7 days",
                      last_30: "Last 30 days",
                    };
                    return (
                      <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                          dateFilter === filter
                            ? "bg-white text-plenful-dark shadow-sm border border-plenful-gray-200"
                            : "text-plenful-gray-500 hover:text-plenful-gray-700"
                        }`}
                      >
                        {labels[filter]}
                      </button>
                    );
                  })}
                </div>
                <span className="text-sm font-medium text-plenful-gray-700">{barStats.label}</span>
                <span className="text-xs text-plenful-gray-400">&middot; {dateFilteredClaims.length} surfaced for review</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  <span className="text-plenful-gray-500">Auto-approved</span>
                  <span className="font-medium text-plenful-gray-700">{barStats.auto}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#5EEAD4]" />
                  <span className="text-plenful-gray-500">Analyst reviewed</span>
                  <span className="font-medium text-plenful-gray-700">{barStats.reviewed}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span className="text-plenful-gray-500">Awaiting review</span>
                  <span className="font-medium text-plenful-gray-700">{barStats.awaiting}</span>
                </div>
              </div>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-plenful-gray-100">
              <div className="bg-[#0F766E] rounded-l-full" style={{ width: `${(barStats.auto / barStats.total) * 100}%` }} />
              <div className="bg-[#5EEAD4]" style={{ width: `${(barStats.reviewed / barStats.total) * 100}%` }} />
              <div className="bg-[#F59E0B] rounded-r-full" style={{ width: `${(barStats.awaiting / barStats.total) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-plenful-gray-200">
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
                <div className="flex items-center gap-2">
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b border-plenful-gray-100">
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider cursor-pointer hover:text-plenful-gray-700 select-none"
                      onClick={() => handleSort("date")}
                    >
                      Claim<SortArrow column="date" />
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Referred Specialist</th>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider cursor-pointer hover:text-plenful-gray-700 select-none"
                      onClick={() => handleSort("drug")}
                    >
                      Drug<SortArrow column="drug" />
                    </th>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider cursor-pointer hover:text-plenful-gray-700 select-none"
                      onClick={() => handleSort("confidence")}
                    >
                      Confidence<SortArrow column="confidence" />
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider">Flags</th>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider cursor-pointer hover:text-plenful-gray-700 select-none"
                      onClick={() => handleSort("status")}
                    >
                      Status<SortArrow column="status" />
                    </th>
                    <th
                      className="px-5 py-3 text-left text-xs font-medium text-plenful-gray-500 uppercase tracking-wider cursor-pointer hover:text-plenful-gray-700 select-none"
                      onClick={() => handleSort("savings")}
                    >
                      340B Value<SortArrow column="savings" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedClaims.map((claim) => (
                    <tr key={claim.id} onClick={() => router.push(`/review?id=${claim.id}`)} className="border-b border-plenful-gray-50 hover:bg-plenful-gray-50/50 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-plenful-teal-dark">{claim.id}</span>
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
                          {(claim.evidence.toLowerCase().includes("awaiting") || claim.evidence.toLowerCase().includes("no specialist") || claim.evidence.toLowerCase().includes("missing")) && (
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

            <div className="px-5 py-3 flex items-center justify-between border-t border-plenful-gray-100">
              <span className="text-sm text-plenful-gray-500">Rows per page: <span className="font-medium">8</span></span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-plenful-gray-500">1–{filteredAndSortedClaims.length} of {filteredAndSortedClaims.length}</span>
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
