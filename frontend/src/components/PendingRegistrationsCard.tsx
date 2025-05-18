import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PendingRegistration {
  penRegID: number;
  email: string;
  userData: {
    email: string;
    username: string;
    userType: string;
  };
  createdAt: string;
  status: string;
}

interface PendingRegistrationsCardProps {
    registrations: PendingRegistration[];
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
}

export function PendingRegistrationsCard({ registrations, onApprove, onReject }: PendingRegistrationsCardProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<number | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/approve-registration/${id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Ignore the specific "Pending registration not found" error
        if (data.error === 'Pending registration not found') {
          // Silently remove the registration from the list
          onApprove(id);
          return;
        }
        throw new Error(data.details || data.error || 'Failed to approve registration');
      }

      onApprove(id);
    } catch (error) {
      console.error('Approval failed:', error);
      throw error;
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: number, reason: string) => {
    return toast.promise(
      async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/admin/reject-registration/${id}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.details || data.error || 'Failed to reject registration');
        }

        // Call the onReject prop instead of fetchRegistrations
        onReject(id, reason);
      },
      {
        loading: 'Rejecting registration...',
        success: 'Registration rejected successfully',
        error: (err) => err instanceof Error ? err.message : 'Failed to reject registration'
      }
    );
  };

  const handleRejectSubmit = async () => {
    if (!selectedRegistration || !rejectionReason.trim()) return;
    
    setLoadingId(selectedRegistration);
    try {
      await handleReject(selectedRegistration, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRegistration(null);
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="p-5 border rounded-lg">
        {registrations.length === 0 ? (
          <p className="text-muted-foreground">No pending registrations</p>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => {
              const userData = reg.userData;
              return (
                <div key={reg.penRegID} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{userData.username}</p>
                      <p className="text-sm text-muted-foreground">{userData.email}</p>
                      <p className="text-sm text-muted-foreground">{userData.userType}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(reg.createdAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleApprove(reg.penRegID)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRegistration(reg.penRegID);
                          setShowRejectModal(true);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h4 className="text-lg font-medium mb-4">Reject Registration</h4>
                  <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection"
                      className="w-full p-2 border rounded mb-4"
                      rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                      <button
                          onClick={() => {
                              setShowRejectModal(false);
                              setRejectionReason('');
                              setSelectedRegistration(null);
                          }}
                          className="px-4 py-2 text-muted-foreground hover:text-foreground"
                      >
                          Cancel
                      </button>
              <button
          onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                disabled={!rejectionReason.trim()}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

