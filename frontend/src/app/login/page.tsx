"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard/");
    }
  }, [user, isLoading, router]);

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("No credential received from Google");
      return;
    }
    setLoggingIn(true);
    setError(null);
    try {
      await login(response.credential);
      router.push("/dashboard/");
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Smart Campus</h1>
            <p className="text-gray-500">
              Sign in to manage bookings, resources, and tickets
            </p>
          </div>

          <div className="flex justify-center">
            {loggingIn ? (
              <p className="text-gray-500 py-3">Signing you in...</p>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError("Google sign-in failed")}
                size="large"
                width="320"
                text="signin_with"
                shape="rectangular"
                theme="outline"
              />
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}

          <p className="text-xs text-center text-gray-400">
            By signing in, you agree to the Smart Campus terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
