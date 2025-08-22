import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ProcessingModal from '../components/ProcessingModal';
import ResultsPanel from '../components/ResultsPanel';
import { PDFProcessor } from '../utils/pdfUtils';

interface PDFToTextProps {
  onBack: () => void;
}

const PDFToText: React.FC<PDFToTextProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [modalMessage, setModalMessage] = useState('');

  const handleFileSelected = (files: File[]) => {
    setSelectedFile(files[0] || null);
    setExtractedText('');
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setModalStatus('processing');
    setModalMessage('Extracting text from PDF...');

    try {
      const text = await PDFProcessor.pdfToText(selectedFile);
      setExtractedText(text);
      setModalStatus('success');
      setModalMessage('Text successfully extracted from PDF!');
    } catch (error) {
      console.error('Error extracting text:', error);
      setModalStatus('error');
      setModalMessage('Failed to extract text from PDF. Please try again.');
    }
  };

  const handleDownloadText = () => {
    if (extractedText) {
      const filename = selectedFile?.name.replace('.pdf', '.txt') || 'extracted-text.txt';
      PDFProcessor.downloadFile(extractedText, filename, 'text/plain');
    }
  };

  const closeModal = () => {
    setProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tools
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          PDF Text Extractor
        </h2>
        <p className="text-gray-600 mb-6">
          Extract all text content from your PDF documents. The extracted text 
          can be copied to clipboard or downloaded as a text file.
        </p>

        <FileUpload
          onFilesSelected={handleFileSelected}
          acceptedTypes={['application/pdf']}
          multiple={false}
          title="Select PDF File"
          description="Choose a PDF file to extract text from"
        />

        {selectedFile && (
          <div className="mt-6">
            <button
              onClick={handleExtract}
              className="btn-primary"
              disabled={processing}
            >
              Extract Text
            </button>
          </div>
        )}
      </div>

      {extractedText && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
            <button
              onClick={handleDownloadText}
              className="btn-primary"
            >
              Download as TXT
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {extractedText}
            </pre>
          </div>
        </div>
      )}

      <ProcessingModal
        isOpen={processing}
        status={modalStatus}
        message={modalMessage}
        onClose={closeModal}
      />
    </div>
  );
};

export default PDFToText;