"use client";

import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="py-8">
        {children}
      </div>
    </div>
  );
}
