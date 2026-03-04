import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  sizeVariant?: "sm" | "md" | "lg";
}

export function Input({ label, id, sizeVariant = "md", className = "", ...props }: InputProps) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        className={`mt-1 w-full rounded-lg border border-slate-300 text-slate-900 outline-none ring-slate-900/20 transition focus:ring ${sizes[sizeVariant]} ${className}`}
        {...props}
      />
    </div>
  );
}
