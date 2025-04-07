import { useState } from 'react';
import { DocumentCategorySelectorProps } from '../../interfaces/Document';
import { CustomDocumentTypeModal } from '../CustomDocumentTypeModal';
import { motion } from 'framer-motion';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DocumentCategorySelector({
  categories,
  selectedCategory,
  onCategorySelect,
  customTypeEnabled = true,
  disabled = false,
  className = '',
  customDocumentType = '',
  onCustomTypeSelect
}: DocumentCategorySelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomTypeModalOpen, setIsCustomTypeModalOpen] = useState(false);

  // Filter suggestions to only show ones not already selected
  const filteredCategories = categories.filter(cat => cat !== selectedCategory);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleCategorySelect = (value: string) => {
    if (value === 'Other' && customTypeEnabled) {
      setIsCustomTypeModalOpen(true);
    } else {
      onCategorySelect(value);
      onCustomTypeSelect(''); // Clear custom type when selecting non-Other category
    }
  };

  const handleCustomTypeConfirm = (documentType: string) => {
    onCustomTypeSelect(documentType);
    setIsCustomTypeModalOpen(false);
    onCategorySelect('Other');
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Selected category section */}
        <div className="p-6 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Document Category<span className="text-[#800020]">*</span>
          </label>
          
          {!selectedCategory ? (
            <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-500">No category selected</p>
              <p className="text-sm text-gray-400 mt-1">Choose from suggestions below</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-[#800020] text-white px-4 py-2 rounded-md">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => {
                    onCategorySelect('');
                    onCustomTypeSelect('');
                  }}
                  className="text-white hover:text-gray-200"
                  title="Remove category"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {selectedCategory === 'Other' && customDocumentType && (
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-3 text-sm">
                  <span className="font-medium">Custom document type: </span> 
                  <span className="text-[#800020]">{customDocumentType}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Available categories section */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Available Categories:
          </h3>
          
          {filteredCategories.length === 0 ? (
            <p className="text-sm text-gray-500 py-2">
              Please clear the current selection to choose a different category.
            </p>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCategories.map((category) => (
                <motion.div
                  key={category}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategorySelect(category)}
                    disabled={disabled}
                    className="text-sm text-[#800020] hover:bg-rose-800 w-full text-left h-auto py-3 px-4 justify-between group transition-all duration-200"
                  >
                    <span>{category}</span>
                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <CustomDocumentTypeModal
        isOpen={isCustomTypeModalOpen}
        onClose={() => {
          setIsCustomTypeModalOpen(false);
          if (!customDocumentType) {
            onCategorySelect('');
          }
        }}
        onConfirm={handleCustomTypeConfirm}
      />
    </div>
  );
}
