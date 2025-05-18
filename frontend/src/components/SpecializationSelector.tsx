import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { CustomPathwayModal } from './CustomPathwayModal';

interface SpecializationSelectorProps {
  selectedSpecializations: string[];
  onSpecializationsChange: (specializations: string[]) => void;
  onSave?: () => void;
}

const AVAILABLE_SPECIALIZATIONS = [
  'Technology Career Paths',
  'Business Development',
  'Professional Growth',
  'Industry Transitions',
  'Leadership Development',
  'Career Transition',
  'Resume Building',
  'Interview Preparation',
  'Job Search Strategy',
  'Networking Skills',
  'Others'
];

export function SpecializationSelector({ 
  selectedSpecializations, 
  onSpecializationsChange,
  onSave
}: SpecializationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (specialization: string) => {
    if (specialization === 'Others') {
      setIsCustomModalOpen(true);
    } else if (!selectedSpecializations.includes(specialization)) {
      onSpecializationsChange([...selectedSpecializations, specialization]);
    }
    setIsOpen(false);
  };

  const handleCustomSpecializationConfirm = (specialization: string) => {
    if (!selectedSpecializations.includes(specialization)) {
      onSpecializationsChange([...selectedSpecializations, specialization]);
    }
    setIsCustomModalOpen(false);
  };

  const handleRemove = (specializationToRemove: string) => {
    onSpecializationsChange(selectedSpecializations.filter(s => s !== specializationToRemove));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <button
            onClick={handleToggle}
            className="w-full px-4 py-2 text-left border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]"
          >
            Select Your Specializations
          </button>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg">
              <ul className="py-1 max-h-60 overflow-auto">
                {AVAILABLE_SPECIALIZATIONS.map((specialization) => (
                  <li
                    key={specialization}
                    className="px-4 py-2 hover:bg-secondary-light cursor-pointer"
                    onClick={() => handleSelect(specialization)}
                  >
                    {specialization}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {selectedSpecializations.map((specialization) => (
            <div
              key={specialization}
              className="flex items-center justify-between bg-brand text-white px-4 py-2 rounded-md"
            >
              <span>{specialization}</span>
              <button
                onClick={() => handleRemove(specialization)}
                className="text-white hover:text-muted-foreground"
                title="Remove specialization"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <CustomPathwayModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onConfirm={handleCustomSpecializationConfirm}
        type="specialization"
      />
    </>
  );
}


