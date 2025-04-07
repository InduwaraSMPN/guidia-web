export interface DocumentUploaderProps {
  category: string;
  onUpload: (file: File | null) => void;
  selectedFile: File | null;
}
