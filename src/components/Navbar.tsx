"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "./ui/Spinner";
import { UserMenu } from "./UserMenu";

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
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

          <Link href="/tv" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            TV Shows
          </Link>

          <Link href="/stats" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            Stats
          </Link>
          
          <div className="h-4 w-px bg-slate-200" />
          
          <div className="flex items-center">
            {isPending ? (
              <Spinner className="h-5 w-5" />
            ) : session ? (
              <UserMenu user={session.user} />
            ) : (
              <Link
                href="/sign-in"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 h-9 flex items-center justify-center leading-none"
              >
                <span className="translate-y-[1px]">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
