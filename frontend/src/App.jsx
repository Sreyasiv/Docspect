import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DocspectUpload from "./pages/UploadPage";
import AnalysisPage from "./pages/AnalysisPage";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<DocspectUpload />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
