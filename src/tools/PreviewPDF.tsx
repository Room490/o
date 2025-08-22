import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import PDFPreview from '../components/PDFPreview';

interface PreviewPDFProps {
  onBack: () => void;
}

const PreviewPDF: React.FC<PreviewPDFProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelected = (files: File[]) => {
    setSelectedFile(files[0] || null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tools
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              PDF Preview
            </h2>
            <p className="text-gray-600 mb-6">
              Upload and preview your PDF documents with page navigation, 
              zoom controls, and download options.
            </p>

            <FileUpload
              onFilesSelected={handleFileSelected}
              acceptedTypes={['application/pdf']}
              multiple={false}
              title="Select PDF File"
              description="Choose a PDF file to preview"
            />
          </div>
        </div>

        <div>
          {selectedFile && (
            <PDFPreview
              file={selectedFile}
              showDownload={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPDF;