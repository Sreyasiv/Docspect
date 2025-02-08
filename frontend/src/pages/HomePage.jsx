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
      <nav className="flex justify-between items-center px-32 md:px-12 py-4 border-b shadow-md">
        <span className="text-lg font-bold cursor-pointer">Docspect.AI</span>
        <div>
          <button
            className="text-[#16264d] mr-4 font-bold cursor-pointer"
            onClick={() =>
              document
                .getElementById("how-it-works")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            How It Works
          </button>
          <button
            className="bg-[#1D2D5F] text-white hover:bg-[#16264d] transition px-6 py-3 rounded-md cursor-pointer font-bold"
            onClick={() => navigate("/upload")}
          >
            Try Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between px-32 py-10">
        {/* Left Side - Text Content */}
        <div className="max-w-2xl text-center md:text-left">
          <div className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            <h1 className="flex items-center">Review any Contract With</h1>
            <div className="flex items-center mt-3">
              <span className="inline-flex items-center">
                <img src={AiFill} alt="AI Icon" className="w-10 h-10 mx-3" />
                <span>AI&nbsp;</span>
              </span>
              <h1>Before You Sign It</h1>
            </div>
          </div>
          <p className="text-xl text-gray-700 mt-6 leading-relaxed">
            Save big on legal fees! Instantly review contracts with AI-powered insights.
          </p>
          <ul className="mt-6 space-y-3 text-xl text-gray-600 font-medium">
            <li>✔ Accessible Globally</li>
            <li>✔ Multilingual Support</li>
            <li>✔ Quick and Easy to Use</li>
          </ul>
          <button
            className="mt-8 bg-[#1D2D5F] text-white px-8 py-4 rounded-lg font-semibold text-xl shadow-lg hover:bg-[#16264d] transition cursor-pointer"
            onClick={() => navigate("/upload")}
          >
            Upload Now
          </button>
        </div>

        {/* Right Side - Image */}
        <div className="mt-14 md:mt-0 flex justify-center">
          <img src={Banner} alt="Contract Analysis" className="w-lg max-w-2xl md:max-w-3xl lg:max-w-4xl" />
        </div>
      </div>




      {/* How It Works Section */}
      <div id="how-it-works" className="px-8 md:px-32 py-16 flex flex-col items-center text-center">
        {/* Section Title */}
        <div className="w-3/4 border-b mx-auto mb-12"></div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          How Does This Work
        </h2>
        <p className="mt-4 text-gray-700 max-w-2xl">
          Docspect.ai provides you with crucial insights to help you make informed
          decisions about the contracts in front of you—efficiently and quickly, using
          advanced AI technology.
        </p>

        {/* Steps Container */}
        <div className="mt-16 flex flex-col space-y-12 w-full max-w-4xl">
          {/* Step 1 */}
          <div className="flex items-center justify-between w-full text-left">
            <div className="max-w-md">
              <h3 className="font-bold text-2xl text-gray-800">Step 1: <br />Upload Your Contract</h3>
              <p className="mt-2 text-gray-600">
                Easily drag and drop your PDF or text file into our secure platform.
              </p>
            </div>
            <img src={Upload} alt="Upload Icon" className="w-36 h-36 md:w-40 md:h-40" />
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between w-full text-left">
            <div className="max-w-md">
              <h3 className="font-bold text-2xl text-gray-800">Step 2: <br />Review Informational Insights</h3>
              <p className="mt-2 text-gray-600">
                Our AI engine scans the contract and presents its findings, highlighting
                issues in order of their risk level.
              </p>
            </div>
            <img src={Scan} alt="Scan Icon" className="w-36 h-36 md:w-40 md:h-40" />
          </div>

          {/* Step 3 */}
          <div className="flex items-center justify-between w-full text-left">
            <div className="max-w-md">
              <h3 className="font-bold text-2xl text-gray-800">Step 3: <br />Make Informed Decisions</h3>
              <p className="mt-2 text-gray-600">
                Leverage these insights to negotiate better terms, identify risks, and
                finalize your contract with confidence.
              </p>
            </div>
            <img src={Decision} alt="Decision Icon" className="w-36 h-36 md:w-40 md:h-40" />
          </div>
        </div>
      </div>
    </div >
  );
}
