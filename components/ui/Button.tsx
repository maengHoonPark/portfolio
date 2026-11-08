import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

export function buttonClass(variant: Variant = "primary") {
  const base =
    "inline-flex items-center justify-center rounded-button px-6 py-3.5 text-base font-semibold transition-transform duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";
  const styles =
    variant === "primary"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-blue-50 text-blue-500 hover:brightness-95";
  return `${base} ${styles}`;
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  external?: boolean;
  children: ReactNode;
};

export function ButtonLink({ href, variant = "primary", external, children }: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={buttonClass(variant)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
