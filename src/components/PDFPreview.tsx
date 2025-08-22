import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { PDFPage } from '../types';
import { PDFProcessor } from '../utils/pdfUtils';

interface PDFPreviewProps {
  file: File;
  onPageSelect?: (pageNumber: number) => void;
  selectedPage?: number;
  showDownload?: boolean;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  file,
  onPageSelect,
  selectedPage,
  showDownload = true,
}) => {
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        const pdfPages = await PDFProcessor.getPDFPages(file);
        setPages(pdfPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [file]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    onPageSelect?.(pageNumber);
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load PDF preview
      </div>
    );
  }

  const currentPageData = pages[currentPage - 1];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pages.length}
          </span>
          
          <button
            onClick={() => handlePageChange(Math.min(pages.length, currentPage + 1))}
            disabled={currentPage === pages.length}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {showDownload && (
            <button
              onClick={handleDownload}
              className="btn-primary ml-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* PDF Page */}
      <div className="p-4 overflow-auto max-h-96">
        <div className="flex justify-center">
          <img
            src={currentPageData.imageUrl}
            alt={`Page ${currentPage}`}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
            className={`max-w-full h-auto shadow-lg ${
              selectedPage === currentPage ? 'ring-2 ring-primary-500' : ''
            }`}
          />
        </div>
      </div>

      {/* Page thumbnails */}
      {pages.length > 1 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {pages.map((page) => (
              <button
                key={page.pageNumber}
                onClick={() => handlePageChange(page.pageNumber)}
                className={`flex-shrink-0 p-2 rounded-lg border-2 transition-colors ${
                  currentPage === page.pageNumber
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={page.imageUrl}
                  alt={`Page ${page.pageNumber}`}
                  className="w-16 h-20 object-contain"
                />
                <p className="text-xs text-center mt-1">
                  {page.pageNumber}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFPreview;