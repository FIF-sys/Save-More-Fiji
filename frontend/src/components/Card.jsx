import React from "react";
import { clsx } from "clsx";

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={clsx(
        "bg-white border border-neutral-200 rounded p-5 text-neutral-900",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={clsx("mb-4 border-b border-neutral-100 pb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3 className={clsx("text-base font-semibold text-neutral-900", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={clsx("", className)} {...props}>
      {children}
    </div>
  );
}
