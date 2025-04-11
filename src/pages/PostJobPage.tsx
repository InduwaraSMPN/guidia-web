import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  title: string;
  tags: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
}

export function PostJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    tags: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
  });

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
      description: value
    }));
  };

  const validateDates = (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast.error("Start date cannot be in the past");
      return false;
    }

    if (end < start) {
      toast.error("End date cannot be before start date");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to post a job');
      navigate('/auth/login');
      return;
    }

    if (user.userType !== 'Company') {
      toast.error('Only companies can post jobs');
      return;
    }

    if (!validateDates(formData.startDate, formData.endDate)) {
      return;
    }

    try {
      setIsSubmitting(true);

      // First, fetch the company profile to get the companyID
      const companyResponse = await axiosInstance.get(`/api/companies/profile/${user.id}`);
      const companyData = companyResponse.data;

      if (!companyData || !companyData.companyID) {
        toast.error('Please complete your company profile first');
        navigate('/welcome/company');
        return;
      }

      const formattedTags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const jobData = {
        companyID: companyData.companyID,  // Add the companyID
        title: formData.title.trim(),
        tags: formattedTags.join(','),
        location: formData.location.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'active'  // Add a default status
      };

      const response = await axiosInstance.post('/api/jobs', jobData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        toast.success('Job posted successfully');
        navigate(`/jobs/${response.data.jobID}`);
      }
    } catch (error: any) {
      console.error('Error posting job:', error);
      
      if (error.response?.status === 403) {
        if (error.response.data.error?.includes('Company profile not found')) {
          toast.error('Please complete your company profile first');
          navigate('/welcome/company');
          return;
        }
        toast.error('You do not have permission to post jobs');
        return;
      }

      if (error.response?.status === 401) {
        toast.error('Please log in again');
        navigate('/auth/login');
        return;
      }

      toast.error(
        error.response?.data?.error || 
        'Failed to post job. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-white pt-32 pb-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold font-montserrat text-brand mb-8">Post a Job</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Title/Position<span className="text-brand">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter job title"
              title="Job Title"
              aria-label="Job Title"
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Tags<span className="text-brand">*</span>
              </label>
              <Input
                type="text"
                name="tags"
                placeholder="e.g., Full-time, Engineering"
                value={formData.tags}
                onChange={handleInputChange}
                required
                title="Enter tags separated by commas"
                aria-label="Job Tags"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Location<span className="text-brand">*</span>
              </label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                placeholder="Enter job location"
                title="Job Location"
                aria-label="Job Location"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Description<span className="text-brand">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={handleEditorChange}
              placeholder="Enter job description"
              className="min-h-[200px]"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Start Date<span className="text-brand">*</span>
              </label>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                min={today}
                title="Start Date"
                aria-label="Start Date"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                End Date<span className="text-brand">*</span>
              </label>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                min={formData.startDate || today}
                title="End Date"
                aria-label="End Date"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-start">
            <button
              type="submit"
              className="bg-brand text-white px-12 py-3 rounded-md font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


