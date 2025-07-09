// pages/AnalysisPage.jsx
import { useNavigate, useLocation } from "react-router-dom";
import GaugeChart from "react-gauge-chart";
import { Shield } from "lucide-react";
import DocumentSummary from "../analysis/summarize";
import RiskFactors from "../analysis/riskFactors";
import CaseStudies from "../analysis/CaseStudies";
import axios from "axios";
import { useState } from "react";

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await axios.post("http://localhost:3001/api/summarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📄 Analysis response:", response.data);
      setAnalysisData(response.data);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        <div className="space-y-4 text-center">
          <p>No analysis data found. Please upload a document first.</p>
          <input type="file" onChange={handleFileChange} />
          <button
            onClick={handleUpload}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(38,8%,81%)] min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="w-full py-6 px-8 md:px-32 border-b border-black shadow-md fixed top-0 left-0 bg-[hsl(38,8%,81%)] z-10">
        <span className="text-lg font-bold cursor-pointer" onClick={() => navigate("/")}>
          Docspect.AI
        </span>
      </div>

      {/* Main Section */}
      <div className="flex-grow flex flex-col items-center pt-28 px-4 md:px-0">
        <div className="w-full max-w-6xl space-y-6">
          <h1 className="text-3xl font-bold text-[#1D2B4F]">AI-Reviewed Report</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              {/* Risk Score Section */}
              <div className="bg-white rounded-lg p-6 shadow-md mb-4">
                <div className="text-lg font-bold text-gray-800 flex items-center space-x-2 mb-4">
                  <Shield className="w-6 h-6 text-[#1D2D5F]" />
                  <span>Document Risk Score</span>
                </div>
                <div className="w-48">
                  <GaugeChart
                  id="risk-chart"
                  nrOfLevels={5} // Total tick marks (optional, can be more)
                  colors={[ "#2ECC71","#F1C40F","#E74C3C"]} // green yellow red
                  arcWidth={0.3}
                  percent={(analysisData.riskScore || 0) / 100}
                />
                </div>

                {/* AI Recommendations */}
                {analysisData.recommendations?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      AI Recommendations
                    </h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {analysisData.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Summary */}
              <DocumentSummary summary={analysisData.summary} />

              {/* Key Clauses */}
              {analysisData?.keyClauses?.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Clauses</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {analysisData.keyClauses.map((clause, idx) => (
                      <li key={idx}>{clause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {analysisData?.riskClauses && (
                <RiskFactors riskClauses={analysisData.riskClauses} />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              <CaseStudies caseStudies={analysisData.caseStudies || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
