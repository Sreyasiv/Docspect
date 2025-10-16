import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"; // 👈 Ensure useEffect is imported
import axios from "axios";
import { Download } from "lucide-react";

import FileUpload from "../components/analysis/FileUpload";
import RiskScoreGauge from "../components/analysis/RiskScoreGauge";
import DocumentSummary from "../components/analysis/DocumentSummary";
import Loader from "../components/Loader";
import LLMDisclaimerBanner from "../components/analysis/LLMDisclaimerBanner"; // 👈 New component import
import { pdf } from "@react-pdf/renderer";
import ReportDocument from "../components/analysis/ReportDocument"; 
import RiskClauseList from "../components/analysis/RiskClauseList";

const base = import.meta.env.VITE_API_BASE;

async function handleAnalysisGeneratePDF(summary, riskScore, setLoading) {
  if (!summary) return;
  try {
    if (setLoading) setLoading(true);

    const computedScore = Number.isFinite(riskScore) ? Math.max(0, Math.min(100, Math.round(riskScore))) : 56;

    const blob = await pdf(<ReportDocument summary={summary} riskScore={computedScore} />).toBlob();
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

  // 1. STATE INITIALIZATION: Safely read data passed via react-router-dom state
  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(false);

  // 🛑 DEBUGGING LOGS (Crucial to confirm data transfer success)
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
      // 🛑 FIX: Use the correct backend route: /api/analyze (not /api/summarize)
      const res = await axios.post(`${base}/api/analyze`, formData, { 
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // 🛑 FIX/UPDATE: Extract ALL new LLM risk data fields (risks, llmWarnings, llmDisclaimerRequired)
      const risks = res.data.risks ?? []; 
      const llmWarnings = res.data.llmWarnings ?? [];
      const llmDisclaimerRequired = res.data.llmDisclaimerRequired ?? false;

      // Score calculation
      const computedScore = Math.min(100, Math.round((risks.length * 12) + 20));
      
      // Update state with all necessary fields
      setAnalysisData({
        summary: res.data.summary ?? res.data,
        riskClauses: risks, // Mapped from backend 'risks' for frontend consistency
        riskScore: computedScore,
        llmWarnings, // 👈 New field
        llmDisclaimerRequired, // 👈 New field
      });

      console.log("✅ Analysis complete via in-page upload. State updated.");
    } catch (err) {
      console.error("❌ In-page Upload failed:", err);
      alert("Failed to analyze document. Please check console for details.");
    }

    setLoading(false);
  };
  
  // 2. Render Logic: Loader or Fallback
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

  // Fallback UI if analysisData is null (direct navigation or refresh)
  if (!analysisData) {
    // Pass the local handleFileUpload to the FileUpload component
    return <FileUpload onUpload={handleFileUpload} loading={loading} />;
  }

  // 3. Render the main report
  return (
    <div className="bg-[#d9d3c8] min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="w-full py-6 px-8 md:px-32 border-b border-black shadow-md fixed top-0 left-0 bg-[#d9d3c8] z-10">
        <span
          className="text-lg font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Docspect.AI
        </span>
      </div>

      {/* Main Section */}
      <div className="flex-grow flex flex-col items-center pt-28 px-4 md:px-0">
        <div className="flex md:flex-row flex-col ">
          <div className="w-full max-w-6xl space-y-6" id="ai-reviewed-report">
            
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-[#1D2B4F]">AI-Reviewed Report</h1>
              <button
                onClick={() => handleAnalysisGeneratePDF(analysisData.summary, analysisData.riskScore, setLoading)}
                disabled={loading || !analysisData?.summary}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white font-semibold shadow-md transition
                  ${loading || !analysisData?.summary ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#1D2D5F] to-[#16264d] hover:from-[#6583cf] hover:to-[#1840b8]"}`}
                title="Download full report as PDF"
              >
                <Download className="w-4 h-4" />
                <span>{loading ? "Preparing…" : "Download Report"}</span>
              </button>
            </div>
            
            {/* 🛑 NEW FEATURE: Display LLM Disclaimer Banner */}
            {analysisData.llmDisclaimerRequired && (
                <LLMDisclaimerBanner warnings={analysisData.llmWarnings} />
            )}

            <div className="flex gap-8">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-8">
                  <RiskScoreGauge score={analysisData.riskScore} /> 
                  <DocumentSummary summary={analysisData.summary} />
                  <RiskClauseList riskClauses={analysisData.riskClauses}/>
                  
                
              </div>
              
            </div>
        </div>
      </div>
    </div>
    </div>
  );
}