import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { database, auth } from '@/firebase/config';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function FirebaseDebugInfo() {
  const { user } = useAuth();
  const { isFirebaseReady, firebaseError } = useFirebase();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Force a re-render
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-border max-w-md">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Firebase Debug Info</h3>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="mt-2 text-xs">
            <div className="grid grid-cols-2 gap-1">
              <div className="font-medium">Firebase Ready:</div>
              <div className={isFirebaseReady ? 'text-green-500' : 'text-red-500'}>
                {isFirebaseReady ? 'Yes' : 'No'}
              </div>
              
              <div className="font-medium">Firebase Error:</div>
              <div className="text-red-500">
                {firebaseError || 'None'}
              </div>
              
              <div className="font-medium">Database:</div>
              <div className={database ? 'text-green-500' : 'text-red-500'}>
                {database ? 'Initialized' : 'Not initialized'}
              </div>
              
              <div className="font-medium">Auth:</div>
              <div className={auth ? 'text-green-500' : 'text-red-500'}>
                {auth ? 'Initialized' : 'Not initialized'}
              </div>
              
              <div className="font-medium">Current Auth User:</div>
              <div>
                {auth?.currentUser ? (
                  <span className="text-green-500">
                    {auth.currentUser.uid} (Anonymous: {auth.currentUser.isAnonymous ? 'Yes' : 'No'})
                  </span>
                ) : (
                  <span className="text-red-500">No user</span>
                )}
              </div>
              
              <div className="font-medium">App User:</div>
              <div>
                {user ? (
                  <span className="text-green-500">
                    {user.userID} ({user.userType})
                  </span>
                ) : (
                  <span className="text-red-500">No user</span>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="w-full mt-2"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

