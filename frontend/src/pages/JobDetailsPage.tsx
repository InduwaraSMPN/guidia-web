import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, Building2, Bookmark, BookmarkCheck, Tag } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Job } from "@/components/JobCard";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 sm:pt-32 pb-24 sm:pb-32 px-3 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Job Details Header Skeleton */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Company Logo Skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg" />
              </div>

              <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                <Skeleton className="h-6 sm:h-8 w-3/4" />
                <Skeleton className="h-5 sm:h-6 w-1/2" />

                <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4">
                  <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                  <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
                  <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-0">
                <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
                <Skeleton className="h-9 sm:h-10 w-24 sm:w-28" />
              </div>
            </div>
          </div>

          {/* Job Description Skeleton */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6 mb-6 sm:mb-8">
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 mb-3 sm:mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
            </div>
          </div>

          {/* Job Requirements Skeleton */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6 mb-6 sm:mb-8">
            <Skeleton className="h-5 sm:h-6 w-36 sm:w-48 mb-3 sm:mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-full" />
              <Skeleton className="h-3 sm:h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background pt-24 sm:pt-32 pb-24 sm:pb-32 px-3 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-card rounded-lg border border-border p-6 sm:p-8 text-center">
          <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">Job Not Found</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)} className="text-sm sm:text-base py-2 h-auto">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 sm:pt-32 pb-24 sm:pb-32 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Job Details Header */}
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.logo ? (
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-card-foreground truncate" title={job.title}>{job.title}</h1>
              <p className="text-lg sm:text-xl text-brand mt-1 sm:mt-2 truncate">{job.company}</p>

              <div className="mt-3 sm:mt-4">
                <div className="flex items-center text-muted-foreground mb-2 sm:mb-3 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  {job.location}
                </div>
                {job.sector && (
                  <div className="w-full">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {job.sector.split(",").map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center text-muted-foreground dark:text-neutral-400 bg-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm"
                        >
                          <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5 text-brand" />
                          <span>{tag.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-0">
              {isStudent && (
                <Button
                  onClick={handleSaveJob}
                  disabled={isSaveLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 border-border text-foreground hover:bg-secondary hover:text-brand dark:hover:text-foreground transition-all duration-200 text-xs sm:text-sm h-9 sm:h-10"
                  title={isSaved ? "Remove from saved jobs" : "Save job"}
                >
                  {isSaveLoading ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 sm:h-5 sm:w-5 text-brand" />
                          <span className="hidden sm:inline">Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Save Job</span>
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleApply}
                size="sm"
                disabled={job.isExpired}
                className={`text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4 ${
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
        <div className="bg-card rounded-lg border border-border p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground mb-3 sm:mb-4">
            Job Description
          </h2>
          <div
            className="prose max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed overflow-hidden"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* Requirements Section */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-adaptive-dark mb-3 sm:mb-4">
              Requirements
            </h2>
            <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-muted-foreground text-sm sm:text-base">
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



