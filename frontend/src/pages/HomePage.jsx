import { useNavigate } from "react-router-dom";
import AiFill from "../assets/ai-fill.svg";
import Banner from "../assets/banner.svg";
import Upload from "../assets/upload.svg";
import Scan from "../assets/scan.svg";
import Decision from "../assets/decision.svg";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="bg-[hsl(38,8%,81%)] text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="flex flex-wrap justify-between items-center px-6 sm:px-12 md:px-20 lg:px-32 py-4 border-b shadow-md">
        <span className="text-lg font-bold cursor-pointer">Docspect.AI</span>
        <div className="flex items-center space-x-4">
          <button
            className="text-[#16264d] font-bold cursor-pointer"
            onClick={() =>
              document
                .getElementById("how-it-works")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            How It Works
          </button>
          <button
            className="bg-[#1D2D5F] text-white hover:bg-[#16264d] transition px-4 sm:px-6 py-2 sm:py-3 rounded-md cursor-pointer font-bold text-sm sm:text-base"
            onClick={() => navigate("/upload")}
          >
            Try Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:px-20 py-10 md:py-20">
        {/* Left Side - Text Content */}
        <div className="max-w-xl text-center md:text-left">
          <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            <h1 className="flex items-center justify-center md:justify-start">
              Review any Contract With
            </h1>
            <div className="flex items-center justify-center md:justify-start mt-3">
              <img src={AiFill} alt="AI Icon" className="w-8 h-8 sm:w-10 sm:h-10 mr-2" />
              <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
                AI Before You Sign It
              </span>
            </div>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 mt-4 sm:mt-6 leading-relaxed">
            Save big on legal fees! Instantly review contracts with AI-powered insights.
          </p>
          <ul className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-base sm:text-lg text-gray-600 font-medium">
            <li>✔ Accessible Globally</li>
            <li>✔ Multilingual Support</li>
            <li>✔ Quick and Easy to Use</li>
          </ul>
          <button
            className="mt-6 sm:mt-8 bg-[#1D2D5F] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-xl shadow-lg hover:bg-[#16264d] transition cursor-pointer"
            onClick={() => navigate("/upload")}
          >
            Upload Now
          </button>
        </div>

        {/* Right Side - Image */}
        <div className="mb-10 md:mb-0 flex justify-center w-full md:w-auto">
          <img
            src={Banner}
            alt="Contract Analysis"
            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="px-6 sm:px-12 md:px-20 py-16 flex flex-col items-center text-center">
        <div className="w-24 border-b-2 border-gray-400 mb-8"></div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800">
          How Does This Work
        </h2>
        <p className="mt-4 sm:mt-6 text-gray-700 max-w-2xl">
          Docspect.ai provides you with crucial insights to help you make informed
          decisions about the contracts in front of you—efficiently and quickly, using
          advanced AI technology.
        </p>

        {/* Steps Container */}
        <div className="mt-12 sm:mt-16 flex flex-col space-y-10 w-full max-w-4xl">
          {/* Step 1 */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between text-left space-y-4 sm:space-y-0">
            <div className="sm:max-w-md">
              <h3 className="font-bold text-2xl text-gray-800">Step 1: Upload Your Contract</h3>
              <p className="mt-2 text-gray-600">
                Easily drag and drop your PDF or text file into our secure platform.
              </p>
            </div>
            <img src={Upload} alt="Upload Icon" className="w-28 h-28 sm:w-36 sm:h-36" />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between text-left space-y-4 sm:space-y-0">
            <div className="sm:max-w-md">
              <h3 className="font-bold text-2xl text-gray-800">Step 2: Review Informational Insights</h3>
              <p className="mt-2 text-gray-600">
                Our AI engine scans the contract and presents its findings, highlighting
                issues in order of their risk level.
              </p>
            </div>
            <img src={Scan} alt="Scan Icon" className="w-28 h-28 sm:w-36 sm:h-36" />
          </div>

          {/* Step 3 */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between text-left space-y-4 sm:space-y-0">
            <div className="sm:max-w-md">
              <h3 className="font-bold text-2xl text-gray-800">Step 3: Make Informed Decisions</h3>
              <p className="mt-2 text-gray-600">
                Leverage these insights to negotiate better terms, identify risks, and
                finalize your contract with confidence.
              </p>
            </div>
            <img src={Decision} alt="Decision Icon" className="w-28 h-28 sm:w-36 sm:h-36" />
          </div>
        </div>
      </div>
    </div>
  );
}
