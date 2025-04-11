import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  acceptType: 'pdf' | 'image';
  label: string;
  onUpload: (files: File[]) => void;
  selectedFile?: File | null;
  multiple?: boolean;
  onRemove?: (index: number) => void;
}

export function FileUploader({ 
  acceptType, 
  label, 
  onUpload, 
  selectedFile,
  multiple = false 
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validImageExtensions = [
    '.apng', '.png', '.avif', '.gif', '.jpg', '.jpeg',
    '.jfif', '.pjpeg', '.pjp', '.png', '.svg', '.webp'
  ];

  const hasValidExtension = (filename: string) => {
    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    return validImageExtensions.includes(ext);
  };

  const isValidFile = (file: File) => {
    if (acceptType === 'pdf') {
      return file.type === "application/pdf";
    } else if (acceptType === 'image') {
      return hasValidExtension(file.name);
    }
    return false;
  };

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(isValidFile);
    if (validFiles.length > 0) {
      onUpload(multiple ? validFiles : [validFiles[0]]);
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

  const acceptValue = acceptType === 'pdf' ? '.pdf' : '.apng,.png,.avif,.gif,.jpg,.jpeg,.jfif,.pjpeg,.pjp,.png,.svg,.webp';

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
          Please make sure to upload {acceptType === 'pdf' ? 'a PDF' : 'a supported image format (JPG, PNG, GIF, etc)'}
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


