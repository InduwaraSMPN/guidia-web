import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobCard, Job } from '../components/JobCard';
import { Building2 } from 'lucide-react';

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
    return null;
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Company Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-6">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              {company.description && (
                <p className="mt-2 text-gray-600">{company.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
          
          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No open positions at the moment</p>
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
