import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Clock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { API_URL } from "../../config";
import { Skeleton } from "@/components/ui/skeleton";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate initial page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process request"
      );
    } finally {
      setLoading(false);
    }
  };

  // Skeleton loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="w-full max-w-sm px-4 sm:px-6">
          <Skeleton className="h-10 w-64 mb-6" />

          <div className="mt-6">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-10 w-full" />
              </div>

              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="w-full max-w-sm px-4 sm:px-6 text-center">
          <div className="mb-8 flex justify-center">
            <Clock className="h-16 w-16 text-brand" />
          </div>
          <h1 className="text-3xl font-bold text-brand mb-4">Check Your Email</h1>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <p className="text-muted-foreground">
              If an account exists with the email address you entered, you will
              receive password reset instructions.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => navigate("/auth/login")}
            size="lg"
            className="w-full"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
      <div className="w-full max-w-sm px-4 sm:px-6">
        <div>
          <h2 className="text-3xl font-extrabold text-brand text-left">Reset Password</h2>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground text-left mb-1">
                  Email Address<span className="text-brand">*</span>
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/auth/login")}
                className="border-brand text-brand bg-background hover:bg-brand-dark hover:text-white w-full"
              >
                Back to Sign In
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}



