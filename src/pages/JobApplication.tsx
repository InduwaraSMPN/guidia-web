import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Building2 } from 'lucide-react';
import { Job } from '@/components/JobCard';
import axiosInstance from '@/lib/axios';
import { toast } from "sonner";
import { FileUploader } from '@/components/FileUploader';

import { DocumentPreview } from '@/components/document/DocumentPreview';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { validateEmail, validatePhoneNumber, validateText } from '@/utils/validationUtils';





// ... rest of the file remains the same

export function JobApplication() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: null as File | null,
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: '',
  });
  const [pdfPreviewData, setPdfPreviewData] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axiosInstance.get(`/api/jobs/${id}`);
        const jobData = {
          id: response.data.jobID.toString(),
          title: response.data.title,
          company: response.data.companyName,
          companyId: response.data.companyID.toString(),
          sector: response.data.tags,
          location: response.data.location,
          description: response.data.description,
          logo: response.data.companyLogoPath,
          type: response.data.type || 'Full-time',
          endDate: response.data.endDate,
          isExpired: response.data.isExpired || (response.data.endDate && new Date(response.data.endDate) < new Date())
        };
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error("Failed to load job details. Please try again later.");
        navigate('/jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigate]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        return !validateText(value, 2)
          ? "First name must be at least 2 characters"
          : "";

      case 'lastName':
        return !validateText(value, 2)
          ? "Last name must be at least 2 characters"
          : "";

      case 'email':
        return !validateEmail(value)
          ? "Please enter a valid email address"
          : "";

      case 'phone':
        return !validatePhoneNumber(value)
          ? "Please enter a valid phone number"
          : "";

      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    // Sanitize phone input if needed
    let sanitizedValue = value;
    if (name === 'phone') {
      sanitizedValue = value.replace(/[^\d\s\-()+"]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Validate the field
    const error = validateField(name, sanitizedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };



  const validateForm = (): boolean => {
    const newErrors = {
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      resume: !formData.resume ? 'Resume is required' : ''
    };

    setErrors(newErrors);

    // Check if there are any errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.roleId !== 2) {
      toast.error("You must be logged in as a student to apply");
      navigate('/auth/login');
      return;
    }

    // Validate the form
    if (!validateForm()) {
      // Show the first error message
      const firstError = Object.values(errors).find(error => error !== '');
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error("Please fix the errors in the form");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobId', id!);
      formDataToSend.append('studentID', user.userID);
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      } else {
        throw new Error('Resume is required');
      }

      // Log the URL being called
      console.log('Submitting to:', '/api/jobs/applications');

      const response = await axiosInstance.post('/api/jobs/applications', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        toast.success("Your application has been submitted successfully!");
        navigate('/jobs', { state: { applicationSubmitted: true } });
      }
    } catch (error: any) {
      console.error('Error submitting application:', error);
      if (error.response) {
        // Log more detailed error information
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        toast.error(error.response.data.error || "Failed to submit application. Please try again.");
      } else {
        toast.error("Failed to submit application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-32 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Job Details Header Skeleton */}
          <div className="bg-white rounded-lg border border-border p-6 mb-8">
            <div className="flex gap-4 items-start">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          {/* Application Info Notice Skeleton */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <Skeleton className="h-5 w-48 mb-2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Application Form Skeleton */}
          <div className="bg-white rounded-lg border border-border p-6">
            <Skeleton className="h-7 w-48 mb-6" />

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-32 w-full" />
              </div>

              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-adaptive-dark">Job not found</h2>
          <p className="mt-2 text-muted-foreground">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')} className="mt-4">
            View All Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Job Details Header */}
        <div className="bg-white rounded-lg border border-border p-6 mb-8">
          <div className="flex gap-4 items-start">
            {job.logo ? (
              <img
                src={job.logo}
                alt={job.company}
                className="w-16 h-16 object-contain rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-secondary-light rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-adaptive-dark">{job.title}</h1>
              <p className="text-lg text-muted-foreground">{job.company}</p>
              <p className="text-sm text-muted-foreground mt-1">{job.location}</p>
            </div>
          </div>
        </div>

        {/* Application Info Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Important Information</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Applications cannot be modified after submission</li>
            <li>Applications can only be deleted within 24 hours of submission</li>
            <li>Applications cannot be deleted after the job posting has ended</li>
          </ul>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-xl font-bold text-adaptive-dark mb-6">Application Form</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  First Name<span className="text-brand">*</span>
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter first name"
                  title="First Name"
                  aria-label="First Name"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Last Name<span className="text-brand">*</span>
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                  title="Last Name"
                  aria-label="Last Name"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Email<span className="text-brand">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                title="Email"
                aria-label="Email"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Phone<span className="text-brand">*</span>
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                title="Phone"
                aria-label="Phone"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Resume (PDF only)<span className="text-brand">*</span>
              </label>
              {errors.resume && (
                <p className="text-red-500 text-sm mt-1">{errors.resume}</p>
              )}

              {!formData.resume ? (
                <div className={errors.resume ? "border border-red-500 rounded-md p-1" : ""}>
                  <FileUploader
                    acceptType="pdf"
                    label="Resume"
                    onUpload={(files) => {
                      if (files.length > 0) {
                        const file = files[0];

                        // Validate file type
                        if (file.type !== 'application/pdf') {
                          setErrors(prev => ({
                            ...prev,
                            resume: "Please upload a PDF file"
                          }));
                          return;
                        }

                        // Validate file size (5MB limit)
                        if (file.size > 5 * 1024 * 1024) {
                          setErrors(prev => ({
                            ...prev,
                            resume: "Please upload a file smaller than 5MB"
                          }));
                          return;
                        }

                        setFormData(prev => ({
                          ...prev,
                          resume: file
                        }));

                        // Clear resume error
                        setErrors(prev => ({
                          ...prev,
                          resume: ""
                        }));

                        // Create preview URL
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPdfPreviewData(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    selectedFile={formData.resume}
                    multiple={false}
                  />
                </div>
              ) : (
                <DocumentPreview
                  file={formData.resume}
                  previewData={pdfPreviewData}
                  onRemove={() => {
                    setFormData(prev => ({ ...prev, resume: null }));
                    setPdfPreviewData(null);
                    // Set resume error when removing the file
                    setErrors(prev => ({
                      ...prev,
                      resume: "Resume is required"
                    }));
                  }}
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/jobs')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}






