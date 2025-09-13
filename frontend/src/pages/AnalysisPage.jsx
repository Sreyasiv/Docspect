import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

import FileUpload from "../components/analysis/FileUpload";
import RiskScoreGauge from "../components/analysis/RiskScoreGauge";
import DocumentSummary from "../components/analysis/DocumentSummary";


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
      const res = await axios.post("https://docspect.onrender.com/api/summarize", formData, {
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
    return <FileUpload onUpload={handleFileUpload} loading={loading} />;
  }

  return (
    <div className="bg-[hsl(38,8%,81%)] min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="w-full py-6 px-8 md:px-32 border-b border-black shadow-md fixed top-0 left-0 bg-[hsl(38,8%,81%)] z-10">
        <span
          className="text-lg font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          Docspect.AI
        </span>
      </div>

      {/* Main Section */}
      <div className="flex-grow flex flex-col items-center pt-28 px-4 md:px-0">
        <div className="w-full max-w-6xl space-y-6">
          <h1 className="text-3xl font-bold text-[#1D2B4F]">AI-Reviewed Report</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left */}
            <div className="md:col-span-2 space-y-8">
              <RiskScoreGauge/>
              <DocumentSummary summary={analysisData.summary} />
              
            </div>

            {/* Right */}
            
          </div>
        </div>
      </div>
    </div>
  );
}
