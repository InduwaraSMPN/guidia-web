import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function RegistrationPending() {
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
        <div className="w-full max-w-sm px-4 sm:px-6 text-center">
          <div className="mb-8 flex justify-center">
            <Skeleton className="h-16 w-16 rounded-full" />
          </div>
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-12 w-40 mx-auto rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-sm px-4 sm:px-6 text-center">
        <div className="mb-8 flex justify-center">
          <Clock className="h-16 w-16 text-brand" />
        </div>
        <h1 className="text-3xl font-bold text-brand mb-4">Registration Under Review</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-muted-foreground mb-4">
            Your registration request has been submitted and is currently under review by our admin team.
          </p>
          <p className="text-muted-foreground mb-4">
            You will receive an email notification once your account has been approved or if we need additional information.
          </p>
          <p className="text-muted-foreground">
            This process typically takes 1-2 business days.
          </p>
        </div>
        <Link
          to="/"
          className="inline-block bg-brand text-white px-6 py-3 rounded-md font-medium hover:bg-brand-dark transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default RegistrationPending;


