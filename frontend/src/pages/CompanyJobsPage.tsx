import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobCard, Job } from '../components/JobCard';
import { Building2, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { CompanyImage } from '@/lib/imageUtils';

interface Company {
  companyID: string;
  companyName: string;
  companyLogoPath?: string;
  companyDescription?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyAddress?: string;
  companyCity?: string;
  companyCountry?: string;
}

export function CompanyJobsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyAndJobs = async () => {
      try {
        setIsLoading(true);

        // Fetch company details
        const companyResponse = await axiosInstance.get(`/api/companies/profile/${id}`);
        const companyData = companyResponse.data;

        setCompany({
          companyID: companyData.companyID,
          companyName: companyData.companyName,
          companyLogoPath: companyData.companyLogoPath,
          companyDescription: companyData.companyDescription,
          companyEmail: companyData.companyEmail,
          companyPhone: companyData.companyPhone,
          companyWebsite: companyData.companyWebsite,
          companyAddress: companyData.companyAddress,
          companyCity: companyData.companyCity,
          companyCountry: companyData.companyCountry
        });

        // Get jobs for this company from the postedJobs array
        if (companyData.postedJobs && Array.isArray(companyData.postedJobs)) {
          const jobsData = companyData.postedJobs.map((job: any) => ({
            id: job.jobID.toString(),
            title: job.title,
            company: job.companyName,
            companyId: job.companyID.toString(),
            location: job.location,
            description: job.description,

            logo: job.companyLogoPath,
            sector: job.tags,
            isExpired: job.isExpired || (job.endDate && new Date(job.endDate) < new Date()),
            endDate: job.endDate || ""
          }));

          // Filter out expired jobs if needed
          const activeJobs = jobsData.filter((job: Job) => !job.isExpired);
          setJobs(activeJobs);
        }
      } catch (error) {
        console.error('Error fetching company and jobs:', error);
        setError('Failed to load company information');
        toast.error('Failed to load company information');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCompanyAndJobs();
    }
  }, [id]);

  const handleApply = (jobId: string) => {
    // Check if user is logged in and is a student before applying
    if (!user) {
      toast.error("Please login to apply for jobs");
      navigate('/auth/login');
      return;
    }

    if (user.userType !== "Student") {
      toast.error("You must be logged in as a student to apply");
      return;
    }

    navigate(`/jobs/${jobId}/apply`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 sm:pt-32 px-3 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <div className="max-w-5xl mx-auto">
          {/* Company Header Skeleton */}
          <div className="bg-white rounded-lg border border-border p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg" />

              <div className="space-y-1 sm:space-y-2 w-full">
                <Skeleton className="h-6 sm:h-8 w-full sm:w-64" />
                <Skeleton className="h-4 sm:h-5 w-full sm:w-96" />
              </div>
            </div>
          </div>

          {/* Jobs List Skeleton */}
          <div>
            <Skeleton className="h-6 sm:h-8 w-36 sm:w-48 mb-4 sm:mb-6" />

            <div className="space-y-4 sm:space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-border p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                      <Skeleton className="h-5 sm:h-6 w-3/4" />
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                        <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                        <Skeleton className="h-4 sm:h-5 w-20 sm:w-28" />
                      </div>
                      <Skeleton className="h-3 sm:h-4 w-full" />
                      <Skeleton className="h-3 sm:h-4 w-5/6" />
                      <div className="flex justify-end">
                        <Skeleton className="h-8 sm:h-9 w-24 sm:w-28" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-white pt-24 sm:pt-32 px-3 sm:px-6 lg:px-8 pb-24 sm:pb-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-adaptive-dark">Company not found</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">The company you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/companies')}
            className="mt-4 bg-brand text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-brand-dark transition-colors text-sm sm:text-base"
          >
            View All Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-32 px-3 sm:px-6 lg:px-8 pb-24 sm:pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Company Header */}
        <div className="bg-white rounded-lg border border-border p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {company.companyLogoPath ? (
              <CompanyImage
                src={company.companyLogoPath}
                alt={company.companyName}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg"
                fallbackSrc="/placeholder.svg"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary-light rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
              </div>
            )}

            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-adaptive-dark">{company.companyName}</h1>
              {company.companyDescription && (
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">{company.companyDescription}</p>
              )}
              {company.companyCity && company.companyCountry && (
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                  <span className="inline-flex items-center">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {company.companyCity}, {company.companyCountry}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-adaptive-dark mb-4 sm:mb-6">Open Positions</h2>

          {jobs.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-border">
              <p className="text-sm sm:text-base text-muted-foreground">No open positions at the moment</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


