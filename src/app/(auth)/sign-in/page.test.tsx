import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SignInPage from "./page";
import { authClient } from "@/lib/auth-client";

// Mock authClient
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
      social: vi.fn(),
    },
    signUp: {
      email: vi.fn(),
    },
  },
}));

describe("SignInPage", () => {
  it("renders the sign in form by default", () => {
    render(<SignInPage />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });

  it("switches between sign in and sign up when clicking the toggle button", () => {
    render(<SignInPage />);
    
    // Switch to Sign Up
    const toggleButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(toggleButton);
    
    expect(screen.getByRole("heading", { name: /create an account/i })).toBeDefined();
    expect(screen.getByLabelText(/name/i)).toBeDefined();
    
    // Switch back to Sign In
    const toggleBack = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(toggleBack);
    
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeDefined();
  });

  it("shows validation error for invalid email", async () => {
    render(<SignInPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/please enter a valid email address/i)).toBeDefined();
    expect(authClient.signIn.email).not.toHaveBeenCalled();
  });

  it("shows validation error for short password", async () => {
    render(<SignInPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/password must be at least 8 characters long/i)).toBeDefined();
    expect(authClient.signIn.email).not.toHaveBeenCalled();
  });

  it("shows validation error for missing name in sign up", async () => {
    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/name is required/i)).toBeDefined();
    expect(authClient.signUp.email).not.toHaveBeenCalled();
  });

  it("shows an error message when API sign in fails", async () => {
    // Setup mock failure
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      error: { message: "Invalid email or password" },
    } as unknown as ReturnType<typeof authClient.signIn.email>);

    render(<SignInPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeDefined();
    });
  });

  it("shows an error message when API sign up fails", async () => {
    // Switch to sign up mode
    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Setup mock failure
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      error: { message: "Account already exists" },
    } as unknown as ReturnType<typeof authClient.signUp.email>);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign up/i });

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/account already exists/i)).toBeDefined();
    });
  });
});
