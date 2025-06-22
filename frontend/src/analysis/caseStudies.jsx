// components/CaseStudies.jsx
import { BookOpen } from "lucide-react";

function getRiskLevelColor(risk) {
  switch (risk) {
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    case "Low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function CaseStudies({ caseStudies }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
        <BookOpen className="w-6 h-6 text-[#1D2D5F]" />
        <span>Relevant Case Studies</span>
      </h2>
      <div className="space-y-4">
        {caseStudies.map((caseStudy, idx) => (
          <div
            key={idx}
            className="border-l-4 pl-4 py-2 bg-gray-50 rounded border-gray-200"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-gray-800">{caseStudy.title}</span>
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getRiskLevelColor(caseStudy.relevance)}`}>
                {caseStudy.relevance} Relevance
              </span>
            </div>
            <p className="text-gray-700 text-sm">{caseStudy.description}</p>
            <p className="text-gray-600 text-xs mt-1">
              <span className="font-semibold">Outcome:</span> {caseStudy.outcome}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
