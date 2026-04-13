import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import Button from './Button.jsx';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type = 'info', 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  showCancel = true 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={48} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={48} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={48} className="text-yellow-600" />;
      default:
        return <Info size={48} className="text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className={`${getBgColor()} px-6 py-4 rounded-t-lg flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {getIcon()}
            {title && (
              <h3 className="text-lg font-semibold text-gray-800">
                {title}
              </h3>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <div className="text-gray-700 mb-6">
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {showCancel && (
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {cancelText}
              </Button>
            )}
            <Button
              type="button"
              onClick={handleConfirm}
              className={`${getButtonColor()} text-white`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

