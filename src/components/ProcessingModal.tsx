import React from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  status: 'processing' | 'success' | 'error';
  message: string;
  onClose: () => void;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  status,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-slide-up">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getTitle()}
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status !== 'processing' && (
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;