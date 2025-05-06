import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JobCard, Job } from "@/components/JobCard";
import { Bookmark, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function SavedJobsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get("/api/jobs/saved");

        // Transform the data to match the Job interface
        const formattedJobs = response.data.map((job: any) => ({
          id: job.jobID.toString(),
          title: job.title,
          company: job.companyName,
          companyId: job.companyID.toString(),
          sector: job.tags,
          location: job.location,
          description: job.description,
          logo: job.companyLogoPath,
          startDate: new Date(job.startDate).toLocaleDateString(),
          endDate: new Date(job.endDate).toLocaleDateString(),
          isExpired: job.isExpired || (job.endDate && new Date(job.endDate) < new Date())
        }));

        setSavedJobs(formattedJobs);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        toast.error("Failed to load saved jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

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

  return (
    <div className="container pt-24 sm:pt-32 pb-24 sm:pb-32 max-w-[1216px] mx-auto px-3 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
        <div className="flex items-center">
          <Bookmark className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-brand" />
          <h1 className="text-xl sm:text-2xl font-bold">Saved Jobs</h1>
        </div>

        {user && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-brand text-xs sm:text-sm"
            onClick={() => navigate(`/students/profile/${user.userID}`)}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
            Back to Profile
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
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
      ) : savedJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
          <p className="text-muted-foreground text-sm sm:text-base mb-4">
            You haven't saved any jobs yet.
          </p>
          <Button
            onClick={() => navigate("/jobs")}
            className="bg-brand hover:bg-brand-dark text-white text-xs sm:text-sm py-2 h-auto"
          >
            Browse Jobs
          </Button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {savedJobs.map((job, index) => (
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
  );
}


