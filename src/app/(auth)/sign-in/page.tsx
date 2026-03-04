"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/components/Icons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignInPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
    });
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const isDevelopment = process.env.NODE_ENV === "development";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const validateForm = () => {
        const { email, password, name } = formData;
        if (isSignUp && !name.trim()) return setError("Name is required"), false;
        if (!email.trim()) return setError("Email is required"), false;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address"), false;
        if (password.length < 8) return setError("Password must be at least 8 characters long"), false;
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { email, password, name } = formData;
            const { error } = isSignUp 
                ? await authClient.signUp.email({ email, password, name, callbackURL: "/movies" })
                : await authClient.signIn.email({ email, password, callbackURL: "/movies" });

            if (error) setError(error.message || `An error occurred during sign ${isSignUp ? 'up' : 'in'}`);
            else router.push("/movies");
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
            await authClient.signIn.social({ provider: "google", callbackURL: "/movies" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Google sign in failed.");
            setLoading(false);
        }
    };

    const handleDevBypass = async () => {
        setLoading(true);
        setError("");
        const devCreds = { email: "dev@example.com", password: "Password123!", name: "Dev User" };

        try {
            const { error: signInError } = await authClient.signIn.email({ ...devCreds, callbackURL: "/movies" });
            if (signInError) {
                const { error: signUpError } = await authClient.signUp.email({ ...devCreds, callbackURL: "/movies" });
                if (signUpError) setError(`Dev bypass failed: ${signUpError.message}`);
                else router.push("/movies");
            } else router.push("/movies");
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

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                    {isSignUp && (
                        <Input
                            label="Name"
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <Input
                        label="Email"
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Password"
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button type="submit" isLoading={loading} fullWidth>
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </Button>
                </form>

                <div className="mt-6 flex items-center justify-between gap-4">
                    <hr className="w-full border-slate-200" />
                    <span className="text-xs uppercase text-slate-400">or</span>
                    <hr className="w-full border-slate-200" />
                </div>

                <Button variant="outline" onClick={handleGoogleSignIn} isLoading={loading} className="mt-6" fullWidth>
                    <GoogleIcon className="h-4 w-4" />
                    Continue with Google
                </Button>

                {isDevelopment && (
                    <div className="mt-10 pt-6 border-t border-dashed border-slate-200 text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Development Only</p>
                        <Button variant="dev" onClick={handleDevBypass} isLoading={loading} fullWidth>
                            Auto-login as Dev User
                        </Button>
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
