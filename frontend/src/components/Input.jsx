import React, { forwardRef } from "react";
import { clsx } from "clsx";

export const Input = forwardRef(function Input(
  { label, hint, error, id, type = "text", className = "", ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium uppercase tracking-wide text-neutral-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        type={type}
        className={clsx(
          "w-full rounded border px-3 py-1.5 text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:border-black transition-colors",
          error ? "border-red-500" : "border-neutral-300",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
});
