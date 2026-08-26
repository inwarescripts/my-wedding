import type { ReactNode } from "react";
import clsx from "clsx";

export function Section({
  children,
  className,
  id,
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={clsx("relative py-[var(--section-y)]", !bleed && "px-6 md:px-10")}
    >
      {!bleed ? (
        <div className={clsx("mx-auto w-full max-w-6xl", className)}>{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-script text-3xl md:text-4xl text-accent leading-none mb-3">
      {children}
    </p>
  );
}

export function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 my-6" aria-hidden>
      <span className="h-px w-10 bg-line" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
      <span className="h-px w-10 bg-line" />
    </div>
  );
}
