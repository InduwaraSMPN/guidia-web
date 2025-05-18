export interface ProfileFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'richtext' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  value?: string | File | null;
  gridCols?: 1 | 2;
  disabled?: boolean;
  dependsOn?: {
    field: string;
    options: Record<string, { value: string; label: string }[]>;
    disableWhenUnavailable?: boolean;
  };
}

export interface ProfileSection {
  title?: string;
  fields: ProfileFormField[];
}

export interface ProfileFormProps {
  sections: ProfileSection[];
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Record<string, any>;
  className?: string;
  submitButtonText?: string;
  onFieldChange?: (name: string, value: any) => void;
}

export interface ProfileFormState {
  [key: string]: string | File | null;
}

export interface FilePreviewProps {
  file: File;
  previewUrl: string;
  onRemove: () => void;
  onPreview: () => void;
  className?: string;
}

export interface ProfileInputProps {
  field: ProfileFormField;
  value: string | File | null;
  onChange: (name: string, value: string | File | null) => void;
  formState: ProfileFormState;
  className?: string;
}
