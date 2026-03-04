"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const isDevelopment = process.env.NODE_ENV === "development";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isSignUp) {
                const { error } = await authClient.signUp.email({
                    email,
                    password,
                    name,
                    callbackURL: "/movies",
                });
                if (error) {
                    setError(error.message || "An error occurred during sign up");
                } else {
                    router.push("/movies");
                }
            } else {
                const { error } = await authClient.signIn.email({
                    email,
                    password,
                    callbackURL: "/movies",
                });
                if (error) {
                    setError(error.message || "Invalid email or password");
                } else {
                    router.push("/movies");
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "/movies",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Google sign in failed.");
            setLoading(false);
        }
    };

    const handleDevBypass = async () => {
        setLoading(true);
        setError("");
        const devEmail = "dev@example.com";
        const devPassword = "Password123!";
        const devName = "Dev User";

        try {
            // Try to sign in first
            const { error: signInError } = await authClient.signIn.email({
                email: devEmail,
                password: devPassword,
                callbackURL: "/movies",
            });

            // If user doesn't exist, sign them up
            if (signInError) {
                const { error: signUpError } = await authClient.signUp.email({
                    email: devEmail,
                    password: devPassword,
                    name: devName,
                    callbackURL: "/movies",
                });

                if (signUpError) {
                    setError(`Dev bypass failed: ${signUpError.message}`);
                } else {
                    router.push("/movies");
                }
            } else {
                router.push("/movies");
            }
        } catch {
            setError("Dev bypass failed. Make sure your database is connected.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-900">
                    {isSignUp ? "Create an account" : "Sign in"}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    {isSignUp ? "Join us to track your movies." : "Welcome back to Media Tracker."}
                </p>

                {error && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {isSignUp && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none ring-slate-900/20 transition focus:ring"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none ring-slate-900/20 transition focus:ring"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 outline-none ring-slate-900/20 transition focus:ring"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:bg-slate-300"
                    >
                        {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between gap-4">
                    <hr className="w-full border-slate-200" />
                    <span className="text-xs uppercase text-slate-400">or</span>
                    <hr className="w-full border-slate-200" />
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                </button>

                {isDevelopment && (
                    <div className="mt-10 pt-6 border-t border-dashed border-slate-200 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Development Only</p>
                        <button
                            onClick={handleDevBypass}
                            disabled={loading}
                            className="w-full rounded-lg border-2 border-orange-200 bg-orange-50 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-orange-100 hover:border-orange-300 disabled:opacity-50"
                        >
                            {loading ? "Please wait..." : "Auto-login as Dev User"}
                        </button>
                    </div>
                )}

                <p className="mt-8 text-center text-sm text-slate-600">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="font-semibold text-slate-900 underline-offset-4 hover:underline"
                    >
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </section>
        </main>
    );
}
