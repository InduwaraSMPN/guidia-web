import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PageHeading from '../../components/PageHeading';
import { PendingRegistrationsCard } from '../../components/PendingRegistrationsCard';
import { toast } from '../../components/ui/sonner';

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

export function PendingRegistrations() {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const approvingRef = useRef<number[]>([]);

    const fetchRegistrations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/pending-registrations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch registrations');
            }

            const data = await response.json();
            setRegistrations(data);
            setError('');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load registrations';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const handleApprove = useCallback(async (id: number) => {
        try {
            if (approvingRef.current.includes(id)) {
                console.log('Approval already in progress for this registration');
                return;
            }
            
            approvingRef.current = [...approvingRef.current, id];
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`/api/admin/approve-registration/${id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to approve registration');
            }

            await response.json();
            setRegistrations(prev => prev.filter(reg => reg.penRegID !== id));
            toast.success('Registration approved successfully');
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to approve registration';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            approvingRef.current = approvingRef.current.filter(pendingId => pendingId !== id);
            setTimeout(() => fetchRegistrations(), 0);
        }
    }, [fetchRegistrations]);

    const handleReject = useCallback(async (id: number, reason: string) => {
        try {
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

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to reject registration');
            }

            // Update the local state to remove the rejected registration
            setRegistrations(prev => prev.filter(reg => reg.penRegID !== id));
            toast.success('Registration rejected successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to reject registration';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    }, []);

    return (
        <div className="p-6 max-w-[1216px] mx-auto">
            <PageHeading title="Pending Registrations" />
            <div className="max-w-[1216px] mx-auto mt-8">
                {loading ? (
                    <div></div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <PendingRegistrationsCard 
                        registrations={registrations}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
            </div>
        </div>
    );
}

export default PendingRegistrations;
