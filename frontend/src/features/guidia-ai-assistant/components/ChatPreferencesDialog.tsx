import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { API_URL } from "@/config";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ChatPreferencesDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface UserPreferences {
  autoDeleteDays: number | null;
  defaultSummarize: boolean;
}

export function ChatPreferencesDialog({
  isOpen,
  setIsOpen,
}: ChatPreferencesDialogProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    autoDeleteDays: null,
    defaultSummarize: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user preferences when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchUserPreferences();
    }
  }, [isOpen]);

  const fetchUserPreferences = async () => {
    try {
      setIsLoading(true);
      
      // Import the secure API request function
      const { secureApiRequest } = await import("@/lib/tokenHelper");
      
      const response = await secureApiRequest(`${API_URL}/api/chat-history/preferences`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch preferences: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched user preferences:", data);
      
      if (data.success && data.data) {
        setPreferences({
          autoDeleteDays: data.data.autoDeleteDays,
          defaultSummarize: !!data.data.defaultSummarize,
        });
      }
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Import the secure API request function
      const { secureApiRequest } = await import("@/lib/tokenHelper");
      
      const response = await secureApiRequest(`${API_URL}/api/chat-history/preferences`, {
        method: "PUT",
        body: JSON.stringify(preferences),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.status}`);
      }
      
      console.log("Updated user preferences:", preferences);
      toast.success("Preferences updated successfully");
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoDeleteChange = (value: string) => {
    const days = value === "" ? null : parseInt(value);
    setPreferences((prev) => ({
      ...prev,
      autoDeleteDays: isNaN(days as number) ? null : days,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Preferences</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="autoDeleteDays">
                Auto-delete conversations after (days)
              </Label>
              <Input
                id="autoDeleteDays"
                type="number"
                min="0"
                placeholder="Never auto-delete"
                value={preferences.autoDeleteDays === null ? "" : preferences.autoDeleteDays}
                onChange={(e) => handleAutoDeleteChange(e.target.value)}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to never auto-delete conversations
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="defaultSummarize">Auto-summarize conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate summaries for conversations
                </p>
              </div>
              <Switch
                id="defaultSummarize"
                checked={preferences.defaultSummarize}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, defaultSummarize: checked }))
                }
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
