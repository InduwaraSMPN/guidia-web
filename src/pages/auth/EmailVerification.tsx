import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { CheckCircle } from "lucide-react";

export function EmailVerification() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the email from localStorage
    const storedData = localStorage.getItem("registrationData");
    if (storedData) {
      const { email } = JSON.parse(storedData);
      setEmail(email);
    } else {
      // If no data, redirect back to register
      navigate("/auth/register");
    }
  }, [navigate]);

  // Timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      setResendDisabled(true);
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:3001/auth/register/send-otp",
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
        if (response.status === 429) {
          setResendDisabled(true);
          setResendTimer(data.remainingTime * 60);
          return; // Don't set error for cooldown
        }
        throw new Error("Failed to send OTP");
      }

      // On successful send, just clear any existing errors
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message !== "Failed to send OTP") {
        setError(err.message);
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Auto-submit when OTP is complete
  useEffect(() => {
    const submitOTP = async () => {
      if (otp.length === 6) {
        await handleSubmit();
      }
    };
    submitOTP();
  }, [otp]); // Add handleSubmit to dependencies if needed

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return; // Add length check for safety
    
    try {
      setVerifyLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:3001/auth/register/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setResendDisabled(true);
          setResendTimer(data.waitTime);
          return;
        }
        throw new Error("Invalid OTP");
      }

      setVerificationStatus('success');
      setTimeout(() => {
        navigate("/auth/register-continue");
      }, 360);
    } catch (err) {
      setVerificationStatus('error');
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle pasting of multiple characters
      const pastedValue = value.replace(/\D/g, '').slice(0, 6);
      const newOtpValues = [...otpValues];
      
      for (let i = 0; i < pastedValue.length; i++) {
        if (index + i < 6) {
          newOtpValues[index + i] = pastedValue[i];
        }
      }
      
      setOtpValues(newOtpValues);
      setOtp(newOtpValues.join(''));

      // Focus the next empty input or the last input
      const nextIndex = Math.min(index + pastedValue.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Handle single character input
      if (!/^\d*$/.test(value)) return;

      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      setOtp(newOtpValues.join(''));

      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (!pastedData) return;

    const newOtpValues = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      if (index + i < 6) {
        newOtpValues[index + i] = pastedData[i];
      }
    }
    
    setOtpValues(newOtpValues);
    setOtp(newOtpValues.join(''));

    // Focus the next empty input or the last input
    const nextIndex = Math.min(index + pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="min-h-screen bg-white pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-sm px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-[#800020] mb-8">
          Verify Your Email
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-left mb-1">
              Email Address<span className="text-[#800020]">*</span>
            </label>
            <Input type="email" value={email} disabled className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-left mb-1">
              Enter one-time password (OTP)
              <span className="text-[#800020]">*</span>
            </label>
            <div className="flex gap-2 justify-between">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6} // Changed from 1 to 6 to allow paste
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handlePaste(e, index)}
                  className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-1 ${
                    verificationStatus === 'success' 
                      ? 'border-green-500 focus:ring-green-500 focus:border-green-500' 
                      : verificationStatus === 'error' 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-[#800020] focus:ring-[#800020]'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2 pt-2 italic">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              We've sent a verification code to your email.
            </p>
          </div>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={!otp || verifyLoading}
              className="w-full bg-[#800020] text-white py-3 rounded-md font-medium hover:bg-rose-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyLoading ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendDisabled || resendLoading}
              className="w-full border border-[#800020] text-[#800020] py-3 rounded-md font-medium hover:bg-rose-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading
                ? "Sending..."
                : resendTimer > 0
                ? `Retry in ${Math.floor(resendTimer / 60)}:${(resendTimer % 60)
                    .toString()
                    .padStart(2, "0")}`
                : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
