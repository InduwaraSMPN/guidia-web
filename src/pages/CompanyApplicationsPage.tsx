import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Select } from "@/components/ui/Select";

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

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!companyID) return;

        setIsLoading(true);
        const response = await axiosInstance.get(`/api/jobs/applications/company/${companyID}`);
        setApplications(response.data as Application[]);
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
        bgColor = 'bg-gray-500';
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
        bgColor = 'bg-gray-500';
    }

    return (
      <span className={`${bgColor} ${textColor} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container mt-32 mb-32 max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Job Applications</h1>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            You haven't received any job applications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <div key={application.applicationID} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{application.firstName} {application.lastName}</h3>
                    <p className="text-sm text-gray-600">
                      Applied for: <span className="font-medium">{application.jobTitle}</span> ({application.jobLocation})
                    </p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email: {application.email}</p>
                    <p className="text-sm text-gray-500">Phone: {application.phone}</p>
                    <p className="text-sm text-gray-500">
                      Applied: {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
                    </p>
                    {application.statusUpdatedAt && (
                      <p className="text-sm text-gray-500">
                        Status updated: {formatDistanceToNow(new Date(application.statusUpdatedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <div>
                    {application.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Notes:</p>
                        <p className="text-sm text-gray-600">{application.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(application.resumePath, '_blank')}
                  className="flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  View Resume
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openStatusModal(application)}
                >
                  Update Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Update Application Status</h2>
              <p className="text-sm text-gray-600 mt-1">
                Update status for {selectedApplication.firstName} {selectedApplication.lastName}'s application
                for {selectedApplication.jobTitle}
              </p>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="status" className="block text-sm font-medium">Status</label>
                <Select
                  options={statusOptions}
                  value={newStatus ? { value: newStatus, label: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } : null}
                  onChange={(option) => setNewStatus(option?.value || 'pending')}
                  placeholder="Select status"
                  isSearchable={false}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this application"
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800020]"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={isSubmitting || newStatus === selectedApplication?.status}
              >
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

