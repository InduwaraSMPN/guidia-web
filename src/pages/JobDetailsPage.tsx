import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase, Building2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Job } from "@/components/JobCard";
import { toast } from "sonner";

export function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          type: response.data.type || "Full-time",
          requirements: response.data.requirements?.split(",") || [],
          functions: response.data.description?.split("\n").filter(Boolean) || [],
          startDate: new Date(response.data.startDate).toLocaleDateString(),
          endDate: new Date(response.data.endDate).toLocaleDateString(),
          isExpired: response.data.isExpired || (response.data.endDate && new Date(response.data.endDate) < new Date())
        };
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details');
        toast.error("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = () => {
    if (job?.isExpired) {
      toast.error("This job posting has expired");
      return;
    }
    navigate(`/jobs/${id}/apply`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !job) return <div>Error loading job details</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Job Details Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.logo ? (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-20 h-20 object-contain rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-xl text-[#800020] mt-2">{job.company}</p>

              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  {job.location}
                </div>
                {job.type && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    {job.type}
                  </div>
                )}
                {job.sector && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-5 w-5 mr-2" />
                    <div className="flex flex-wrap gap-2">
                      {job.sector.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-50 px-3 py-1 rounded-full text-sm"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Button
                onClick={handleApply}
                size="lg"
                disabled={job.isExpired}
                className={`w-32 ${
                  job.isExpired
                    ? "bg-[#800020] hover:bg-rose-800 cursor-not-allowed opacity-50"
                    : "bg-[#800020] hover:bg-rose-800 text-white"
                }`}
              >
                {job.isExpired ? "Expired" : "Apply Now"}
              </Button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Job Description
          </h2>
          <div
            className="prose max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* Requirements Section */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

