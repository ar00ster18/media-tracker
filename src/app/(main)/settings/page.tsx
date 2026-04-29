"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const [name, setName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name);
    }
  }, [session]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await authClient.updateUser({
        name: name,
      });

      if (updateError) {
        setError(updateError.message || "Failed to update name");
      } else {
        setSuccess("Name updated successfully!");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const { error: deleteError } = await authClient.deleteUser();
        
        if (deleteError) {
          setError(deleteError.message || "Failed to delete account");
          return;
        }
        
        window.location.href = "/";
      } catch (err) {
        console.error("Failed to delete account:", err);
        setError("An unexpected error occurred during deletion.");
      }
    }
  };

  if (!session) return null;

  return (
    <div className="mx-auto max-w-2xl px-6">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
      <p className="mt-2 text-slate-600">Manage your account and preferences.</p>

      <div className="mt-8 space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
          <form onSubmit={handleUpdateName} className="mt-6 space-y-4">
            <Input
              label="Full Name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <p className="mt-1 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                {session.user.email}
              </p>
              <p className="mt-1 text-xs text-slate-400 italic">Email cannot be changed currently.</p>
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

            <Button type="submit" isLoading={updating} className="w-auto px-6">
              Save Changes
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-red-100 bg-red-50/30 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
          <p className="mt-2 text-sm text-red-700">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 w-auto px-6"
              id="delete-account-btn"
            >
              Delete Account
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
