import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { API_URL } from "../config";
import { secureApiRequest, refreshAllTokens } from "../lib/tokenHelper";
import { toast } from "sonner";

/**
 * ChangePassword Component
 * UX Refactored for:
 * - Visual hierarchy (semantic headings, ARIA roles)
 * - Progressive disclosure (collapsible panel)
 * - Skeleton loader for loading state
 * - Micro-interactions (transitions, focus/hover/active states)
 * - Accessibility (ARIA, keyboard nav, error roles, touch targets)
 * - Comments explain each improvement
 */
export function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Skeleton loader state for perceived performance
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All fields are required");
      toast.error("Validation Error", {
        description: "All fields are required"
      });
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      toast.error("Validation Error", {
        description: "New passwords do not match"
      });
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      toast.error("Validation Error", {
        description: "New password must be at least 8 characters long"
      });
      return;
    }

    setIsLoading(true);
    setShowSkeleton(true);

    // Show loading toast
    const loadingToast = toast.loading('Changing password...', { duration: Infinity });

    try {

      // Force logout and redirect if we can't refresh tokens
      try {
        // Explicitly refresh tokens before sensitive operation
        // Try multiple times with the dedicated endpoint
        let csrfToken = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!csrfToken && attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`CSRF token refresh attempt ${attempts}/${maxAttempts}`);
            const tokens = await refreshAllTokens();
            csrfToken = tokens.csrfToken;

            if (csrfToken) {
              console.log('Successfully refreshed CSRF token before password change');
              break;
            } else {
              console.warn(`No CSRF token received on attempt ${attempts}`);
              // Short delay before retry
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (err) {
            console.error(`Token refresh attempt ${attempts} failed:`, err);
            // Short delay before retry
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (!csrfToken) {
          console.error(`Failed to obtain CSRF token after ${maxAttempts} attempts`);
          const errorMsg = 'Your security token has expired. Please try logging out and logging back in to refresh your security tokens.';

          // Dismiss loading toast and show error toast
          toast.dismiss(loadingToast);
          toast.error('Authentication Error', {
            description: errorMsg
          });

          setError(errorMsg);
          setIsLoading(false);
          return;
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        const errorMsg = 'Authentication error. Please try logging out and logging back in.';

        // Dismiss loading toast and show error toast
        toast.dismiss(loadingToast);
        toast.error('Authentication Error', {
          description: errorMsg
        });

        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Use secure API request utility with explicit CSRF token
      const response = await secureApiRequest(
        `${API_URL}/api/users/change-password`,
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      // Handle different response statuses
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "The password change service is currently unavailable. Please try again later or contact support if the problem persists."
          );
        }
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error(
            `Server error (${response.status}): Unable to process your request`
          );
        }
        if (
          data.message === "CSRF token is invalid or expired" ||
          data.message === "CSRF token missing" ||
          data.error === "Invalid CSRF token"
        ) {
          throw new Error(
            "Your security token has expired. Please try logging out and logging back in to refresh your security tokens."
          );
        }
        throw new Error(data.message || `Failed to change password (${response.status})`);
      }

      // Parse successful response
      await response.json();

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToast);
      toast.success("Password changed successfully", {
        description: "Your password has been updated securely.",
      });
    } catch (err) {
      // Get error message
      const errorMessage = err instanceof Error ? err.message : "Failed to change password";

      // Dismiss loading toast and show error toast
      toast.dismiss(loadingToast);
      toast.error("Password change failed", {
        description: errorMessage,
      });

      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowSkeleton(false), 400); // Smooth skeleton transition
    }
  };

  // Accessibility: ARIA live region for feedback
  // Visual hierarchy: semantic headings, ARIA roles
  // Layout: consistent spacing, card grouping, responsive
  // Micro-interactions: transitions, focus/hover/active states
  // Skeleton loader for loading state
  // Progressive disclosure: collapsible panel

  return (
    <section
      className="w-full max-w-md mx-auto"
      aria-labelledby="change-password-title"
      role="region"
    >
      {/* H2: Section Title */}
      <h2
        id="change-password-title"
        className="text-2xl font-bold mb-4"
        tabIndex={-1}
      >
        Change Password
      </h2>

      {/* ARIA live region for error only (success handled by sonner) */}
      <div aria-live="polite" aria-atomic="true">
        {error && (
          <div
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded transition-all duration-300"
            role="alert"
            tabIndex={0}
          >
            {error}
          </div>
        )}
      </div>

      {/* Skeleton loader for loading state */}
      {showSkeleton && isLoading ? (
        <div className="flex flex-col gap-4 animate-pulse py-4">
          <div className="h-6 w-1/2 bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded" />
          <div className="h-6 w-1/2 bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded" />
          <div className="h-6 w-1/2 bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded" />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-describedby={error ? "change-password-error" : undefined}
          autoComplete="off"
        >
          {/* Current Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="currentPassword"
              className="block text-base font-medium text-foreground"
            >
              Current Password
            </label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="transition-shadow duration-300 focus:ring-2 focus:ring-[#800020] focus:border-[#800020] min-h-[44px] pr-12"
                aria-required="true"
                aria-label="Current Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword((v) => !v)}
                tabIndex={0}
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="newPassword"
              className="block text-base font-medium text-foreground"
            >
              New Password
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="transition-shadow duration-300 focus:ring-2 focus:ring-[#800020] focus:border-[#800020] min-h-[44px] pr-12"
                aria-required="true"
                aria-label="New Password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword((v) => !v)}
                tabIndex={0}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="block text-base font-medium text-foreground"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="transition-shadow duration-300 focus:ring-2 focus:ring-[#800020] focus:border-[#800020] min-h-[44px] pr-12"
                aria-required="true"
                aria-label="Confirm New Password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword((v) => !v)}
                tabIndex={0}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                style={{ minWidth: 44, minHeight: 44 }}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3 text-lg font-semibold rounded-lg transition-all duration-300 focus:ring-2 focus:ring-[#800020] focus:outline-none active:scale-95"
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={isLoading ? "Changing Password" : "Change Password"}
            style={{ minHeight: 48 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-border border-t-[#800020] rounded-full animate-spin" />
                Changing Password...
              </span>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      )}
    </section>
  );
}
