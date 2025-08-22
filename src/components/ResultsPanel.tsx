import React from 'react';
import { Download, Eye, Copy, FileText, Image } from 'lucide-react';
import { ProcessedFile } from '../types';

interface ResultsPanelProps {
  files: ProcessedFile[];
  extractedText?: string;
  onDownload: (file: ProcessedFile) => void;
  onPreview?: (file: ProcessedFile) => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  files,
  extractedText,
  onDownload,
  onPreview,
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    return FileText;
  };

  if (files.length === 0 && !extractedText) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
      
      {extractedText && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Extracted Text</h4>
            <button
              onClick={() => copyToClipboard(extractedText)}
              className="btn-secondary text-sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {extractedText}
            </pre>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Generated Files</h4>
          <div className="space-y-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileIcon className="w-6 h-6 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {onPreview && file.type.startsWith('image/') && (
                      <button
                        onClick={() => onPreview(file)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    <button
                      onClick={() => onDownload(file)}
                      className="btn-primary text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;