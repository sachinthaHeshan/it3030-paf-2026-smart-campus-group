"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { emailLoginSchema, firstZodMessage } from "@/lib/schemas";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { login, loginWithEmail, user, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard/");
    }
  }, [user, isLoading, router]);

  const handleGoogleSuccess = async (response: CredentialResponse) => {
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(firstZodMessage(parsed.error, "Please check your inputs."));
      return;
    }
    setLoggingIn(true);
    setError(null);
    try {
      await loginWithEmail(parsed.data.email, parsed.data.password);
      router.push("/dashboard/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="UniFlow logo"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">UniFlow</h1>
            <p className="text-gray-500 text-sm">
              Sign in to manage bookings, resources, and tickets
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loggingIn && <Loader2 size={14} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs uppercase tracking-wide text-gray-400">
              or
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="flex justify-center">
            {loggingIn ? (
              <p className="text-gray-500 py-3 text-sm">Signing you in...</p>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
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

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup/"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>

          <p className="text-xs text-center text-gray-400">
            By signing in, you agree to the UniFlow terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
