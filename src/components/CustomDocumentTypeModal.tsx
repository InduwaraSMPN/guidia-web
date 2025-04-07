import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CustomDocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (documentType: string) => void;
}

export function CustomDocumentTypeModal({
  isOpen,
  onClose,
  onConfirm
}: CustomDocumentTypeModalProps) {
  const [documentType, setDocumentType] = useState('');
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (documentType.trim()) {
      onConfirm(documentType.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center  p-4">
      <div className="bg-white rounded-lg w-full max-w-sm px-4 sm:px-6">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Custom Document Type</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What type of document is this?<span className="text-[#800020]">*</span>
            </label>
            <Input
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g., Certificate, Award, Letter of Recommendation"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleConfirm}
              disabled={!documentType.trim()}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
