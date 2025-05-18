import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/skeleton";
import { ViewDocumentModal } from "@/components/ViewDocumentModal";
import { getFileExtension } from "@/lib/utils";

interface Application {
  applicationID: number;
  jobID: number;
  studentID: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumePath: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'approved';
  submittedAt: string;
  statusUpdatedAt: string | null;
  notes: string | null;
  jobTitle: string;
  jobLocation: string;
  studentProfileImagePath: string | null;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];

export function CompanyApplicationsPage() {
  const { companyID } = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!companyID) return;

        setIsLoading(true);
        const response = await axiosInstance.get(`/api/jobs/applications/company/${companyID}`);

        // Check for duplicate applications
        const applicationIds = response.data.map((app: Application) => app.applicationID);
        const hasDuplicates = new Set(applicationIds).size !== applicationIds.length;

        if (hasDuplicates) {
          console.warn('Duplicate applications detected in response:',
            applicationIds.filter((id: number, index: number) =>
              applicationIds.indexOf(id) !== index
            )
          );
        }

        // Filter out duplicate applications by applicationID
        const uniqueApplications = Array.from(
          new Map(response.data.map((app: Application) => [app.applicationID, app]))
        ).map(([_, app]) => app) as Application[];

        console.log(`Filtered ${response.data.length - uniqueApplications.length} duplicate applications`);
        setApplications(uniqueApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [companyID]);

  const handleStatusChange = async () => {
    if (!selectedApplication || !newStatus) return;

    try {
      setIsSubmitting(true);
      await axiosInstance.patch(
        `/api/jobs/applications/${selectedApplication.applicationID}/status`,
        {
          status: newStatus,
          notes: notes
        }
      );

      // Update the application in the local state
      setApplications(applications.map(app =>
        app.applicationID === selectedApplication.applicationID
          ? { ...app, status: newStatus as any, statusUpdatedAt: new Date().toISOString(), notes }
          : app
      ));

      toast.success('Application status updated successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStatusModal = (application: Application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setNotes(application.notes || '');
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = 'text-white';

    switch (status) {
      case 'pending':
        bgColor = 'bg-secondary0';
        break;
      case 'reviewed':
        bgColor = 'bg-blue-500';
        break;
      case 'shortlisted':
        bgColor = 'bg-indigo-500';
        break;
      case 'approved':
        bgColor = 'bg-green-500';
        break;
      case 'rejected':
        bgColor = 'bg-red-500';
        break;
      default:
        bgColor = 'bg-secondary0';
    }

    return (
      <span className={`${bgColor} ${textColor} text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container mt-24 sm:mt-32 mb-24 sm:mb-32 max-w-[1216px] mx-auto px-3 sm:px-6 lg:px-8 pb-24 sm:pb-32">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Job Applications</h1>

      {isLoading ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-border">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 sm:space-y-2">
                    <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
                    <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
                  </div>
                  <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 rounded-full" />
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-3/4" />
                    <Skeleton className="h-3 sm:h-4 w-1/2" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Skeleton className="h-3 sm:h-4 w-full" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                  </div>
                </div>
              </div>
              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary flex justify-between">
                <Skeleton className="h-8 sm:h-9 w-24 sm:w-32" />
                <Skeleton className="h-8 sm:h-9 w-24 sm:w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
          <p className="text-muted-foreground text-sm sm:text-base">
            You haven't received any job applications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {applications.map((application) => (
            <div key={application.applicationID} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">{application.firstName} {application.lastName}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Applied for: <span className="font-medium">{application.jobTitle}</span> ({application.jobLocation})
                    </p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Email: {application.email}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Phone: {application.phone}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Applied: {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                    </p>
                    {application.statusUpdatedAt && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Status updated: {formatDistanceToNow(new Date(application.statusUpdatedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <div>
                    {application.notes && (
                      <div className="mt-1 sm:mt-2">
                        <p className="text-xs sm:text-sm font-medium">Notes:</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{application.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary flex flex-col sm:flex-row gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDocument({
                      url: application.resumePath,
                      name: `Resume - ${application.firstName} ${application.lastName}`,
                      type: getFileExtension(application.resumePath)
                    });
                  }}
                  className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">View Resume</span>
                  <span className="sm:hidden">Resume</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openStatusModal(application)}
                  className="text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto"
                >
                  Update Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-3 sm:p-4 border-b border-border">
              <h2 className="text-lg sm:text-xl font-semibold">Update Application Status</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Update status for {selectedApplication.firstName} {selectedApplication.lastName}'s application
                for {selectedApplication.jobTitle}
              </p>
            </div>

            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="status" className="block text-xs sm:text-sm font-medium">Status</label>
                <Select
                  options={statusOptions}
                  value={newStatus ? { value: newStatus, label: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } : null}
                  onChange={(option) => setNewStatus(option?.value || 'pending')}
                  placeholder="Select status"
                  isSearchable={false}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="notes" className="block text-xs sm:text-sm font-medium">Notes</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this application"
                  rows={4}
                  className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020] text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-secondary flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isSubmitting || newStatus === selectedApplication?.status}
                className="text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto order-1 sm:order-2"
              >
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedDocument && (
        <ViewDocumentModal
          isOpen={true}
          onClose={() => setSelectedDocument(null)}
          documentUrl={selectedDocument.url}
          documentName={selectedDocument.name}
          documentType={selectedDocument.type}
        />
      )}
    </div>
  );
}


