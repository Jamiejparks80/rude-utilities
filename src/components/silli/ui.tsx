import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  tilt,
}: {
  children: ReactNode;
  className?: string;
  tilt?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "animate-pop-in rounded-3xl border-4 border-foreground bg-card p-6 shadow-[8px_8px_0_0_var(--color-foreground)] transition-transform duration-300 sm:p-8",
        tilt === "left" && "-rotate-1 hover:rotate-0",
        tilt === "right" && "rotate-1 hover:rotate-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PillButton({
  children,
  onClick,
  variant = "accent",
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "accent" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border-4 border-foreground px-7 py-2.5 font-display text-base font-bold shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-150 hover:-translate-y-1 hover:shadow-[4px_8px_0_0_var(--color-foreground)] active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--color-foreground)] disabled:opacity-40 disabled:hover:translate-y-0",
        variant === "accent"
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground hover:bg-secondary",
        className,
      )}
    >
      {children}
    </button>
  );
}

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
    <div className="mb-5">
      <label className="block font-display text-base font-bold text-foreground">{label}</label>
      {hint ? <p className="mb-1 text-xs text-muted-foreground">{hint}</p> : null}
      <div className="mt-1">{children}</div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border-4 border-foreground bg-card px-4 py-2.5 text-base text-foreground outline-none transition-colors focus:border-primary focus:bg-secondary";

export function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7 animate-pop-in">
      <h1 className="font-display text-3xl font-extrabold text-primary sm:text-4xl">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-sm font-semibold text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}

export function Blob({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full bg-secondary blur-xl animate-squish",
        className,
      )}
    />
  );
}
