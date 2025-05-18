import { useState } from 'react';
import { ProfileFormProps, ProfileFormState } from '../../interfaces/Profile';
import { ProfileInput } from './ProfileInput';
import { Button } from '../ui/button';
import { LoaderCircle } from 'lucide-react';

export function ProfileForm({
  sections,
  onSubmit,
  onCancel,
  initialData = {},
  isLoading = false,
  className = '',
  submitButtonText = 'Save',
  onFieldChange
}: ProfileFormProps) {
  const [formState, setFormState] = useState<ProfileFormState>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (name: string, value: string | File | null) => {
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));

    // Propagate changes to parent component if needed
    if (onFieldChange) {
      onFieldChange(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await onSubmit(formState);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="space-y-6">
            {section.title && (
              <h2 className="text-xl font-semibold text-brand">
                {section.title}
              </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {section.fields.map((field) => {
                const gridClass = field.gridCols === 2 ? 'col-span-1 md:col-span-2' : '';
                return (
                  <div key={field.name} className={gridClass}>
                    <ProfileInput
                      field={field}
                      value={formState[field.name] || ''}
                      onChange={handleFieldChange}
                      formState={formState}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}

