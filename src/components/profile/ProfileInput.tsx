import { FileUploader } from '../FileUploader';
import { Input } from '../ui/input';
import { RichTextEditor } from '../ui/RichTextEditor';
import { ProfileInputProps } from '../../interfaces/Profile';
import { FilePreview } from './FilePreview';
import { useState } from 'react';
import { ViewDocumentModal } from '../ViewDocumentModal';
import { Select } from '../ui/Select';

export function ProfileInput({
  field,
  value,
  onChange,
  formState,
  className = ''
}: ProfileInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Check if we have a profile image path in the form state
  // This is used when navigating back to the form
  const profileImagePath = formState.profileImagePath as string | undefined;

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      onChange(field.name, file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    onChange(field.name, null);
  };

  // Removed unused selectClassName

  const renderInput = () => {
    switch (field.type) {
      case 'select': {
        let options = field.options || [];
        let isDisabled = field.disabled;
        if (field.dependsOn) {
          const dependentValue = formState[field.dependsOn.field] as string;
          options = field.dependsOn.options[dependentValue] || [];
          // Disable if no dependent value is selected and disableWhenUnavailable is true
          if (field.dependsOn.disableWhenUnavailable && !dependentValue) {
            isDisabled = true;
          }
        }

        return (
          <Select
            options={options.map(option => ({
              value: option.value,
              label: option.label
            }))}
            value={value ? { value: value as string, label: options.find(opt => opt.value === value)?.label || '' } : null}
            onChange={(option) => onChange(field.name, option?.value || '')}
            placeholder={field.placeholder || `Select ${field.label}`}
            isSearchable={field.name === 'studyLevel' ? false : field.name === 'courseLevel' ? formState['studyLevel'] === 'Postgraduate' : true}
            disabled={isDisabled}
          />
        );
      }

      case 'richtext':
        return (
          <RichTextEditor
            value={value as string}
            onChange={(newValue) => onChange(field.name, newValue)}
            placeholder={field.placeholder}
            className="min-h-[160px]"
          />
        );

      case 'file': {
        const fileValue = value as (File | null);

        // If we have a file object, show the file preview
        if (fileValue && fileValue instanceof File) {
          // Create a preview URL if we don't have one yet
          if (!previewUrl) {
            const url = URL.createObjectURL(fileValue);
            setPreviewUrl(url);
          }

          return (
            <>
              <FilePreview
                file={fileValue}
                previewUrl={previewUrl}
                onRemove={handleRemoveFile}
                onPreview={() => setShowPreview(true)}
              />
              {showPreview && (
                <ViewDocumentModal
                  isOpen={true}
                  documentUrl={previewUrl}
                  documentName={fileValue.name}
                  documentType={fileValue.type.startsWith('image/') ? 'Image' : 'Document'}
                  onClose={() => setShowPreview(false)}
                />
              )}
            </>
          );
        }

        // If we have a profile image path but no file object, show the image from the path
        // This happens when navigating back to the form
        if (profileImagePath && field.name === 'image') {
          return (
            <div className="relative">
              <div className="border border-border rounded-md p-2 flex items-center">
                <img
                  src={profileImagePath}
                  alt="Profile"
                  className="h-20 w-20 object-cover rounded-md mr-3"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Current Profile Image</p>
                  <p className="text-xs text-muted-foreground">Upload a new image to replace</p>
                </div>
              </div>

              <div className="mt-2">
                <FileUploader
                  acceptType="image"
                  label="Replace Image"
                  onUpload={handleFileUpload}
                  selectedFile={null}
                  multiple={false}
                />
              </div>
            </div>
          );
        }

        // Default to 'image' if no specific type is provided
        const acceptType = field.options?.[0]?.value === 'pdf' ? 'pdf' : 'image';
        return (
          <FileUploader
            acceptType={acceptType}
            label={field.label}
            onUpload={handleFileUpload}
            selectedFile={fileValue}
            multiple={false}
          />
        );
      }

      default:
        return (
          <Input
            type={field.type}
            name={field.name}
            value={value as string}
            onChange={(e) => onChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            disabled={field.disabled}
            title={field.label}
            aria-label={field.label}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-brand">*</span>}
      </label>
      {renderInput()}
    </div>
  );
}


