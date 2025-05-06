

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { SystemHealthCard } from "@/components/admin/SystemHealthCard";

interface SystemHealth {
  schedulerStatus: {
    isRunning: boolean;
    scheduledJobs: Array<{
      name: string;
      nextInvocation: string | null;
    }>;
  };
  databaseStatus: string;
  serverTime: string;
}

function SystemHealthPage() {
  useAuth(); // Ensure user is authenticated
  const token = localStorage.getItem("token");
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/system-health`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch system health data");
      }

      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      console.error("Error fetching system health data:", error);
      toast.error("Failed to load system health data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSystemHealth();
    }
  }, [token, fetchSystemHealth]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSystemHealth();
  };

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">System Health</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      ) : systemHealth ? (
        <SystemHealthCard
          systemHealth={systemHealth}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No system health data available</p>
        </div>
      )}
    </div>
  );
}

export default SystemHealthPage;
