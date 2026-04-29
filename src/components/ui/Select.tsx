import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  sizeVariant?: "sm" | "md" | "lg";
}

export function Select({ label, id, options, sizeVariant = "md", className = "", ...props }: SelectProps) {
  const sizes = {
    sm: "px-2 h-9 text-xs",
    md: "px-3 h-11 text-sm",
    lg: "px-4 h-13 text-base",
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-md border border-slate-300 bg-white text-slate-800 outline-none ring-slate-900/20 transition focus:ring leading-none ${sizes[sizeVariant]} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
