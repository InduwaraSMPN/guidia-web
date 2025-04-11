import { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { Job } from './JobCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RichTextEditor } from './ui/RichTextEditor';
import { useAuth } from '../contexts/AuthContext';
import { FileUploader } from './FileUploader';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

export function JobModal({ isOpen, onClose, job }: JobModalProps) {
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null,
  });
  const [pdfPreviewData, setPdfPreviewData] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      coverLetter: value
    }));
  };

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
      
      // Create preview data
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          throw new Error('Failed to read file');
        }
        setPdfPreviewData(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the application to your backend
    console.log('Submitting application:', formData);
    // Close the modal after submission
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center  p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {!showApplicationForm ? (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-brand">{job.title}</h2>
                  <div className="mt-2 space-y-1">
                    <p className="text-muted-foreground">{job.company}</p>
                    <p className="text-muted-foreground">{job.location}</p>
                    {job.type && <p className="text-muted-foreground">{job.type}</p>}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-muted-foreground"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-adaptive-dark">Job Description</h3>
                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-adaptive-dark">Requirements</h3>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {job.requirements ? (
                    job.requirements.map((req: string, index: number) => (
                      <li key={index} className="text-muted-foreground">{req}</li>
                    ))
                  ) : null}
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-adaptive-dark">Functions</h3>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {job.functions ? (
                    job.functions.map((func: string, index: number) => (
                      <li key={index} className="text-muted-foreground">{func}</li>
                    ))
                  ) : null}
                </ul>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Close
                </Button>
                {user?.userType === 'Student' && (
                  <Button
                    onClick={() => setShowApplicationForm(true)}
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-brand">Apply for {job.title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-muted-foreground"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Full Name<span className="text-brand">*</span>
                </label>
                <Input
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  aria-label="Full Name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Email<span className="text-brand">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  aria-label="Email Address"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Phone Number<span className="text-brand">*</span>
                </label>
                <Input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  aria-label="Phone Number"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Cover Letter<span className="text-brand">*</span>
                </label>
                <RichTextEditor
                  value={formData.coverLetter}
                  onChange={handleEditorChange}
                  placeholder="Write your cover letter here"
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Resume/CV<span className="text-brand">*</span>
                </label>
                <FileUploader
                  acceptType="pdf"
                  label="Resume"
                  onUpload={handleFileUpload}
                  selectedFile={formData.resume}
                />
                {formData.resume && (
                  <div className="bg-secondary border border-border rounded-md p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand" />
                      <div>
                        <p className="font-medium text-adaptive-dark">{formData.resume.name}</p>
                        <p className="text-sm text-muted-foreground">{Math.round(formData.resume.size / 1024)} KB</p>
                      </div>
                    </div>
                  </div>
                )}
                {formData.resume && pdfPreviewData && (
                  <div className="bg-secondary border border-border rounded-md p-4 mt-4">
                    <h3 className="text-lg font-semibold mb-2">Document Preview</h3>
                    <div style={{ width: '100%', height: '500px' }}>
                      <iframe
                        src={pdfPreviewData}
                        title="PDF Preview"
                        style={{ width: '100%', height: '100%', border: 'none' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApplicationForm(false)}
                >
                  Back
                </Button>
                <Button type="submit">
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}



