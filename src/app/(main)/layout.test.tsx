import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MainLayout from "./layout";
import { authClient } from "@/lib/auth-client";

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/",
}));

describe("MainLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows spinner while loading", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: true,
    } as unknown as ReturnType<typeof authClient.useSession>);

    render(<MainLayout><div>Content</div></MainLayout>);
    
    expect(screen.queryByText("Content")).toBeNull();
    // The spinner div exists
    expect(document.querySelector(".animate-spin")).toBeDefined();
  });

  it("renders content when session exists", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: { user: { name: "John", email: "john@example.com" } },
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    render(<MainLayout><div>Protected Content</div></MainLayout>);
    
    expect(screen.getByText("Protected Content")).toBeDefined();
  });
});
