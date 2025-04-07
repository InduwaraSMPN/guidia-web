export type AcceptType = 'image' | 'pdf' | 'any';

export interface FileUploaderProps {
  acceptType: AcceptType;
  label: string;
  onUpload: (files: File[]) => void;
  selectedFile?: File | null;
  multiple?: boolean;
}
