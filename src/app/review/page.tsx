"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface EvidenceItem {
  id: string;
  type: string;
  source: string;
  date: string;
  excerpt: string;
  relevance: "strong" | "moderate" | "weak";
}

interface QuestionState {
  status: "pending" | "agreed" | "overridden";
  answer: string;
  overrideNote: string;
}

const clinicalQuestions = [
  {
    id: "q1",
    question: "Was the patient referred to an external specialist for this condition?",
    confidence: 96,
    aiAnswer: "yes",
    rationale: "EHR contains outgoing referral order dated 08/15/2025 from Dr. Chen to Dr. Park (Rheumatology) for evaluation of moderate-to-severe rheumatoid arthritis with biologic therapy consideration.",
    evidenceIds: ["e1", "e2"],
  },
  {
    id: "q2",
    question: "Does the specialist's consult note confirm a care relationship?",
    confidence: 92,
    aiAnswer: "yes",
    rationale: "Dr. Park's consult note documents evaluation of patient for rheumatoid arthritis management. Notes indicate 'patient referred by Dr. Chen for biologic therapy evaluation' and recommends Humira initiation given inadequate response to methotrexate.",
    evidenceIds: ["e3"],
  },
  {
    id: "q3",
    question: "Is the prescribed medication consistent with the referral specialty?",
    confidence: 99,
    aiAnswer: "yes",
    rationale: "Humira (adalimumab) is a standard biologic treatment for moderate-to-severe rheumatoid arthritis. Rheumatology specialist prescribing pattern is consistent with referral indication.",
    evidenceIds: ["e3"],
  },
  {
    id: "q4",
    question: "Was the medication prescribed within the episode of care established by the referral?",
    confidence: 88,
    aiAnswer: "yes",
    rationale: "Referral order dated 08/15/2025, specialist consult on 09/02/2025, and Humira prescription initiated 09/10/2025. All events fall within a continuous 26-day care episode. Prescription follows directly from specialist recommendation documented in consult note.",
    evidenceIds: ["e2", "e4"],
  },
];

const evidenceItems: EvidenceItem[] = [
  {
    id: "e1",
    type: "Clinician Progress Note",
    source: "EHR — Epic FHIR",
    date: "Aug 12, 2025",
    excerpt: "\"...discussed escalation to biologic therapy with patient. Referring to rheumatology for specialized evaluation given inadequate response to methotrexate. Will coordinate with Dr. Park's office for timely appointment.\"",
    relevance: "strong",
  },
  {
    id: "e2",
    type: "Referral Order",
    source: "EHR — Epic FHIR",
    date: "Aug 15, 2025",
    excerpt: "Outgoing referral to Dr. Lisa Park, Rheumatology. Reason: Evaluation for biologic therapy — moderate to severely active rheumatoid arthritis, inadequate response to conventional DMARDs. Priority: Routine.",
    relevance: "strong",
  },
  {
    id: "e3",
    type: "Specialist Consult Note",
    source: "EHR — Epic FHIR",
    date: "Sep 2, 2025",
    excerpt: "\"Patient referred by Dr. Chen for evaluation of rheumatoid arthritis management. Reviewed imaging and labs. DAS28 score 4.8 indicating moderate disease activity. Recommending initiation of adalimumab (Humira) given inadequate response to methotrexate.\"",
    relevance: "strong",
  },
  {
    id: "e4",
    type: "Care Coordination Note",
    source: "EHR — Epic FHIR",
    date: "Sep 15, 2025",
    excerpt: "\"Coordinated with Dr. Park's office regarding Humira start. Prior authorization initiated. Patient education materials provided. Follow-up scheduled in 8 weeks.\"",
    relevance: "moderate",
  },
];

export default function ReviewPage() {
  const router = useRouter();
  const [approvalStatus, setApprovalStatus] = useState<"none" | "approved" | "flagged" | "rejected">("none");
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>(() => {
    const initial: Record<string, QuestionState> = {};
    clinicalQuestions.forEach(q => {
      initial[q.id] = { status: "pending", answer: q.aiAnswer, overrideNote: "" };
    });
    return initial;
  });
  const [overridingQuestion, setOverridingQuestion] = useState<string | null>(null);
  const [tempAnswer, setTempAnswer] = useState<string>("");
  const [tempNote, setTempNote] = useState<string>("");
  const [analystNotes, setAnalystNotes] = useState("");
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [activeModal, setActiveModal] = useState<"evidence" | "audit" | null>(null);
  const [isSticky, setIsSticky] = useState(false);

  const overallConfidence = 96;
  const resolvedCount = Object.values(questionStates).filter(s => s.status !== "pending").length;
  const allResolved = resolvedCount === clinicalQuestions.length;
  const hasOverride = Object.values(questionStates).some(s => s.status === "overridden" && s.answer === "no");

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAgree = (qId: string) => {
    const q = clinicalQuestions.find(cq => cq.id === qId);
    setQuestionStates(prev => ({
      ...prev,
      [qId]: { status: "agreed", answer: q?.aiAnswer || "yes", overrideNote: "" }
    }));
    setOverridingQuestion(null);
  };

  const startOverride = (qId: string) => {
    const current = questionStates[qId];
    setOverridingQuestion(qId);
    setTempAnswer(current.answer === "yes" ? "no" : "yes");
    setTempNote(current.overrideNote);
  };

  const saveOverride = (qId: string) => {
    setQuestionStates(prev => ({
      ...prev,
      [qId]: { status: "overridden", answer: tempAnswer, overrideNote: tempNote }
    }));
    setOverridingQuestion(null);
    setTempAnswer("");
    setTempNote("");
  };

  const resetQuestion = (qId: string) => {
    const q = clinicalQuestions.find(cq => cq.id === qId);
    setQuestionStates(prev => ({
      ...prev,
      [qId]: { status: "pending", answer: q?.aiAnswer || "yes", overrideNote: "" }
    }));
    setOverridingQuestion(null);
  };

  const getEvidenceForQuestion = (ids: string[]) => evidenceItems.filter(e => ids.includes(e.id));

  return (
    <div className="min-h-screen bg-plenful-gray-50">
      <Navbar />

      {/* Sticky Progress Bar */}
      {isSticky && approvalStatus === "none" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-plenful-gray-200 shadow-sm">
          <div className="max-w-[900px] mx-auto px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-plenful-dark">RC-2026-04821</span>
              <span className="text-xs text-plenful-gray-400">&middot;</span>
              <span className="text-sm font-bold text-plenful-teal-dark">$28,400</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {clinicalQuestions.map((q) => {
                  const state = questionStates[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        state.status === "agreed" ? "bg-plenful-teal" :
                        state.status === "overridden" ? "bg-amber-400" :
                        "bg-plenful-gray-200"
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-plenful-gray-500">
                {resolvedCount}/{clinicalQuestions.length} reviewed
              </span>
              {allResolved && (
                <span className="text-xs font-medium text-plenful-teal bg-plenful-teal-light px-2 py-0.5 rounded-full">Ready</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/queue" className="text-plenful-teal hover:underline">Review Queue</Link>
          <svg className="w-4 h-4 text-plenful-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          <span className="text-plenful-gray-600">RC-2026-04821</span>
        </div>

        {/* Claim Header */}
        <div className="bg-white rounded-xl border border-plenful-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-semibold text-plenful-dark">Claim RC-2026-04821</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Pending Review</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">High value</span>
              </div>
              <p className="text-sm text-plenful-gray-500">Identified on March 8, 2026 &middot; AI Pipeline Stage 3 complete</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setActiveModal("evidence")}
                className="p-2 text-plenful-gray-400 border border-plenful-gray-200 rounded-lg hover:bg-plenful-gray-50 hover:text-plenful-gray-600 transition-colors"
                title="Evidence chain"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
              <button
                onClick={() => setActiveModal("audit")}
                className="p-2 text-plenful-gray-400 border border-plenful-gray-200 rounded-lg hover:bg-plenful-gray-50 hover:text-plenful-gray-600 transition-colors"
                title="Audit trail"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-plenful-magenta/10 to-pink-50 rounded-xl border border-plenful-magenta/20">
                <svg className="w-5 h-5 text-plenful-magenta" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-lg font-bold text-plenful-magenta">{overallConfidence}%</span>
                <span className="text-xs text-plenful-magenta/70">Confidence</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-6 pt-6 border-t border-plenful-gray-100 items-start">
            <div>
              <p className="text-xs text-plenful-gray-400 uppercase tracking-wider mb-1">Patient</p>
              <p className="text-sm font-medium text-plenful-gray-800">Maria S.</p>
              <p className="text-xs text-plenful-gray-500">MRN-889421</p>
            </div>
            <div>
              <p className="text-xs text-plenful-gray-400 uppercase tracking-wider mb-1">Referred By</p>
              <p className="text-sm font-medium text-plenful-gray-800">Dr. James Chen</p>
              <p className="text-xs text-plenful-gray-500">NPI 1891734562</p>
            </div>
            <div>
              <p className="text-xs text-plenful-gray-400 uppercase tracking-wider mb-1">Specialist</p>
              <p className="text-sm font-medium text-plenful-gray-800">Dr. Lisa Park</p>
              <p className="text-xs text-plenful-gray-500">Rheumatology</p>
            </div>
            <div>
              <p className="text-xs text-plenful-gray-400 uppercase tracking-wider mb-1">Drug</p>
              <p className="text-sm font-medium text-plenful-gray-800">Humira</p>
              <p className="text-xs text-plenful-gray-500">adalimumab</p>
            </div>
            <div>
              <p className="text-xs text-plenful-gray-400 uppercase tracking-wider mb-1">Est. 340B Savings</p>
              <p className="text-sm font-bold text-plenful-teal-dark">$28,400</p>
              <p className="text-xs text-plenful-gray-500">per fill</p>
            </div>
          </div>
        </div>

        {/* Progress Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-plenful-gray-700 uppercase tracking-wider">Clinical Verification</h2>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {clinicalQuestions.map((q) => {
                const state = questionStates[q.id];
                return (
                  <div
                    key={q.id}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      state.status === "agreed" ? "bg-plenful-teal" :
                      state.status === "overridden" ? "bg-amber-400" :
                      "bg-plenful-gray-200"
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs text-plenful-gray-500">{resolvedCount} of {clinicalQuestions.length} reviewed</span>
            {allResolved && !hasOverride && (
              <span className="text-xs font-medium text-plenful-teal bg-plenful-teal-light px-2 py-0.5 rounded-full animate-pulse">Ready to approve</span>
            )}
            {allResolved && hasOverride && (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Override detected</span>
            )}
          </div>
        </div>

        {/* Clinical Questions — Single Column */}
        <div className="space-y-4 mb-8">
          {clinicalQuestions.map((q, qIndex) => {
            const state = questionStates[q.id];
            const isOverriding = overridingQuestion === q.id;
            const relatedEvidence = getEvidenceForQuestion(q.evidenceIds);

            return (
              <div
                key={q.id}
                className={`bg-white rounded-xl border p-6 transition-all ${
                  state.status === "agreed"
                    ? "border-plenful-teal/30 bg-plenful-teal-light/20"
                    : state.status === "overridden"
                    ? "border-amber-300/50 bg-amber-50/30"
                    : "border-plenful-gray-200"
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-plenful-gray-400 uppercase">Q{qIndex + 1}</span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        q.confidence >= 90
                          ? "bg-gradient-to-r from-plenful-magenta/10 to-pink-50 text-plenful-magenta border border-plenful-magenta/20"
                          : "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200"
                      }`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                        {q.confidence}%
                      </div>
                      {state.status === "agreed" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-plenful-teal-light text-plenful-teal-dark">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Agreed
                        </span>
                      )}
                      {state.status === "overridden" && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          Overridden
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-plenful-gray-800">{q.question}</p>
                  </div>
                </div>

                {/* AI Answer / Override Mode */}
                {!isOverriding ? (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-plenful-gray-400">AI Answer:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        state.answer === "yes" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {state.answer === "yes" ? "Yes" : "No"}
                      </span>
                    </div>
                    {state.status === "overridden" && state.answer !== q.aiAnswer && (
                      <span className="text-xs text-amber-600 italic">
                        (AI said {q.aiAnswer === "yes" ? "Yes" : "No"} — analyst overrode)
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-amber-50/50 border border-amber-200/50 rounded-lg">
                    <p className="text-xs font-medium text-amber-700 mb-2">Override AI Answer</p>
                    <div className="flex items-center gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer" onClick={() => setTempAnswer("yes")}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          tempAnswer === "yes" ? "border-plenful-teal bg-plenful-teal" : "border-plenful-gray-300"
                        }`}>
                          {tempAnswer === "yes" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm text-plenful-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer" onClick={() => setTempAnswer("no")}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          tempAnswer === "no" ? "border-plenful-teal bg-plenful-teal" : "border-plenful-gray-300"
                        }`}>
                          {tempAnswer === "no" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm text-plenful-gray-700">No</span>
                      </label>
                    </div>
                    {tempAnswer === "no" && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        Overriding to &quot;No&quot; may disqualify this 340B capture.
                      </div>
                    )}
                    <textarea
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="Explain why you're overriding the AI answer..."
                      className="w-full px-3 py-2 text-sm border border-plenful-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none h-16 mb-2"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setOverridingQuestion(null)} className="px-3 py-1.5 text-xs font-medium text-plenful-gray-500 hover:text-plenful-gray-700">
                        Cancel
                      </button>
                      <button
                        onClick={() => saveOverride(q.id)}
                        disabled={!tempNote.trim()}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Override
                      </button>
                    </div>
                  </div>
                )}

                {/* Evidence Excerpts (inline by default) */}
                <div className="space-y-2 mb-3">
                  {relatedEvidence.map((item) => (
                    <div key={item.id} className="bg-plenful-gray-50 rounded-lg p-3 border-l-2 border-plenful-teal/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-plenful-gray-700">{item.type}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          item.relevance === "strong" ? "bg-green-50 text-green-700" :
                          item.relevance === "moderate" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                        }`}>{item.relevance}</span>
                        <span className="text-xs text-plenful-gray-400">{item.source} &middot; {item.date}</span>
                      </div>
                      <p className="text-xs text-plenful-gray-600 leading-relaxed">{item.excerpt}</p>
                    </div>
                  ))}
                </div>

                {/* AI Reasoning */}
                <div className="mb-3 bg-plenful-gray-50/70 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg className="w-3.5 h-3.5 text-plenful-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    <span className="text-xs font-medium text-plenful-gray-400 uppercase tracking-wider">AI Reasoning</span>
                  </div>
                  <p className="text-sm text-plenful-gray-500 leading-relaxed">{q.rationale}</p>
                </div>

                {/* Override Note */}
                {state.status === "overridden" && state.overrideNote && !isOverriding && (
                  <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200/50 rounded-lg">
                    <p className="text-xs font-medium text-amber-700 mb-0.5">Analyst Override Note</p>
                    <p className="text-xs text-amber-600">{state.overrideNote}</p>
                  </div>
                )}

                {/* Action Footer */}
                <div className="mt-4 pt-4 border-t border-plenful-gray-100 flex items-center justify-end">
                  {state.status === "pending" && !isOverriding ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startOverride(q.id)}
                        className="px-3 py-1.5 text-xs font-medium text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                      >
                        Override
                      </button>
                      <button
                        onClick={() => handleAgree(q.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-plenful-teal rounded-lg hover:bg-plenful-teal-dark transition-colors"
                      >
                        Agree with AI
                      </button>
                    </div>
                  ) : state.status !== "pending" && !isOverriding ? (
                    <button onClick={() => resetQuestion(q.id)} className="text-xs text-plenful-gray-400 hover:text-plenful-gray-600 underline">Reset</button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Disclaimer */}
        <p className="text-xs text-plenful-gray-400 italic text-center mb-6">Plenful AI can make mistakes. Review all evidence and reasoning carefully before making a decision.</p>

        {/* Analyst Decision Panel */}
        {approvalStatus === "none" ? (
          <div className="bg-white rounded-xl border border-plenful-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-plenful-gray-700 uppercase tracking-wider mb-4">Analyst Decision</h3>

            {!allResolved && (
              <div className="mb-4 p-3 bg-plenful-gray-50 rounded-lg border border-plenful-gray-200">
                <p className="text-sm text-plenful-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4 text-plenful-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Review all {clinicalQuestions.length} questions to unlock approval
                </p>
                <div className="mt-2 flex h-1.5 rounded-full overflow-hidden bg-plenful-gray-200">
                  <div className="bg-plenful-teal rounded-full transition-all duration-300" style={{ width: `${(resolvedCount / clinicalQuestions.length) * 100}%` }} />
                </div>
              </div>
            )}

            {hasOverride && allResolved && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  You overrode one or more AI answers to &quot;No.&quot; This claim may not qualify for 340B capture.
                </p>
              </div>
            )}

            <div className="mb-4">
              <textarea
                value={analystNotes}
                onChange={(e) => setAnalystNotes(e.target.value)}
                placeholder="Add decision rationale (optional)..."
                className="w-full px-3 py-2 text-sm border border-plenful-gray-200 rounded-lg bg-plenful-gray-50 focus:outline-none focus:ring-2 focus:ring-plenful-teal focus:border-transparent resize-none h-20"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setApprovalStatus("approved")}
                disabled={!allResolved}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                  allResolved
                    ? "text-white bg-plenful-teal hover:bg-plenful-teal-dark"
                    : "text-plenful-gray-400 bg-plenful-gray-100 cursor-not-allowed"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Approve &amp; Capture
              </button>
              <button
                onClick={() => setApprovalStatus("flagged")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Flag for Follow-up
              </button>
            </div>
            <button
              onClick={() => setApprovalStatus("rejected")}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-plenful-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Reject — Not a referral
            </button>
          </div>
        ) : (
          <div className={`rounded-xl border p-6 mb-6 text-center ${
            approvalStatus === "approved" ? "bg-green-50 border-green-200" :
            approvalStatus === "flagged" ? "bg-amber-50 border-amber-200" :
            "bg-red-50 border-red-200"
          }`}>
            <svg className={`w-10 h-10 mx-auto mb-3 ${
              approvalStatus === "approved" ? "text-green-600" :
              approvalStatus === "flagged" ? "text-amber-600" : "text-red-600"
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {approvalStatus === "approved" && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {approvalStatus === "flagged" && <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {approvalStatus === "rejected" && <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
            <p className={`text-lg font-semibold ${
              approvalStatus === "approved" ? "text-green-700" :
              approvalStatus === "flagged" ? "text-amber-700" : "text-red-700"
            }`}>
              {approvalStatus === "approved" ? "Claim Approved & Captured" :
               approvalStatus === "flagged" ? "Flagged for Follow-up" : "Claim Rejected"}
            </p>
            <p className="text-sm text-plenful-gray-500 mt-1">Decision recorded &middot; Audit trail updated</p>
            {analystNotes && (
              <p className="text-sm text-plenful-gray-500 mt-3 italic border-t border-plenful-gray-200 pt-3">&ldquo;{analystNotes}&rdquo;</p>
            )}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => router.push("/queue")}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-plenful-teal rounded-xl hover:bg-plenful-teal-dark transition-colors"
              >
                Next Claim
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
              <button onClick={() => setApprovalStatus("none")} className="text-sm text-plenful-gray-400 hover:text-plenful-gray-600 underline">Undo</button>
            </div>
          </div>
        )}

      </div>

      {/* Evidence Chain Modal */}
      {activeModal === "evidence" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[640px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-plenful-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-plenful-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <h3 className="text-base font-semibold text-plenful-dark">Evidence Chain</h3>
                <span className="text-xs text-plenful-gray-400 bg-plenful-gray-100 px-2 py-0.5 rounded-full">{evidenceItems.length} documents</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg text-plenful-gray-400 hover:text-plenful-gray-600 hover:bg-plenful-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="space-y-4">
                {evidenceItems.map((item, index) => (
                  <div key={item.id} className="relative">
                    {index < evidenceItems.length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-plenful-gray-200" style={{ height: "calc(100% + 8px)" }} />
                    )}
                    <div className="flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                        item.relevance === "strong" ? "bg-plenful-teal" :
                        item.relevance === "moderate" ? "bg-amber-400" : "bg-plenful-gray-300"
                      }`}>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-plenful-gray-800">{item.type}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            item.relevance === "strong" ? "bg-green-50 text-green-700" :
                            item.relevance === "moderate" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                          }`}>{item.relevance}</span>
                        </div>
                        <p className="text-xs text-plenful-gray-400 mb-1">{item.source} &middot; {item.date}</p>
                        <p className="text-xs text-plenful-gray-600 leading-relaxed">{item.excerpt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {activeModal === "audit" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[520px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-plenful-gray-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-plenful-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-base font-semibold text-plenful-dark">Processing Audit Trail</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1.5 rounded-lg text-plenful-gray-400 hover:text-plenful-gray-600 hover:bg-plenful-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="space-y-4">
                {[
                  { stage: "Stage 1: Ingest", status: "complete", time: "Mar 8, 10:02 AM", detail: "TPA claims + EHR encounters normalized" },
                  { stage: "Stage 2: Identify", status: "complete", time: "Mar 8, 10:03 AM", detail: "NPI mismatch flagged — external specialist" },
                  { stage: "Stage 3: Mine EHR", status: "complete", time: "Mar 8, 10:05 AM", detail: "4 evidence documents extracted, 96% confidence" },
                  { stage: "Stage 4: Close Loop", status: "complete", time: "Mar 8, 10:06 AM", detail: "Consult note confirmed in EHR — no outreach needed" },
                  { stage: "Stage 5: Approve", status: "waiting", time: "Pending", detail: "Awaiting analyst review" },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      step.status === "complete" ? "bg-plenful-teal-light text-plenful-teal" : "bg-plenful-gray-100 text-plenful-gray-400"
                    }`}>
                      {step.status === "complete" ? (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-plenful-gray-700">{step.stage}</p>
                      <p className="text-xs text-plenful-gray-400">{step.time} — {step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
