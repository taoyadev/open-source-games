"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slide" | "scale";
  stagger?: boolean;
}

export function PageTransition({
  children,
  className,
  variant = "fade",
  stagger = false,
}: PageTransitionProps) {
  const animationClass = {
    fade: "animate-fade-in",
    slide: "animate-slide-in",
    scale: "animate-scale-in",
  }[variant];

  return (
    <div className={cn(animationClass, className)}>
      {stagger ? <StaggerChildren>{children}</StaggerChildren> : children}
    </div>
  );
}

interface StaggerChildrenProps {
  children: ReactNode;
}

function StaggerChildren({ children }: StaggerChildrenProps) {
  // Clone children and add staggered animation delays
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <>
      {childrenArray.map((child, index) => {
        if (!child) return null;

        const delayClass =
          index === 0
            ? ""
            : index === 1
              ? "animate-delay-100"
              : index === 2
                ? "animate-delay-200"
                : index === 3
                  ? "animate-delay-300"
                  : "animate-delay-400";

        return (
          <div key={index} className={cn(delayClass, "animate-fade-in")}>
            {child}
          </div>
        );
      })}
    </>
  );
}

// Hook for page transition on route changes
export function usePageTransition() {
  if (typeof window === "undefined") return () => {};

  return () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}
