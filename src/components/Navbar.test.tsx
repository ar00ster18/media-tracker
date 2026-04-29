import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Navbar } from "./Navbar";
import { authClient } from "@/lib/auth-client";

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
    signOut: vi.fn(),
  },
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign in link for guest users", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    render(<Navbar />);
    
    expect(screen.getByText("Sign In")).toBeDefined();
  });

  it("renders user name and toggles menu for signed in users", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: { name: "Jane Doe", email: "jane@example.com" },
      },
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    render(<Navbar />);
    
    const userButton = screen.getByText("Jane Doe");
    expect(userButton).toBeDefined();

    // Menu should be closed initially
    expect(screen.queryByText("Settings")).toBeNull();

    // Click to open
    fireEvent.click(userButton);
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByText("Sign Out")).toBeDefined();

    // Click to close
    fireEvent.click(userButton);
    expect(screen.queryByText("Settings")).toBeNull();
  });
});
