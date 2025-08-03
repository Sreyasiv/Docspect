// pages/AnalysisPage.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import DocumentSummary from "../analysis/summarize";
import RiskFactors from "../analysis/riskFactors";
import { GaugeComponent } from "react-gauge-component";
import CaseStudies from "../analysis/CaseStudies";
import axios from "axios";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ShieldCheck,Ban } from "lucide-react";


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
                <div className="w-64 h-46">
                  <GaugeComponent
                    id="risk-chart"
                    nrOfLevels={5}
                    colors={["#2ECC71", "#F1C40F", "#E74C3C"]}
                    arcWidth={0.5}
                    percent={(analysisData.riskScore || 0) / 100}
                    style={{ width: "300px", height: "150px" }}
                  />
                </div>
                    <div className="space-y-1 text-base text-gray-700">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-green-600" />
                        <span>Score below 40: This document is generally safe.</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span>Score between 40–60: This document may need caution.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ban className="w-5 h-5 text-red-600" />
                        <span>Score above 60: This document is risky and may need legal review.</span>
                      </div>
                    </div>
              </div>

              {/* Summary */}
              <DocumentSummary summary={analysisData.summary} />

              {/* RISK CLAUSES */}
              {analysisData?.riskClauses?.length > 0 && (
                  <div Upload className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-red-600 w-5 h-5" />
                      Risk Clauses Detected
                    </h3>

                    <div className="space-y-6">
                      {analysisData.riskClauses.map((item, idx) => (
                        <div key={idx} className="border-l-4 border-red-600 pl-4">
                          <p className="text-lg font-semibold text-red-800 mb-2">
                            Clause {idx + 1}:
                          </p>
                          <p className="text-base text-gray-800 whitespace-pre-line">{item.clause}</p>

                          <div className="bg-green-50 border-l-4 border-green-600 mt-4 p-4 rounded">
                            <p className="text-green-700 font-bold underline mb-1">AI Suggestion</p>
                            <p className="text-sm text-green-900 whitespace-pre-line">{item.advice}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
