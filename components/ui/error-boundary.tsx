"use client";

import { Component, type ReactNode } from "react";
import { Button } from "./button";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="mb-2 text-xl font-semibold text-navy">Bir hata olustu</h2>
            <p className="mb-4 text-sm text-navy/60">
              {this.state.error?.message || "Beklenmeyen bir hata olustu"}
            </p>
            <Button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Sayfayi Yenile
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
