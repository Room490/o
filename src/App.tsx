import React, { useState } from 'react';
import Header from './components/Header';
import ToolCard from './components/ToolCard';
import ImageToPDF from './tools/ImageToPDF';
import PDFToImage from './tools/PDFToImage';
import PDFToText from './tools/PDFToText';
import TextToPDF from './tools/TextToPDF';
import SplitPDF from './tools/SplitPDF';
import CompressPDF from './tools/CompressPDF';
import AddImageToPDF from './tools/AddImageToPDF';
import PreviewPDF from './tools/PreviewPDF';
import { Tool, ToolType } from './types';

const tools: Tool[] = [
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert multiple images into a single PDF document with automatic sizing and positioning.',
    icon: 'ImageIcon',
    color: 'bg-blue-500'
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Images',
    description: 'Extract each page from your PDF as high-quality PNG or JPEG images.',
    icon: 'FileImage',
    color: 'bg-green-500'
  },
  {
    id: 'pdf-to-text',
    name: 'PDF Text Extractor',
    description: 'Extract all text content from PDF documents for editing or analysis.',
    icon: 'FileText',
    color: 'bg-purple-500'
  },
  {
    id: 'text-to-pdf',
    name: 'Text to PDF',
    description: 'Convert plain text into professionally formatted PDF documents.',
    icon: 'Type',
    color: 'bg-orange-500'
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Divide large PDF files into smaller documents by specifying page ranges.',
    icon: 'Scissors',
    color: 'bg-red-500'
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality for easier sharing.',
    icon: 'Archive',
    color: 'bg-indigo-500'
  },
  {
    id: 'add-image',
    name: 'Add Image to PDF',
    description: 'Insert images at custom positions within existing PDF documents.',
    icon: 'Plus',
    color: 'bg-pink-500'
  },
  {
    id: 'preview-pdf',
    name: 'Preview PDF',
    description: 'View PDF documents with page navigation, zoom controls, and download options.',
    icon: 'Eye',
    color: 'bg-teal-500'
  }
];

function App() {
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);

  const handleToolSelect = (toolId: ToolType) => {
    setSelectedTool(toolId);
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
  };

  const renderTool = () => {
    switch (selectedTool) {
      case 'image-to-pdf':
        return <ImageToPDF onBack={handleBackToTools} />;
      case 'pdf-to-image':
        return <PDFToImage onBack={handleBackToTools} />;
      case 'pdf-to-text':
        return <PDFToText onBack={handleBackToTools} />;
      case 'text-to-pdf':
        return <TextToPDF onBack={handleBackToTools} />;
      case 'split-pdf':
        return <SplitPDF onBack={handleBackToTools} />;
      case 'compress-pdf':
        return <CompressPDF onBack={handleBackToTools} />;
      case 'add-image':
        return <AddImageToPDF onBack={handleBackToTools} />;
      case 'preview-pdf':
        return <PreviewPDF onBack={handleBackToTools} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTool ? (
          <div className="animate-fade-in">
            {renderTool()}
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Professional PDF Tools
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transform, edit, and optimize your PDF documents with our comprehensive 
                suite of AI-powered tools. Fast, secure, and easy to use.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <div key={tool.id} className="animate-slide-up">
                  <ToolCard
                    tool={tool}
                    onClick={() => handleToolSelect(tool.id)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Choose SmartPDF AI?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                    <p className="text-gray-600 text-sm">Process your documents in seconds with our optimized algorithms.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                    <p className="text-gray-600 text-sm">Your files are processed locally and never stored on our servers.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Professional Quality</h3>
                    <p className="text-gray-600 text-sm">Get industry-standard results with our advanced PDF processing.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;