import React, { useEffect, useState } from "react";

export default function Loader({ message = "Analyzing your document…", subMessages = ["Detecting risky clauses…", "Summarizing key points…", "Cross-referencing case studies…"], intervalMs = 1600 }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!subMessages || subMessages.length === 0) return;
    const id = setInterval(() => setIdx((v) => (v + 1) % subMessages.length), intervalMs);
    return () => clearInterval(id);
  }, [subMessages, intervalMs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[hsl(38,8%,81%)]/70 backdrop-blur-sm" />

      <div className="relative bg-white/90 shadow-xl rounded-2xl px-8 py-10 w-[90%] max-w-md text-center border border-[#1D2B4F]/10">
        <div className="mx-auto mb-6 h-14 w-14 rounded-full border-4 border-[#1D2B4F]/20 border-t-[#1D2B4F] animate-spin" />
        <h2 className="text-xl md:text-2xl font-semibold text-[#1D2B4F]">{message}</h2>
        {subMessages && subMessages.length > 0 ? (
          <p className="mt-2 text-sm md:text-base text-gray-700 min-h-[1.5rem]">{subMessages[idx]}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-center space-x-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-[#1D2B4F] animate-bounce [animation-delay:-0.2s]" />
          <span className="h-2 w-2 rounded-full bg-[#1D2B4F] animate-bounce" />
          <span className="h-2 w-2 rounded-full bg-[#1D2B4F] animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    </div>
  );
}


