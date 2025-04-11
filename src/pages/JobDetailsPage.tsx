import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase, Building2, Bookmark, BookmarkCheck } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Job } from "@/components/JobCard";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const isStudent = user?.userType === "Student";

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

  // Check if job is saved
  useEffect(() => {
    const checkIfJobIsSaved = async () => {
      if (!user || !isStudent || !id) return;

      try {
        const response = await axiosInstance.get(`/api/jobs/is-saved/${id}`);
        setIsSaved(response.data.isSaved);
      } catch (error) {
        console.error('Error checking if job is saved:', error);
      }
    };

    checkIfJobIsSaved();
  }, [id, user, isStudent]);

  const handleApply = () => {
    if (job?.isExpired) {
      toast.error("This job posting has expired");
      return;
    }
    navigate(`/jobs/${id}/apply`);
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.error('Please login to save jobs');
      return;
    }

    if (!isStudent) {
      toast.error('Only students can save jobs');
      return;
    }

    setIsSaveLoading(true);

    try {
      if (isSaved) {
        // Unsave job
        await axiosInstance.delete(`/api/jobs/${id}/save`);
        setIsSaved(false);
        toast.success('Job removed from saved jobs');
      } else {
        // Save job
        await axiosInstance.post(`/api/jobs/${id}/save`);
        setIsSaved(true);
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      toast.error(isSaved ? 'Failed to remove job from saved jobs' : 'Failed to save job');
    } finally {
      setIsSaveLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !job) return <div>Error loading job details</div>;

  return (
    <div className="min-h-screen bg-background pt-32 pb-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Job Details Header */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
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
                <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-card-foreground">{job.title}</h1>
              <p className="text-xl text-brand mt-2">{job.company}</p>

              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-2" />
                  {job.location}
                </div>
                {job.type && (
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-5 w-5 mr-2" />
                    {job.type}
                  </div>
                )}
                {job.sector && (
                  <div className="flex items-center text-muted-foreground">
                    <Briefcase className="h-5 w-5 mr-2" />
                    <div className="flex flex-wrap gap-2">
                      {job.sector.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="bg-secondary px-3 py-1 rounded-full text-sm"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {isStudent && (
                <Button
                  onClick={handleSaveJob}
                  disabled={isSaveLoading}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 border-border text-foreground hover:bg-secondary hover:text-brand dark:hover:text-foreground transition-all duration-200"
                  title={isSaved ? "Remove from saved jobs" : "Save job"}
                >
                  {isSaveLoading ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-5 w-5 text-brand" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-5 w-5" />
                          <span>Save Job</span>
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleApply}
                size="lg"
                disabled={job.isExpired}
                className={`w-32 ${
                  job.isExpired
                    ? "bg-brand hover:bg-brand-light cursor-not-allowed opacity-50"
                    : "bg-brand hover:bg-brand-light text-white"
                }`}
              >
                {job.isExpired ? "Expired" : "Apply Now"}
              </Button>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-bold text-card-foreground mb-4">
            Job Description
          </h2>
          <div
            className="prose max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* Requirements Section */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-xl font-bold text-adaptive-dark mb-4">
              Requirements
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
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



