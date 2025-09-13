export default function FileUpload({ onUpload, loading }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-700">
      <div className="space-y-4 text-center">
        <p>No analysis data found. Please upload a document first.</p>
        <input type="file" onChange={handleFileChange} />
        <button
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>
    </div>
  );
}
