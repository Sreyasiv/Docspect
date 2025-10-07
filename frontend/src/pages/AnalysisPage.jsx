import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
// import html2pdf from "html2pdf.js";
import FileUpload from "../components/analysis/FileUpload";
import RiskScoreGauge from "../components/analysis/RiskScoreGauge";
import DocumentSummary from "../components/analysis/DocumentSummary";
import Loader from "../components/Loader";
import { pdf } from "@react-pdf/renderer";
import ReportDocument from "../components/analysis/ReportDocument";


const base = import.meta.env.VITE_API_BASE;

async function handleAnalysisGeneratePDF(summary, riskClauses, setLoading) {
  if (!summary) return;
  try {
    if (setLoading) setLoading(true);

    let computedScore = 56;
    if (Array.isArray(riskClauses)) {
      computedScore = Math.min(100, Math.round(riskClauses.length * 12 + 20));
    }

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
      setAnalysisData({
        summary: res.data,
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
            <h1 className="text-3xl font-bold text-[#1D2B4F]" >AI-Reviewed Report</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left */}
              <div className="md:col-span-2 space-y-8">
                <RiskScoreGauge/>
                <DocumentSummary summary={analysisData.summary} />
                
              </div>

              {/* Right */}
              
            </div>
        </div>
            <button className="mt-32 bg-blue-500 text-white h-[10vh] px-6 py-3 rounded-md hover:bg-blue-600 transition"
            onClick={() => handleAnalysisGeneratePDF(analysisData.summary, setLoading)}>
              Download Report
            </button>
          <div>
        </div>

        </div>
      </div>
    </div>
  );
}
