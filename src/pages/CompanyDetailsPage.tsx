import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  sector: string;
}

// Mock companies data
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Digifindr',
    description: 'Data Driven by Digital Strategies. Digifindr is a cutting-edge technology company specializing in digital transformation and data-driven solutions for businesses across various sectors.',
    logo: '/images/company-logos/payable.png',
    location: 'Colombo, Sri Lanka',
    website: 'https://www.digifindr.com',
    email: 'contact@digifindr.com',
    phone: '+94 11 234 5678',
    sector: 'Technology'
  },
  {
    id: '2',
    name: 'PAYable Pvt Ltd',
    description: 'PAYable is a leading fintech company in Sri Lanka, providing innovative payment solutions to businesses of all sizes. We are committed to transforming the digital payment landscape through cutting-edge technology and exceptional service.',
    logo: '/images/company-logos/payable.png',
    location: 'Colombo, Sri Lanka',
    website: 'https://www.payable.lk',
    email: 'careers@payable.lk',
    phone: '+94 11 123 4567',
    sector: 'Financial Technology'
  }
];

export function CompanyDetailsPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    // Find the company with the matching ID
    const foundCompany = mockCompanies.find(company => company.id === id);
    
    // If company is found, set it to state
    if (foundCompany) {
      setCompany(foundCompany);
    } else {
      // If no matching company is found, default to the first company
      // In a real app, you might want to handle this differently
      setCompany(mockCompanies[0]);
    }
  }, [id]);

  if (!company) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Company Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex gap-8 items-start">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-32 h-32 object-contain rounded-lg border border-gray-200 p-4"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-16 h-16 text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-xl text-[#800020] mt-1">{company.sector}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  {company.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <a 
                    href={`mailto:${company.email}`}
                    className="text-[#800020] hover:underline"
                  >
                    {company.email}
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <Globe className="h-5 w-5 mr-2" />
                  <a 
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#800020] hover:underline"
                  >
                    {company.website}
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2" />
                  {company.phone}
                </div>
              </div>

              <p className="mt-6 text-gray-600">
                {company.description}
              </p>

              <div className="mt-6">
                <Button onClick={() => window.location.href = `/companies/${company.id}/jobs`}>
                  Open Positions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
