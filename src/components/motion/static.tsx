import type * as React from "react";

// Keep server content visible; entrance fades caused navigation flashes.
type StaticProps = React.HTMLAttributes<HTMLDivElement> & {
  // Kept for call-site compatibility — ignored
  delay?: number;
  y?: number;
};

// Renders content instantly
export function Reveal({
  children,
  className,
  delay,
  y,
  ...rest
}: StaticProps) {
  void delay;
  void y;
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

// Renders content instantly
export function FadeIn({ children, className, delay, ...rest }: StaticProps) {
  void delay;
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

// Stagger API kept as plain divs
export function Stagger({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

// Instant page content — no route-change fade, SPA feel
export function PageReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Header renders instantly, fully visible
export function HeaderEnter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
