import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
          Unified Tracker
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Track what you are watching
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Start with movies and TV. Search a sample catalog and add titles to
          your personal list.
        </p>
        <Link
          href="/movies"
          className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Open Movie Tracker
        </Link>
      </section>
    </main>
  );
}
