import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import PDFPreview from '../components/PDFPreview';
import ProcessingModal from '../components/ProcessingModal';
import ResultsPanel from '../components/ResultsPanel';
import { ProcessedFile } from '../types';
import { PDFProcessor } from '../utils/pdfUtils';

interface CompressPDFProps {
  onBack: () => void;
}

const CompressPDF: React.FC<CompressPDFProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedFile | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [modalMessage, setModalMessage] = useState('');

  const handleFileSelected = (files: File[]) => {
    const file = files[0] || null;
    setSelectedFile(file);
    setResult(null);
    setOriginalSize(file?.size || 0);
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setModalStatus('processing');
    setModalMessage('Compressing PDF...');

    try {
      const compressedBytes = await PDFProcessor.compressPDF(selectedFile);
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const resultFile: ProcessedFile = {
        id: 'compressed-pdf',
        name: selectedFile.name.replace('.pdf', '_compressed.pdf'),
        type: 'application/pdf',
        size: blob.size,
        url,
        data: compressedBytes,
      };

      setResult(resultFile);
      setModalStatus('success');
      
      const compressionRatio = ((originalSize - blob.size) / originalSize * 100).toFixed(1);
      setModalMessage(`PDF compressed successfully! Size reduced by ${compressionRatio}%`);
    } catch (error) {
      console.error('Error compressing PDF:', error);
      setModalStatus('error');
      setModalMessage('Failed to compress PDF. Please try again.');
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Compress PDF
            </h2>
            <p className="text-gray-600 mb-6">
              Reduce your PDF file size while maintaining readability. 
              Perfect for sharing documents via email or uploading to websites.
            </p>

            <FileUpload
              onFilesSelected={handleFileSelected}
              acceptedTypes={['application/pdf']}
              multiple={false}
              title="Select PDF File"
              description="Choose a PDF file to compress"
            />

            {selectedFile && (
              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">File Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Original size:</span> {formatFileSize(originalSize)}</p>
                    {result && (
                      <>
                        <p><span className="font-medium">Compressed size:</span> {formatFileSize(result.size)}</p>
                        <p><span className="font-medium">Size reduction:</span> {((originalSize - result.size) / originalSize * 100).toFixed(1)}%</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleCompress}
                  className="btn-primary"
                  disabled={processing}
                >
                  Compress PDF
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
        </div>

        <div>
          {selectedFile && (
            <PDFPreview
              file={selectedFile}
              showDownload={false}
            />
          )}
        </div>
      </div>

      <ProcessingModal
        isOpen={processing}
        status={modalStatus}
        message={modalMessage}
        onClose={closeModal}
      />
    </div>
  );
};

export default CompressPDF;