"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-6 py-5 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-xs">
            MT
          </div>
          <span className="hidden sm:inline">Media Tracker</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/movies" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            Movies
          </Link>
          
          <div className="h-4 w-px bg-slate-200" />
          
          <div className="flex items-center">
            {isPending ? (
              <Spinner className="h-5 w-5" />
            ) : session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 hidden md:inline">
                  Hello, {session.user.name}
                </span>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleLogout}
                  className="w-auto"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
