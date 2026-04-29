import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  sizeVariant?: "sm" | "md" | "lg";
}

export function Input({ label, id, sizeVariant = "md", className = "", ...props }: InputProps) {
  const sizes = {
    sm: "px-3 h-9 text-xs",
    md: "px-4 h-11 text-sm",
    lg: "px-4 h-13 text-base",
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border border-slate-300 text-slate-900 outline-none ring-slate-900/20 transition focus:ring leading-none ${sizes[sizeVariant]} ${className}`}
        {...props}
      />
    </div>
  );
}
