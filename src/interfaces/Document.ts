export interface DocumentData {
  id: string;
  type: string;
  filename: string;
  content?: string;
}

export interface DocumentUploadProps {
  documentTypes: string[];
  onSubmit: (document: DocumentData) => Promise<void>;
  onCancel: () => void;
  initialDocument?: DocumentData;
  customTypeEnabled?: boolean;
  className?: string;
  submitButtonText?: string;
}

export interface DocumentCategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  customTypeEnabled?: boolean;
  disabled?: boolean;
  className?: string;
  customDocumentType?: string;
  onCustomTypeSelect: (type: string) => void;
}

export interface DocumentPreviewProps {
  file: File;
  previewData: string | null;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}
