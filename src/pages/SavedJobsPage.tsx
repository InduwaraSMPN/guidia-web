import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { JobCard, Job } from "@/components/JobCard";
import { Bookmark, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
    <div className="container pt-32 pb-32 max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bookmark className="h-6 w-6 mr-2 text-[#800020]" />
          <h1 className="text-2xl font-bold">Saved Jobs</h1>
        </div>

        {user && (
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-[#800020]"
            onClick={() => navigate(`/students/profile/${user.userID}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            <User className="h-4 w-4" />
            Back to Profile
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            You haven't saved any jobs yet.
          </p>
          <Button
            onClick={() => navigate("/jobs")}
            className="bg-[#800020] hover:bg-rose-800 text-white"
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
