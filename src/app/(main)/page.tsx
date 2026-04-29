"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const { data: session } = authClient.useSession();

  if (!session) return null;

  return (
    <div className="flex items-center justify-center px-6">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Unified Tracker
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Track what you are watching
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">Signed in as</p>
            <p className="text-sm font-semibold text-slate-900">{session.user.name}</p>
          </div>
        </div>
        
        <p className="mt-4 text-base text-slate-600">
          Start with movies and TV. Search a sample catalog and add titles to
          your personal list.
        </p>

        <div className="mt-8">
          <Link
            href="/movies"
            className="inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 h-11 flex items-center justify-center leading-none"
          >
            <span className="translate-y-[1px]">Open Movie Tracker</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
