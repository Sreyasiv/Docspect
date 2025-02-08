import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DocspectUpload from "./pages/UploadPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<DocspectUpload />} />
      </Routes>
    </Router>
  );
}

export default App;
