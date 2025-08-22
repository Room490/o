import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ProcessingModal from '../components/ProcessingModal';
import ResultsPanel from '../components/ResultsPanel';
import { ProcessedFile } from '../types';
import { PDFProcessor } from '../utils/pdfUtils';

interface PDFToImageProps {
  onBack: () => void;
}

const PDFToImage: React.FC<PDFToImageProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedFile[]>([]);
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [modalMessage, setModalMessage] = useState('');

  const handleFileSelected = (files: File[]) => {
    setSelectedFile(files[0] || null);
    setResults([]);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setModalStatus('processing');
    setModalMessage('Converting PDF pages to images...');

    try {
      const images = await PDFProcessor.pdfToImages(selectedFile, format);
      setResults(images);
      setModalStatus('success');
      setModalMessage(`Successfully converted ${images.length} pages to ${format.toUpperCase()} images!`);
    } catch (error) {
      console.error('Error converting PDF:', error);
      setModalStatus('error');
      setModalMessage('Failed to convert PDF to images. Please try again.');
    }
  };

  const handleDownload = (file: ProcessedFile) => {
    if (file.data) {
      PDFProcessor.downloadFile(new Uint8Array(file.data), file.name, file.type);
    }
  };

  const handlePreview = (file: ProcessedFile) => {
    window.open(file.url, '_blank');
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
          PDF to Image Converter
        </h2>
        <p className="text-gray-600 mb-6">
          Convert each page of your PDF into high-quality images. 
          Choose between PNG for transparency support or JPEG for smaller file sizes.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Output Format
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="png"
                checked={format === 'png'}
                onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                className="mr-2"
              />
              PNG (High Quality)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="jpeg"
                checked={format === 'jpeg'}
                onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                className="mr-2"
              />
              JPEG (Smaller Size)
            </label>
          </div>
        </div>

        <FileUpload
          onFilesSelected={handleFileSelected}
          acceptedTypes={['application/pdf']}
          multiple={false}
          title="Select PDF File"
          description="Choose a PDF file to convert to images"
        />

        {selectedFile && (
          <div className="mt-6">
            <button
              onClick={handleConvert}
              className="btn-primary"
              disabled={processing}
            >
              Convert to {format.toUpperCase()}
            </button>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <ResultsPanel
          files={results}
          onDownload={handleDownload}
          onPreview={handlePreview}
        />
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

export default PDFToImage;