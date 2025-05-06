

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeedCard } from "@/components/admin/ActivityFeedCard";

interface ActivityFeed {
  type: string;
  timestamp: string;
  data: any;
}

function ActivityFeedPage() {
  useAuth(); // Ensure user is authenticated
  const token = localStorage.getItem("token");
  const [activities, setActivities] = useState<ActivityFeed[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivityFeed = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/activity-feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity feed");
      }

      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      toast.error("Failed to load activity feed");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchActivityFeed();
    }
  }, [token, fetchActivityFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivityFeed();
  };

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">Activity Feed</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      ) : activities ? (
        <ActivityFeedCard
          activities={activities}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No activity data available</p>
        </div>
      )}
    </div>
  );
}

export default ActivityFeedPage;
