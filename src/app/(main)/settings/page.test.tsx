import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SettingsPage from "./page";
import { authClient } from "@/lib/auth-client";

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user information correctly when signed in", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: { name: "Jane Doe", email: "jane@example.com" },
      },
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    render(<SettingsPage />);
    
    expect(screen.getByDisplayValue("Jane Doe")).toBeDefined();
    expect(screen.getByText("jane@example.com")).toBeDefined();
  });

  it("returns null for guest users", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    const { container } = render(<SettingsPage />);
    expect(container.firstChild).toBeNull();
  });

  it("calls updateUser when form is submitted", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: { name: "Jane Doe", email: "jane@example.com" },
      },
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    vi.mocked(authClient.updateUser).mockResolvedValue({
      data: { user: { name: "Jane Smith" } },
      error: null,
    } as unknown as ReturnType<typeof authClient.updateUser>);

    render(<SettingsPage />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: "Jane Smith" } });
    
    const saveButton = screen.getByText(/save changes/i);
    fireEvent.click(saveButton);

    expect(authClient.updateUser).toHaveBeenCalledWith({ name: "Jane Smith" });
    await waitFor(() => {
      expect(screen.getByText(/name updated successfully/i)).toBeDefined();
    });
  });

  it("calls deleteUser when delete button is clicked and confirmed", async () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: { name: "Jane Doe", email: "jane@example.com" },
      },
      isPending: false,
    } as unknown as ReturnType<typeof authClient.useSession>);

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(authClient.deleteUser).mockResolvedValue({ 
      data: null, 
      error: null 
    } as unknown as ReturnType<typeof authClient.deleteUser>);

    render(<SettingsPage />);
    
    const deleteButton = screen.getByText(/delete account/i);
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(authClient.deleteUser).toHaveBeenCalled();
  });
});
