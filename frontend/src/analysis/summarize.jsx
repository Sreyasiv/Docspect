import { BookOpen } from "lucide-react";

export default function DocumentSummary({ summary }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
        <BookOpen className="w-6 h-6 text-[#1D2D5F]" />
        <span>Document Summary</span>
      </h2>
      <p className="text-gray-700 text-base">{summary}</p>
    </div>
  );
}