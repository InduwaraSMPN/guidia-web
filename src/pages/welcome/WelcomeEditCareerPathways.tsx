import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PathwaySelector } from '@/components/PathwaySelector';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function WelcomeEditCareerPathways() {
  const navigate = useNavigate();
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePathwaysChange = (newPaths: string[]) => {
    setSelectedPaths(newPaths);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/students/career-pathways', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          pathways: selectedPaths
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update career pathways');
      }

      navigate('/welcome/documents');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#800020] mb-4">
            02. Select Your Career Pathways
          </h1>
          <p className="text-lg text-gray-600">
            Choose the career paths you're interested in pursuing
          </p>
        </div>

        <div>
          <PathwaySelector
            selectedPaths={selectedPaths}
            onPathwaysChange={handlePathwaysChange}
            onSave={undefined}
          />

          <div className="mt-8 flex gap-4 justify-end">
            <Button
              onClick={() => navigate('/welcome')}
              type="button"
              variant="outline"
            >
              Back
            </Button>
            <Button
              onClick={handleSave}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
          {error && (
            <div className="mt-4 text-red-600 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
