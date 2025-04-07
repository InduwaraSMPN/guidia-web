import { CircleCheck, LoaderCircle } from 'lucide-react';
import { DocumentUploadProps, DocumentData } from '../../interfaces/Document';
import { Button } from '../ui/button';
import { DocumentPreview } from './DocumentPreview';
import { DocumentCategorySelector } from './DocumentCategorySelector';
import { DocumentUploader } from '../DocumentUploader';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';

export function DocumentUploadForm({
  documentTypes,
  onSubmit,
  onCancel,
  initialDocument,
  customTypeEnabled = true,
  className = '',
  submitButtonText = 'Save'
}: DocumentUploadProps) {
  const {
    file,
    category,
    customDocumentType,
    pdfPreviewData,
    isSubmitting,
    isSuccess,
    error,
    handleUpload,
    handleSubmit: handleDocumentSubmit,
    setCategory,
    setCustomDocumentType,
    reset: resetForm,
    setIsSuccess
  } = useDocumentUpload(async (document: DocumentData) => {
    await onSubmit(document);
    resetForm();
  });

  // Reset success state when category changes
  const handleCategorySelect = (newCategory: string) => {
    setIsSuccess(false);
    setCategory(newCategory);
  };

  const handleNewUpload = () => {
    setIsSuccess(false);
    resetForm();
  };

  return (
    <div className={`${className} space-y-6 mb-8`}>
        <DocumentCategorySelector
          categories={documentTypes}
          selectedCategory={category}
          onCategorySelect={handleCategorySelect}
          customTypeEnabled={customTypeEnabled}
          disabled={isSubmitting}
          customDocumentType={customDocumentType}
          onCustomTypeSelect={setCustomDocumentType}
        />

        {(category && (category !== 'Other' || customTypeEnabled)) && (
          <>
            {(!file && !isSuccess) && (
              <DocumentUploader
                category={category}
                onUpload={handleUpload}
                selectedFile={file}
              />
            )}
            
            {file && !isSuccess && (
              <DocumentPreview
                file={file}
                previewData={pdfPreviewData}
                onRemove={() => handleUpload(null)}
                disabled={isSubmitting}
              />
            )}

            {isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-4 text-sm flex flex-col items-center">
                <CircleCheck className="h-6 w-6 mb-2" />
                <p>Document uploaded successfully!</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  handleUpload(null); // Clear the uploaded file
                  setCategory(''); // Reset category selection
                  setCustomDocumentType(''); // Reset custom type if any
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleDocumentSubmit}
                disabled={!file || isSubmitting || isSuccess}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : isSuccess ? (
                  <>
                    <CircleCheck className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  submitButtonText
                )}
              </Button>
            </div>
          </>
        )}
    </div>
  );
}
