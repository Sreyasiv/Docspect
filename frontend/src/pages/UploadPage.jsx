import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UploadDocument() {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxSize: 25 * 1024 * 1024, // 25MB
    });

    return (
        <div className="bg-[hsl(38,8%,81%)] h-screen flex flex-col">
            {/* Fixed Top Header */}
            <div className="w-full py-6 px-32 border-b border-black shadow-md fixed top-0 left-0 bg-[hsl(38,8%,81%)] z-10">
                <span className="text-lg font-bold cursor-pointer" onClick={() => navigate("/")}>
                    Docspect.AI
                </span>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col justify-center items-center">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Upload Your Document</h1>
                <div className="bg-white shadow-lg rounded-lg p-8 w-[500px]">
                    <h2 className="text-lg font-semibold mb-2">Upload Document</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Please upload a file in PDF or DOCX format (Max: 25MB).
                    </p>

                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className="border-2 border-dashed border-gray-400 p-8 rounded-lg text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-12 h-12 mx-auto text-gray-500" />
                        <p className="text-base text-gray-600 font-medium mt-2">
                            {isDragActive ? "Drop the file here..." : "Drop file or browse"}
                        </p>
                        <p className="text-sm text-gray-500">Format: .pdf, .docx | Max size: 25MB</p>
                    </div>

                    {/* Selected File Info */}
                    {file && (
                        <div className="mt-4 p-3 border rounded-lg bg-gray-100 text-sm text-gray-700">
                            <strong>Selected File:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between mt-8">
                        <button
                            className="px-5 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            onClick={() => setFile(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className={`px-5 py-2 text-white rounded-lg transition ${file ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                            disabled={!file}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
