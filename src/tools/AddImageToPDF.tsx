import React, { useState } from 'react';
import { ArrowLeft, Move } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import PDFPreview from '../components/PDFPreview';
import ProcessingModal from '../components/ProcessingModal';
import ResultsPanel from '../components/ResultsPanel';
import { ProcessedFile, ImagePosition } from '../types';
import { PDFProcessor } from '../utils/pdfUtils';

interface AddImageToPDFProps {
  onBack: () => void;
}

const AddImageToPDF: React.FC<AddImageToPDFProps> = ({ onBack }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [position, setPosition] = useState<ImagePosition>({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    page: 1
  });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedFile | null>(null);
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [modalMessage, setModalMessage] = useState('');

  const handlePDFSelected = (files: File[]) => {
    setPdfFile(files[0] || null);
    setResult(null);
  };

  const handleImageSelected = (files: File[]) => {
    setImageFile(files[0] || null);
    setResult(null);
  };

  const handlePageSelect = (pageNumber: number) => {
    setSelectedPage(pageNumber);
    setPosition(prev => ({ ...prev, page: pageNumber }));
  };

  const handlePositionChange = (field: keyof ImagePosition, value: number) => {
    setPosition(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImage = async () => {
    if (!pdfFile || !imageFile) return;

    setProcessing(true);
    setModalStatus('processing');
    setModalMessage('Adding image to PDF...');

    try {
      const modifiedBytes = await PDFProcessor.addImageToPDF(pdfFile, imageFile, position);
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const resultFile: ProcessedFile = {
        id: 'modified-pdf',
        name: pdfFile.name.replace('.pdf', '_with_image.pdf'),
        type: 'application/pdf',
        size: blob.size,
        url,
        data: modifiedBytes,
      };

      setResult(resultFile);
      setModalStatus('success');
      setModalMessage('Image successfully added to PDF!');
    } catch (error) {
      console.error('Error adding image:', error);
      setModalStatus('error');
      setModalMessage('Failed to add image to PDF. Please try again.');
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
              Add Image to PDF
            </h2>
            <p className="text-gray-600 mb-6">
              Upload an image and place it at a custom position inside any PDF page.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">1. Select PDF File</h3>
                <FileUpload
                  onFilesSelected={handlePDFSelected}
                  acceptedTypes={['application/pdf']}
                  multiple={false}
                  title="Select PDF File"
                  description="Choose the PDF file to modify"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">2. Select Image</h3>
                <FileUpload
                  onFilesSelected={handleImageSelected}
                  acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
                  multiple={false}
                  title="Select Image"
                  description="Choose the image to add to the PDF"
                />
              </div>

              {imageFile && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Image Preview</h4>
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Selected image"
                    className="max-w-full h-32 object-contain rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {pdfFile && imageFile && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <Move className="w-5 h-5 inline mr-2" />
                Position Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    X Position
                  </label>
                  <input
                    type="number"
                    value={position.x}
                    onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Y Position
                  </label>
                  <input
                    type="number"
                    value={position.y}
                    onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width
                  </label>
                  <input
                    type="number"
                    value={position.width}
                    onChange={(e) => handlePositionChange('width', parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <input
                    type="number"
                    value={position.height}
                    onChange={(e) => handlePositionChange('height', parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleAddImage}
                  className="btn-primary"
                  disabled={processing}
                >
                  Add Image to PDF
                </button>
              </div>
            </div>
          )}

          {result && (
            <ResultsPanel
              files={[result]}
              onDownload={handleDownload}
            />
          )}
        </div>

        <div>
          {pdfFile && (
            <PDFPreview
              file={pdfFile}
              onPageSelect={handlePageSelect}
              selectedPage={selectedPage}
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

export default AddImageToPDF;