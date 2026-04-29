"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 pl-3 pr-2 h-9 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:border-slate-300 leading-none"
        id="user-menu-button"
      >
        <span className="translate-y-[1px]">{user.name}</span>
        <svg className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Link
            href="/settings"
            className="flex items-center h-10 rounded-lg px-4 text-sm text-slate-700 hover:bg-slate-50 transition leading-none"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="translate-y-[1px]">Settings</span>
          </Link>
          <div className="my-1 h-px bg-slate-100" />
          <button
            onClick={handleLogout}
            className="flex items-center w-full h-10 text-left rounded-lg px-4 text-sm text-red-600 hover:bg-red-50 transition font-medium leading-none"
          >
            <span className="translate-y-[1px]">Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
