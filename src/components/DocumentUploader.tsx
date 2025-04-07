import { FileUploader } from './FileUploader';
import { DocumentUploaderProps } from '../interfaces/DocumentUploader';

export function DocumentUploader({ category, onUpload, selectedFile }: DocumentUploaderProps) {
  // Wrapper for backward compatibility
  const handleUpload = (files: File[]) => {
    if (files.length > 0) {
      onUpload(files[0]);
    } else {
      onUpload(null);
    }
  };

  return (
    <FileUploader
      acceptType="pdf"
      label={category}
      onUpload={handleUpload}
      selectedFile={selectedFile}
      multiple={false}
    />
  );
}
