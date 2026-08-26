"use client";

import { Component, type ReactNode } from "react";

/** A generic error boundary — React only supports these as class components,
 * there's no hook equivalent. Used to contain failures in decorative,
 * best-effort UI (like a WebGL scene whose texture might fail to load) so
 * they disappear gracefully instead of crashing the whole page. */
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
