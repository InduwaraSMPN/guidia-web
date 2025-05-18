import { useEffect, useState } from 'react';
import PageHeading from '../../components/PageHeading';
import DeclinedRegistrationsTable from '../../components/admin/DeclinedRegistrationsTable';

interface Registration {
    penRegID: string;
    email: string;
    userData: string;
    createdAt: string;
}

export function DeclinedRegistrations() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/declined-registrations', {
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
                setError('Failed to load registrations');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    return (
        <div className="p-6 max-w-[1216px] mx-auto">
            <PageHeading title="Declined Registrations" />
            <div className="max-w-[1216px] mx-auto mt-8">
                {loading ? (
                    <div></div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <DeclinedRegistrationsTable registrations={registrations} />
                )}
            </div>
        </div>
    );
}

export default DeclinedRegistrations;
