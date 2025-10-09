import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import FileUpload from "../components/analysis/FileUpload";
import RiskScoreGauge from "../components/analysis/RiskScoreGauge";
import DocumentSummary from "../components/analysis/DocumentSummary";
import Loader from "../components/Loader";
import { pdf } from "@react-pdf/renderer";
import ReportDocument from "../components/analysis/ReportDocument";
import { Download } from "lucide-react";

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

  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      const res = await axios.post(`${base}/api/summarize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const riskClauses = res.data.riskClauses ?? [];
      const computedScore = Math.min(100, Math.round((riskClauses.length * 12) + 20));
      setAnalysisData({
        summary: res.data.summary ?? res.data,
        riskClauses,
        riskScore: computedScore,
      });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  if (!analysisData) {
    return (
      <>
        {loading ? (
          <Loader
            message="Analyzing your document…"
            subMessages={[
              "Uploading securely…",
              "Extracting text and structure…",
              "Detecting risky clauses…",
              "Summarizing key points…",
            ]}
          />
        ) : null}
        <FileUpload onUpload={handleFileUpload} loading={loading} />
      </>
    );
  }

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

            <div className="flex gap-8">
              {/* Left */}
              <div className="md:col-span-2 space-y-8">
                  <RiskScoreGauge score={analysisData.riskScore} />
                <DocumentSummary summary={analysisData.summary} />
                
              </div>

              {/* Right */}
              
            </div>
        </div>

        </div>
      </div>
    </div>
  );
}
