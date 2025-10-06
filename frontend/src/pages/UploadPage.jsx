import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

export default function DocspectUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const base = import.meta.env.VITE_API_BASE;

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 25 * 1024 * 1024,
  });

  const handleUploadAndNavigate = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await axios.post(`${base}/api/summarize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Navigate to AnalysisPage with response data
      navigate("/analysis", {
        state: {
          analysisData: {
            summary: response.data.summary,
            recommendations: response.data.recommendations,
            // keyClauses: response.data.keyClauses,
            riskClauses: response.data.riskClauses,
            caseStudies: response.data.caseStudies,
          },
        },
      });
      console.log("📄 Analysis response:", response.data);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="bg-[hsl(38,8%,81%)] h-screen flex flex-col">
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
      {/* Header */}
      <div className="w-full py-4 md:py-6 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 border-b border-black shadow-md fixed top-0 left-0 bg-[hsl(38,8%,81%)] z-10">
        <span className="text-lg font-bold cursor-pointer" onClick={() => navigate("/")}>
          Docspect.AI
        </span>
      </div>

      {/* Main */}
      <div className="flex-grow flex flex-col justify-center items-center px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 mb-6 sm:mb-8 text-center">Upload Your Document</h1>
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md md:max-w-lg">
          <h2 className="text-lg font-semibold mb-2">Upload Document</h2>
          <p className="text-sm text-gray-500 mb-6">
            Please upload a file in PDF or DOCX format (Max: 25MB).
          </p>

          {/* Dropzone */}
          <div {...getRootProps()} className="border-2 border-dashed border-gray-400 p-6 sm:p-8 rounded-lg text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-500" />
            <p className="text-sm sm:text-base text-gray-600 font-medium mt-2">
              {isDragActive ? "Drop the file here..." : "Drop file or browse"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">Format: .pdf, .docx | Max size: 25MB</p>
          </div>

          {/* File Info */}
          {file && (
            <div className="mt-4 p-3 border rounded-lg bg-gray-100 text-sm text-gray-700">
              <strong>Selected File:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-6 sm:mt-8">
            <button
              className="px-4 sm:px-5 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              onClick={() => setFile(null)}
            >
              Cancel
            </button>
            <button
              onClick={handleUploadAndNavigate}
              disabled={!file || loading}
              className={`px-4 sm:px-5 py-2 text-white rounded-lg transition ${file ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
            >
              {loading ? "Analyzing..." : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
