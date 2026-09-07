"use client";

import type { ReactNode, InputHTMLAttributes } from "react";
import { buttonClasses } from "@/components/pouf/Button";
import { cn } from "@/lib/utils";

/** reactbits-style Aurora — soft pastel gradient blobs drifting behind the card. */
export function AuroraField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="aurora-blob left-[-8%] top-[-12%] size-[42vw] bg-mint" />
      <span className="aurora-blob right-[-10%] top-[8%] size-[44vw] bg-purple [animation-delay:-6s]" />
      <span className="aurora-blob bottom-[-16%] left-[18%] size-[40vw] bg-pink [animation-delay:-12s]" />
      <span className="aurora-blob right-[16%] bottom-[-10%] size-[30vw] bg-yellow [animation-delay:-3s] opacity-45" />
    </div>
  );
}

/** Auth content wrapper — the full-screen background lives in the (auth) layout. */
export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="flex w-full justify-center">{children}</div>;
}

/** Clay segmented control — pouf vocabulary, no Radix dependency. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <div
      className="grid gap-1 rounded-control bg-bg p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={buttonClasses({
              tone: "mint",
              size: "sm",
              variant: active ? "solid" : "quiet",
              block: true,
            })}
          >
            <span className="whitespace-nowrap text-xs">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Labeled field with label above the input. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between text-sm font-bold text-ink">
        {label}
        {hint && <span className="text-xs font-bold text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Pouf field input. Caller className merges (e.g. `pl-11` for icon room). */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-control bg-bg px-4 py-3 text-ink outline-none transition-shadow placeholder:text-muted/70 cushion-field focus:cushion-field-focus",
        className,
      )}
    />
  );
}
