import React from 'react';

interface ErrorSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that catches errors and renders a fallback (or null) instead of crashing
 */
export class ErrorSafeWrapper extends React.Component<
  ErrorSafeWrapperProps,
  { hasError: boolean }
> {
  constructor(props: ErrorSafeWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorSafeWrapper caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

