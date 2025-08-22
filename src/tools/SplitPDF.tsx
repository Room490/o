import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import PDFPreview from '../components/PDFPreview';
import ProcessingModal from '../components/ProcessingModal';
import ResultsPanel from '../components/ResultsPanel';
import { ProcessedFile, SplitRange } from '../types';
import { PDFProcessor } from '../utils/pdfUtils';

interface SplitPDFProps {
  onBack: () => void;
}

const SplitPDF: React.FC<SplitPDFProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [ranges, setRanges] = useState<SplitRange[]>([
    { start: 1, end: 1, name: 'Part 1' }
  ]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedFile[]>([]);
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [modalMessage, setModalMessage] = useState('');

  const handleFileSelected = async (files: File[]) => {
    const file = files[0] || null;
    setSelectedFile(file);
    setResults([]);
    
    if (file) {
      try {
        const pages = await PDFProcessor.getPDFPages(file);
        setTotalPages(pages.length);
        setRanges([{ start: 1, end: pages.length, name: 'Part 1' }]);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }
  };

  const addRange = () => {
    const newRange: SplitRange = {
      start: 1,
      end: totalPages,
      name: `Part ${ranges.length + 1}`
    };
    setRanges([...ranges, newRange]);
  };

  const removeRange = (index: number) => {
    setRanges(ranges.filter((_, i) => i !== index));
  };

  const updateRange = (index: number, field: keyof SplitRange, value: string | number) => {
    const updatedRanges = ranges.map((range, i) => {
      if (i === index) {
        return { ...range, [field]: value };
      }
      return range;
    });
    setRanges(updatedRanges);
  };

  const validateRanges = () => {
    return ranges.every(range => 
      range.start >= 1 && 
      range.end <= totalPages && 
      range.start <= range.end &&
      range.name.trim() !== ''
    );
  };

  const handleSplit = async () => {
    if (!selectedFile || !validateRanges()) return;

    setProcessing(true);
    setModalStatus('processing');
    setModalMessage('Splitting PDF...');

    try {
      const splitFiles = await PDFProcessor.splitPDF(selectedFile, ranges);
      setResults(splitFiles);
      setModalStatus('success');
      setModalMessage(`Successfully split PDF into ${splitFiles.length} parts!`);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      setModalStatus('error');
      setModalMessage('Failed to split PDF. Please try again.');
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
              Split PDF
            </h2>
            <p className="text-gray-600 mb-6">
              Split your PDF into multiple smaller documents by specifying page ranges.
            </p>

            <FileUpload
              onFilesSelected={handleFileSelected}
              acceptedTypes={['application/pdf']}
              multiple={false}
              title="Select PDF File"
              description="Choose a PDF file to split"
            />
          </div>

          {selectedFile && totalPages > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Split Ranges ({totalPages} pages total)
                </h3>
                <button
                  onClick={addRange}
                  className="btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Range
                </button>
              </div>

              <div className="space-y-4">
                {ranges.map((range, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={range.name}
                      onChange={(e) => updateRange(index, 'name', e.target.value)}
                      placeholder="Part name"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Pages:</span>
                      <input
                        type="number"
                        value={range.start}
                        onChange={(e) => updateRange(index, 'start', parseInt(e.target.value) || 1)}
                        min={1}
                        max={totalPages}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="number"
                        value={range.end}
                        onChange={(e) => updateRange(index, 'end', parseInt(e.target.value) || totalPages)}
                        min={1}
                        max={totalPages}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    {ranges.length > 1 && (
                      <button
                        onClick={() => removeRange(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSplit}
                  className="btn-primary"
                  disabled={processing || !validateRanges()}
                >
                  Split PDF
                </button>
              </div>
            </div>
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

      {results.length > 0 && (
        <div className="mt-6">
          <ResultsPanel
            files={results}
            onDownload={handleDownload}
          />
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

export default SplitPDF;