"use client";

import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isPending && !session) {
      const callbackURL = pathname !== "/" ? `?callbackURL=${pathname}` : "";
      router.push(`/sign-in${callbackURL}`);
    }
  }, [session, isPending, router, mounted, pathname]);

  if (!mounted || isPending || !session) {
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
