import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { CustomPathwayModal } from './CustomPathwayModal';
import { motion } from 'framer-motion';

interface PathwaySelectorProps {
  selectedPaths: string[];
  onPathwaysChange: (paths: string[]) => void;
  onSave?: () => void;
}

const AVAILABLE_PATHS = [
  'DevOps Engineer',
  'Software Engineer',
  'Cloud Engineer',
  'Data Scientist',
  'UI/UX Designer',
  'Product Manager',
  'Business Analyst',
  'Full Stack Developer',
  'Network Engineer',
  'Systems Architect',
  'Others'
];

export function PathwaySelector({ selectedPaths, onPathwaysChange, onSave }: PathwaySelectorProps) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const handleSelect = (path: string) => {
    if (path === 'Others') {
      setIsCustomModalOpen(true);
    } else if (!selectedPaths.includes(path)) {
      onPathwaysChange([...selectedPaths, path]);
    }
  };

  const handleCustomPathwayConfirm = (pathway: string) => {
    if (!selectedPaths.includes(pathway)) {
      onPathwaysChange([...selectedPaths, pathway]);
    }
    setIsCustomModalOpen(false);
  };

  const handleRemove = (pathToRemove: string) => {
    onPathwaysChange(selectedPaths.filter(path => path !== pathToRemove));
  };

  // Filter suggestions to only show ones not already selected
  const filteredSuggestions = AVAILABLE_PATHS.filter(
    path => !selectedPaths.includes(path)
  );

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

  return (
    <>
      {/* Selected pathways section */}
      <div className="p-6 border-b border-border">
        <label className="block text-sm font-medium text-foreground mb-4">
          Your Selected Career Pathways {selectedPaths.length > 0 &&
            <span className="text-muted-foreground font-normal">
              ({selectedPaths.length}/10)
            </span>
          }
        </label>

        {selectedPaths.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-border rounded-lg bg-secondary">
            <p className="text-muted-foreground">No career pathways selected yet</p>
            <p className="text-sm text-muted-foreground mt-1">Choose from suggestions below or add your own</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedPaths.map((path) => (
              <div
                key={path}
                className="flex items-center justify-between bg-brand text-white px-4 py-2 rounded-md"
              >
                <span>{path}</span>
                <button
                  onClick={() => handleRemove(path)}
                  className="text-white hover:text-muted-foreground"
                  title="Remove pathway"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions section */}
      <div className="p-6">
        <h3 className="text-sm font-medium text-foreground mb-4">
          Suggested Career Pathways:
        </h3>

        {filteredSuggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            All suggested pathways have been selected. You can add custom pathways using the form above.
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSuggestions.map((path) => (
              <motion.div
                key={path}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelect(path)}
                  disabled={selectedPaths.length >= 10}
                  className="text-sm text-brand hover:bg-brand-dark hover:text-white w-full text-left h-auto py-3 px-4 justify-between group transition-all duration-200"
                >
                  <span>{path}</span>
                  <Plus
                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <CustomPathwayModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onConfirm={handleCustomPathwayConfirm}
        type="pathway"
      />
    </>
  );
}


