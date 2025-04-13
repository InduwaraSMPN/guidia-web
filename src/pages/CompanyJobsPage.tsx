import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobCard, Job } from '../components/JobCard';
import { Building2, Briefcase, MapPin, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Company {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

// Mock company data
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Digifindr',
    logo: '/images/company-logos/digifindr.png',
    description: 'Data Driven by Digital Strategies',
  },
  {
    id: '2',
    name: 'PAYable Pvt Ltd',
    logo: '/images/company-logos/payable.png',
    description: 'Leading fintech company in Sri Lanka',
  }
];

// Mock jobs data organized by company
const mockJobsByCompany: Record<string, Job[]> = {
  '1': [
    {
      id: '3',
      title: 'Data Scientist',
      company: 'Digifindr',
      companyId: '1',
      sector: 'Technology',
      location: 'Colombo, Sri Lanka',
      description: 'Join our data science team to develop cutting-edge analytics solutions for our clients.',
      type: 'Full-time',
      logo: '/images/company-logos/digifindr.png'
    },
    {
      id: '4',
      title: 'Digital Marketing Specialist',
      company: 'Digifindr',
      companyId: '1',
      sector: 'Technology',
      location: 'Colombo, Sri Lanka',
      description: 'We are looking for an experienced digital marketing specialist to grow our online presence.',
      type: 'Full-time',
      logo: '/images/company-logos/digifindr.png'
    }
  ],
  '2': [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'PAYable Pvt Ltd',
      companyId: '2',
      sector: 'Finance Technology',
      location: 'Colombo, Sri Lanka',
      description: 'Join our innovative team as a Senior Software Engineer and contribute to the future of financial technology.',
      type: 'Full-time',
      logo: '/images/company-logos/payable.png'
    },
    {
      id: '2',
      title: 'Business Analyst',
      company: 'PAYable Pvt Ltd',
      companyId: '2',
      sector: 'Finance Technology',
      location: 'Colombo, Sri Lanka',
      description: 'We are looking for a Business Analyst to join our growing team.',
      type: 'Full-time',
      logo: '/images/company-logos/payable.png'
    }
  ]
};

export function CompanyJobsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Find the company with the matching ID from our mock data
    const companyId = id || '1';
    const foundCompany = mockCompanies.find(c => c.id === companyId);

    if (foundCompany) {
      setCompany(foundCompany);

      // Get the jobs for this company
      const companyJobs = mockJobsByCompany[companyId] || [];
      setJobs(companyJobs);
    } else {
      // Fallback to first company if not found
      setCompany(mockCompanies[0]);
      setJobs(mockJobsByCompany['1'] || []);
    }
  }, [id]);

  const handleApply = (jobId: string) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Company Header Skeleton */}
          <div className="bg-white rounded-lg border border-border p-6 mb-8">
            <div className="flex items-start gap-6">
              <Skeleton className="w-20 h-20 rounded-lg" />

              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-96" />
              </div>
            </div>
          </div>

          {/* Jobs List Skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-6" />

            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-border p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-28" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex justify-end">
                        <Skeleton className="h-9 w-28" />
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

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Company Header */}
        <div className="bg-white rounded-lg border border-border p-6 mb-8">
          <div className="flex items-start gap-6">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-secondary-light rounded-lg flex items-center justify-center">
                <Building2 className="w-10 h-10 text-muted-foreground" />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold text-adaptive-dark">{company.name}</h1>
              {company.description && (
                <p className="mt-2 text-muted-foreground">{company.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div>
          <h2 className="text-2xl font-bold text-adaptive-dark mb-6">Open Positions</h2>

          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-border">
              <p className="text-muted-foreground">No open positions at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={handleApply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


