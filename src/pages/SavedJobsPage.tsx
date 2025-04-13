import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JobCard, Job } from "@/components/JobCard";
import { Bookmark, ArrowLeft, User, Briefcase, MapPin, Clock } from "lucide-react";
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
    navigate(`/jobs/${jobId}/apply`);
  };

  return (
    <div className="container pt-32 pb-32 max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bookmark className="h-6 w-6 mr-2 text-brand" />
          <h1 className="text-2xl font-bold">Saved Jobs</h1>
        </div>

        {user && (
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-muted-foreground hover:text-brand"
            onClick={() => navigate(`/students/profile/${user.userID}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            <User className="h-4 w-4" />
            Back to Profile
          </Button>
        )}
      </div>

      {isLoading ? (
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
      ) : savedJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-muted-foreground mb-4">
            You haven't saved any jobs yet.
          </p>
          <Button
            onClick={() => navigate("/jobs")}
            className="bg-brand hover:bg-brand-dark text-white"
          >
            Browse Jobs
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
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


