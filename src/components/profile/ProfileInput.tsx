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

  const selectClassName = "flex h-[44px] w-full rounded-md border border-input bg-background px-4 pr-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_8px]";

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
        if (fileValue && fileValue instanceof File) {
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


