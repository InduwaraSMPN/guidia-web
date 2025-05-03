"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { SecurityAuditCard } from "@/components/admin/SecurityAuditCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SecurityStatistics {
  recentEvents: Array<{
    eventType: string;
    details: string;
    userID: number;
    timeStamp?: string; // Backend uses timeStamp (capital S)
    timestamp?: string; // For backward compatibility
  }>;
  loginAttempts: Array<{
    eventType: string;
    count: number;
  }>;
  accountStatusChanges: number;
}

function SecurityAuditPage() {
  useAuth(); // Ensure user is authenticated
  const token = localStorage.getItem("token");
  const [securityStats, setSecurityStats] = useState<SecurityStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSecurityStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/security-statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch security statistics");
      }

      const data = await response.json();
      setSecurityStats(data);
    } catch (error) {
      console.error("Error fetching security statistics:", error);
      toast.error("Failed to load security statistics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchSecurityStats();
    }
  }, [token, fetchSecurityStats]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSecurityStats();
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      ) : securityStats ? (
        <SecurityAuditCard securityStats={securityStats} />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No security data available</p>
        </div>
      )}
    </div>
  );
}

export default SecurityAuditPage;
