import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

import FileUpload from "../components/analysis/FileUpload";
import RiskScoreGauge from "../components/analysis/RiskScoreGauge";
import DocumentSummary from "../components/analysis/DocumentSummary";
import Loader from "../components/Loader";
import LLMDisclaimerBanner from "../components/analysis/LLMDisclaimerBanner";
import { pdf } from "@react-pdf/renderer";
import ReportDocument from "../components/analysis/ReportDocument";
import RiskClauseList from "../components/analysis/RiskClauseList";
import CaseStudyList from "../components/analysis/CaseStudyList";

const base = import.meta.env.VITE_API_BASE;

async function handleAnalysisGeneratePDF(summary, riskScore, riskClauses, setLoading) {
  if (!summary) return;
  try {
    if (setLoading) setLoading(true);
    const computedScore = Number.isFinite(riskScore) ? Math.max(0, Math.min(100, Math.round(riskScore))) : 0;
    const blob = await pdf(<ReportDocument summary={summary} riskScore={computedScore} riskClauses={riskClauses || []} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Docspect-report.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("PDF generation failed", e);
    alert("Failed to generate PDF");
  } finally {
    if (setLoading) setLoading(false);
  }
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    console.log("AnalysisPage Mounted. Location State Received:", location.state);
    if (analysisData) {
      console.log("AnalysisPage: Data successfully set to state.");
    } else {
      console.warn("AnalysisPage: analysisData is null. Showing upload fallback UI.");
    }
  }, [location.state, analysisData]);

  const handleFileUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("document", file);
    try {
      const res = await axios.post(`${base}/api/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const risks = res.data.risks ?? [];
      const llmWarnings = res.data.llmWarnings ?? [];
      const llmDisclaimerRequired = res.data.llmDisclaimerRequired ?? false;
      const aiRiskScore = Number.isFinite(res.data.riskScore) ? res.data.riskScore : 0;
      setAnalysisData({
        summary: res.data.summary ?? res.data,
        riskClauses: risks,
        riskScore: aiRiskScore,
        llmWarnings,
        llmDisclaimerRequired,
      });
      console.log("✅ Analysis complete. State updated with AI risk score:", aiRiskScore);
    } catch (err) {
      console.error("❌ File analysis failed:", err);
      alert("Failed to analyze document. Please check console for details.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Loader
        message="Analyzing your document…"
        subMessages={[
          "Uploading securely…",
          "Extracting text and structure…",
          "Detecting risky clauses…",
          "Summarizing key points…",
        ]}
      />
    );
  }

  if (!analysisData) {
    return <FileUpload onUpload={handleFileUpload} loading={loading} />;
  }

  const slides = ["Risk Score", "Document Summary"];

  return (
    <div className="bg-[#f5f4f0] min-h-screen flex flex-col">

      {/* ── TOP BAR ── */}
      <div className="w-full py-5 px-8 md:px-16 border-b border-gray-200 shadow-sm fixed top-0 left-0 bg-white z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span
            className="text-lg font-bold text-[#1D2D5F] cursor-pointer tracking-tight"
            onClick={() => navigate("/")}
          >
            Docspect.AI
          </span>
          <button
            onClick={() => handleAnalysisGeneratePDF(analysisData.summary, analysisData.riskScore, analysisData.riskClauses, setLoading)}
            disabled={loading || !analysisData?.summary}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-semibold shadow-sm transition
              ${loading || !analysisData?.summary
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#1D2D5F] hover:bg-[#16264d]"
              }`}
            title="Download full report as PDF"
          >
            <Download className="w-4 h-4" />
            <span>{loading ? "Preparing…" : "Download Report"}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-grow flex flex-col items-center pt-28 px-6 pb-16">
        <div className="w-full max-w-6xl space-y-8">

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-[#1D2D5F] tracking-tight">
              AI-Reviewed Report
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Automated contract analysis — verify before acting on findings
            </p>
          </div>

          {/* LLM Disclaimer */}
          {analysisData.llmDisclaimerRequired && (
            <LLMDisclaimerBanner warnings={analysisData.llmWarnings} />
          )}

          {/* ── ROW 1: Side by side — same height, summary scrollable ── */}
          <div className="grid grid-cols-3 gap-6" style={{ height: "520px" }}>

            {/* LEFT — Gauge, fixed height, centered */}
            <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-6">
              <RiskScoreGauge score={analysisData.riskScore} />
            </div>

            {/* RIGHT — Summary, same height, scrollable inside */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              
              {/* Fixed header inside the card */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>📋</span> Document Summary
                </h2>
                <span className="text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">
                  Audit Complete
                </span>
              </div>

              {/* Scrollable content area */}
              <div className="overflow-y-auto flex-1 px-6 py-4">
                <DocumentSummary summary={analysisData.summary} />
              </div>

              {/* Scroll hint at bottom */}
              <div className="flex-shrink-0 text-center py-2 border-t border-gray-50">
                <span className="text-xs text-gray-300">scroll to see more ↓</span>
              </div>

            </div>
          </div>

          {/* ── ROW 2: Risk Clauses ── */}
          <RiskClauseList riskClauses={analysisData.riskClauses} />

          {/* ── ROW 3: Case Studies ── */}
          <CaseStudyList riskClauses={analysisData.riskClauses} apiBase={base} />

        </div>
      </div>
    </div>
  );
}