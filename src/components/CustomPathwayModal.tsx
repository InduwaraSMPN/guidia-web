import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CustomPathwayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  type: 'pathway' | 'specialization';
}

export function CustomPathwayModal({
  isOpen,
  onClose,
  onConfirm,
  type
}: CustomPathwayModalProps) {
  const [value, setValue] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      setValue(''); // Reset after submission
    }
  };

  const title = type === 'pathway' ? 'Custom Career Pathway' : 'Custom Specialization';
  const label = type === 'pathway' 
    ? 'Enter your desired career pathway'
    : 'Enter your specialization';
  const placeholder = type === 'pathway'
    ? 'e.g., AI Research Scientist, Blockchain Developer'
    : 'e.g., Machine Learning, Cybersecurity';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center  p-4">
      <div className="bg-white rounded-lg w-full max-w-sm px-4 sm:px-6">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}<span className="text-[#800020]">*</span>
            </label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!value.trim()}>
              Confirm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
