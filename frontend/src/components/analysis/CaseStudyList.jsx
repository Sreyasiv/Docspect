import { useState } from "react";
import { LayoutList, ExternalLink } from "lucide-react";
import axios from "axios";

export default function CaseStudyList({ riskClauses, apiBase }) {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchCaseStudies = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiBase}/api/case-studies`, {
        risks: riskClauses,
        contractText: riskClauses.map(r => r.clause_snippet).join(" "),
      }, {
        headers: { "Content-Type": "application/json" },
      });

      setCaseStudies(response.data.caseStudies || []);
    } catch (err) {
      console.error("Error fetching case studies:", err);
      setError("Failed to fetch case studies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutList className="w-5 h-5 text-gray-800" />
          <h2 className="text-xl font-bold text-gray-900">Precedent & Case Studies</h2>
        </div>
        <a
          href="https://indiankanoon.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
        >
          Explore Indian Kanoon
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Load button */}
      {caseStudies.length === 0 && !loading && !error && (
        <button
          onClick={handleFetchCaseStudies}
          className="bg-[#1D2D5F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#16234a] transition-colors"
        >
          Load Case Studies
        </button>
      )}

      {/* Loading state */}
      {loading && (
        <p className="text-sm text-gray-400 animate-pulse">Fetching relevant case studies…</p>
      )}

      {/* Error state */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Case study cards */}
      {caseStudies.length > 0 && (
        <div className="space-y-4">
          {caseStudies.map((cs, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {/* Row 1 — title + relevance tag */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900 leading-snug flex-1 mr-4">
                  {cs.title}
                </h3>
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0">
                  Relevance: {cs.risk_type}
                </span>
              </div>

              {/* Row 2 — source */}
              <p className="text-xs text-gray-400 mb-3">
                {cs.docsource}  •  {cs.risk_type}
              </p>

              {/* Row 3 — relevance note */}
              {cs.relevanceNote && (
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {cs.relevanceNote}
                </p>
              )}

              {/* Row 4 — view link */}
              <a
                href={cs.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1"
              >
                View Case Analysis →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
