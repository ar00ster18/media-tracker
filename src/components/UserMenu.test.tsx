import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserMenu } from "./UserMenu";
import { authClient } from "@/lib/auth-client";

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: vi.fn(),
  },
}));

describe("UserMenu", () => {
  const mockUser = { name: "Jane Doe", email: "jane@example.com" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user name and toggles menu", () => {
    render(<UserMenu user={mockUser} />);
    
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

  it("calls signOut when clicking sign out in the menu", async () => {
    vi.mocked(authClient.signOut).mockResolvedValue({ 
      data: null,
      error: null 
    } as unknown as ReturnType<typeof authClient.signOut>);

    render(<UserMenu user={mockUser} />);
    
    fireEvent.click(screen.getByText("Jane Doe"));
    const signOutButton = screen.getByText("Sign Out");
    fireEvent.click(signOutButton);

    expect(authClient.signOut).toHaveBeenCalled();
  });
});
