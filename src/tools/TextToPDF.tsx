import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProcessingModal from '../components/ProcessingModal';
import ResultsPanel from '../components/ResultsPanel';
import { ProcessedFile } from '../types';
import { PDFProcessor } from '../utils/pdfUtils';

interface TextToPDFProps {
  onBack: () => void;
}

const TextToPDF: React.FC<TextToPDFProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedFile | null>(null);
  const [modalStatus, setModalStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [modalMessage, setModalMessage] = useState('');

  const handleConvert = async () => {
    if (!text.trim()) return;

    setProcessing(true);
    setModalStatus('processing');
    setModalMessage('Converting text to PDF...');

    try {
      const pdfBytes = await PDFProcessor.textToPDF(text, title || 'Document');
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const resultFile: ProcessedFile = {
        id: 'text-pdf',
        name: `${title || 'document'}.pdf`,
        type: 'application/pdf',
        size: blob.size,
        url,
        data: pdfBytes,
      };

      setResult(resultFile);
      setModalStatus('success');
      setModalMessage('Text successfully converted to PDF!');
    } catch (error) {
      console.error('Error converting text:', error);
      setModalStatus('error');
      setModalMessage('Failed to convert text to PDF. Please try again.');
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

  const loadSampleText = () => {
    setText(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`);
    setTitle('Sample Document');
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
          Text to PDF Converter
        </h2>
        <p className="text-gray-600 mb-6">
          Convert your text content into a professionally formatted PDF document. 
          Perfect for creating documents from plain text.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Text Content
              </label>
              <button
                onClick={loadSampleText}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Load Sample Text
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter or paste your text here..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {text.length} characters
            </p>
          </div>

          <button
            onClick={handleConvert}
            className="btn-primary"
            disabled={processing || !text.trim()}
          >
            Convert to PDF
          </button>
        </div>
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

export default TextToPDF;