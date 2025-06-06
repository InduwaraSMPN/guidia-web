import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/lib/axios";
import { Building2, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ViewDocumentModal } from "@/components/ViewDocumentModal";
import { getFileExtension } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface JobApplication {
  applicationID: number;
  jobID: number;
  jobTitle: string;
  jobLocation: string;
  companyName: string;
  companyLogoPath: string | null;
  resumePath: string;
  submittedAt: string;
  endDate: string;
}

const canDeleteApplication = (application: JobApplication): boolean => {
  try {
    // Parse dates ensuring UTC
    const submissionDate = new Date(application.submittedAt);
    const jobEndDate = new Date(application.endDate);
    const now = new Date();
    const oneDayAfterSubmission = new Date(
      submissionDate.getTime() + 24 * 60 * 60 * 1000
    );

    // Debug logs
    console.log("Date checks:", {
      submissionDate: submissionDate.toISOString(),
      oneDayAfterSubmission: oneDayAfterSubmission.toISOString(),
      jobEndDate: jobEndDate.toISOString(),
      now: now.toISOString(),
      withinSubmissionWindow: now <= oneDayAfterSubmission,
      beforeJobEnd: now <= jobEndDate,
    });

    return now <= oneDayAfterSubmission && now <= jobEndDate;
  } catch (error) {
    console.error("Error checking delete eligibility:", error);
    return false;
  }
};

export function ViewJobApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!user?.userID) return;

        const response = await axiosInstance.get(
          `/api/jobs/applications/student/${user.userID}`
        );

        // Ensure proper date handling
        const mappedApplications = response.data.map((app: any) => ({
          applicationID: app.applicationID,
          jobID: app.jobID,
          jobTitle: app.jobTitle,
          jobLocation: app.jobLocation,
          companyName: app.companyName,
          companyLogoPath: app.companyLogoPath,
          resumePath: app.resumePath,
          submittedAt: app.submittedAt, // Should now be properly formatted from backend
          endDate: app.endDate, // Should now be properly formatted from backend
        }));

        setApplications(mappedApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const handleCloseModal = () => {
    setSelectedDocument(null);
  };

  const handleDelete = async (applicationId: number) => {
    const application = applications.find(
      (app) => app.applicationID === applicationId
    );

    if (!application) {
      toast.error("Application not found");
      return;
    }

    if (!canDeleteApplication(application)) {
      const jobEnded = new Date() > new Date(application.endDate);
      const message = jobEnded
        ? "Applications cannot be deleted after the job posting has ended"
        : "Applications can only be deleted within 24 hours of submission";

      toast.error(message);
      return;
    }

    toast("Are you sure you want to delete this application?", {
      position: "top-center",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            setDeletingId(applicationId);
            const response = await axiosInstance.delete(
              `/api/jobs/applications/${applicationId}`
            );

            if (response.status === 200) {
              setApplications(
                applications.filter(
                  (app) => app.applicationID !== applicationId
                )
              );
              toast.success("Application deleted successfully");
            } else {
              throw new Error("Failed to delete application");
            }
          } catch (error) {
            console.error("Error deleting application:", error);
            toast.error(
              error.response?.data?.error || "Failed to delete application"
            );
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
        className: "bg-transparent text-white hover:bg-transparent",
      },
    });
  };

  const ApplicationCard: React.FC<{ application: JobApplication }> = ({
    application,
  }) => {
    const formatDate = (dateString: string | undefined) => {
      if (!dateString) {
        return "Date not available";
      }

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return "Invalid date";
        }
        return format(date, "PPP");
      } catch (error) {
        return "Invalid date";
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Company Logo - Left Side */}
          {application.companyLogoPath ? (
            <img
              src={application.companyLogoPath}
              alt={`${application.companyName} logo`}
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = "/default-company-logo.png";
              }}
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
          )}

          {/* Job Details - Middle */}
          <div className="flex-grow">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">
              {application.jobTitle}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">{application.companyName}</p>
            <p className="text-sm sm:text-base text-muted-foreground">{application.jobLocation}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Applied on: {formatDate(application.submittedAt)}
            </p>
          </div>

          {/* Action Buttons - Right */}
          <div className="flex gap-2 flex-shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDocument({
                  url: application.resumePath,
                  name: `Resume - ${application.jobTitle}`,
                  type: getFileExtension(application.resumePath),
                });
              }}
              className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9 py-1 flex-1 sm:flex-auto justify-center sm:justify-start"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">View Resume</span>
              <span className="sm:hidden">Resume</span>
            </Button>

            <Button
              size="sm"
              onClick={() => handleDelete(application.applicationID)}
              disabled={
                deletingId === application.applicationID ||
                !canDeleteApplication(application)
              }
              className="flex items-center gap-1 px-3 sm:px-5 py-1 sm:py-2 bg-brand text-white text-xs sm:text-sm rounded-md hover:bg-brand-dark font-medium transition-all duration-200 shadow-sm hover:shadow h-8 sm:h-9 flex-1 sm:flex-auto justify-center"
            >
              {deletingId === application.applicationID ? (
                <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white rounded-full border-t-transparent" />
              ) : (
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-secondary pt-24 sm:pt-32 pb-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-adaptive-dark mb-6 sm:mb-8">
          My Job Applications
        </h1>

        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Company Logo Skeleton */}
                  <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0" />

                  {/* Job Details Skeleton */}
                  <div className="flex-grow space-y-1 sm:space-y-2 w-full sm:w-auto">
                    <Skeleton className="h-5 sm:h-6 w-3/4" />
                    <Skeleton className="h-3 sm:h-4 w-1/2" />
                    <Skeleton className="h-3 sm:h-4 w-1/3" />
                    <Skeleton className="h-3 sm:h-4 w-32 sm:w-40 mt-1 sm:mt-2" />
                  </div>

                  {/* Action Buttons Skeleton */}
                  <div className="flex gap-2 flex-shrink-0 mt-3 sm:mt-0 w-full sm:w-auto">
                    <Skeleton className="h-8 sm:h-9 w-full sm:w-32" />
                    <Skeleton className="h-8 sm:h-9 w-full sm:w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              You haven't submitted any job applications yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application.applicationID}
                application={application}
              />
            ))}
          </div>
        )}

        {selectedDocument && (
          <ViewDocumentModal
            isOpen={true}
            onClose={handleCloseModal}
            documentUrl={selectedDocument.url}
            documentName={selectedDocument.name}
            documentType={selectedDocument.type}
          />
        )}
      </div>
    </div>
  );
}



