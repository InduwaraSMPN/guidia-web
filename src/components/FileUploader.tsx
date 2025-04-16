import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { getFileTypeFromMimeType } from '../lib/azureUtils';
import { UPLOAD_SETTINGS } from '../config';

interface FileUploaderProps {
  acceptType: 'pdf' | 'image' | 'document' | 'any';
  label: string;
  onUpload: (files: File[], fileTypes?: string[]) => void;
  selectedFile?: File | null;
  multiple?: boolean;
  onRemove?: (index: number) => void;
  userID?: string;
  userType?: string;
}

export function FileUploader({
  acceptType,
  label,
  onUpload,
  selectedFile, // Kept for backward compatibility
  multiple = false,
  userID, // Will be used in future implementations
  userType // Will be used in future implementations
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use standardized file types from config
  const validImageExtensions = UPLOAD_SETTINGS.FILE_TYPES.IMAGES;
  const validDocumentExtensions = UPLOAD_SETTINGS.FILE_TYPES.DOCUMENTS;
  const allValidExtensions = UPLOAD_SETTINGS.FILE_TYPES.ALL;

  const hasValidExtension = (filename: string, type: 'pdf' | 'image' | 'document' | 'any' = 'image') => {
    const ext = '.' + filename.split('.').pop()?.toLowerCase();

    if (type === 'any') return true;
    if (type === 'pdf') return ext === '.pdf';
    if (type === 'document') return validDocumentExtensions.includes(ext);
    return validImageExtensions.includes(ext);
  };

  const isValidFile = (file: File) => {
    if (acceptType === 'pdf') {
      return file.type === "application/pdf";
    } else if (acceptType === 'image') {
      return hasValidExtension(file.name, 'image');
    } else if (acceptType === 'document') {
      return hasValidExtension(file.name, 'document');
    } else if (acceptType === 'any') {
      return true;
    }
    return false;
  };

  // Get Azure file type category based on file MIME type
  const getAzureFileType = (file: File): string => {
    return getFileTypeFromMimeType(file.type);
  };

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(isValidFile);
    if (validFiles.length > 0) {
      // Get Azure file types for each file
      const fileTypes = validFiles.map(file => getAzureFileType(file));

      // Pass both files and their Azure file types to the onUpload handler
      onUpload(multiple ? validFiles : [validFiles[0]], fileTypes);
      setErrorMessage(false);
    } else {
      setErrorMessage(true);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Determine the accept attribute value based on acceptType
  let acceptValue = '';
  switch (acceptType) {
    case 'pdf':
      acceptValue = '.pdf';
      break;
    case 'image':
      acceptValue = validImageExtensions.join(',');
      break;
    case 'document':
      acceptValue = validDocumentExtensions.join(',');
      break;
    case 'any':
      acceptValue = allValidExtensions.join(',');
      break;
    default:
      acceptValue = validImageExtensions.join(',');
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer hover:border-brand
        ${dragActive ? 'border-brand bg-brand/5' : 'border-border'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptValue}
        onChange={handleChange}
        multiple={multiple}
        className="hidden"
        aria-label={`Upload ${label}`}
      />
      <div className="flex flex-col items-center text-center">
        <Upload className={`h-12 w-12 ${dragActive ? 'text-brand' : 'text-muted-foreground'}`} />
        <p className="mt-2 text-sm text-muted-foreground">
          Click or drag {multiple ? 'files' : 'file'} to this area to upload your {label}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Please make sure to upload {
            acceptType === 'pdf' ? 'a PDF' :
            acceptType === 'image' ? 'a supported image format (JPG, PNG, GIF, etc)' :
            acceptType === 'document' ? 'a document file (PDF, DOC, DOCX, etc)' :
            'a valid file'
          }
        </p>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-1">
            Please upload a valid file and try again.
          </p>
        )}
      </div>
    </div>
  );
}


