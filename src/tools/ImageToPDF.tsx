import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ProcessingModal from '../components/ProcessingModal';
import ResultsPanel from '../components/ResultsPanel';
import { ProcessedFile } from '../types';
import { PDFProcessor } from '../utils/pdfUtils';

interface ImageToPDFProps {
  onBack: () => void;
}

const ImageToPDF: React.FC<ImageToPDFProps> = ({ onBack }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedFile | null>(null);
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [modalMessage, setModalMessage] = useState('');

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setResult(null);
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;

    setProcessing(true);
    setModalStatus('processing');
    setModalMessage('Converting images to PDF...');

    try {
      const pdfBytes = await PDFProcessor.imagesToPDF(selectedFiles);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const resultFile: ProcessedFile = {
        id: 'converted-pdf',
        name: 'converted-images.pdf',
        type: 'application/pdf',
        size: blob.size,
        url,
        data: pdfBytes,
      };

      setResult(resultFile);
      setModalStatus('success');
      setModalMessage('Images successfully converted to PDF!');
    } catch (error) {
      console.error('Error converting images:', error);
      setModalStatus('error');
      setModalMessage('Failed to convert images to PDF. Please try again.');
    }
  };

  const handleDownload = (file: ProcessedFile) => {
    if (file.data) {
      PDFProcessor.downloadFile(file.data, file.name, file.type);
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
          Image to PDF Converter
        </h2>
        <p className="text-gray-600 mb-6">
          Upload multiple images and convert them into a single PDF document. 
          Supported formats: JPG, PNG, GIF, BMP.
        </p>

        <FileUpload
          onFilesSelected={handleFilesSelected}
          acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp']}
          multiple={true}
          title="Select Images"
          description="Choose multiple images to combine into a PDF"
        />

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleConvert}
              className="btn-primary"
              disabled={processing}
            >
              Convert to PDF
            </button>
          </div>
        )}
      </div>

      {result && (
        <ResultsPanel
          files={[result]}
          onDownload={handleDownload}
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

export default ImageToPDF;