import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dev";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "md",
  isLoading, 
  fullWidth = false,
  className = "", 
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "rounded-lg font-semibold transition disabled:cursor-not-allowed flex items-center justify-center leading-none";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-300",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:bg-slate-50",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50",
    ghost: "bg-transparent text-slate-600 hover:underline underline-offset-4",
    dev: "border-2 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300 disabled:opacity-50",
  };

  const sizes = {
    sm: "px-3 h-9 text-sm",
    md: "px-5 h-11 text-sm",
    lg: "px-6 h-13 text-base",
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        "Please wait..."
      ) : (
        <span className="flex items-center justify-center gap-2 translate-y-[1px]">
          {children}
        </span>
      )}
    </button>
  );
}
