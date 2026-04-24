'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-gray-100 shadow-2xl p-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-50 text-red-500 flex items-center justify-center mx-auto rounded-none border-b-4 border-red-500">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase italic">System Failure</h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">An unexpected runtime exception has occurred.</p>
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center space-x-3 w-full py-4 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all group"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Reload Interface</span>
              </button>
              
              <Link href="/" className="flex items-center justify-center space-x-3 w-full py-4 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 transition-all">
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.children;
  }

  private get children() {
    return this.props.children;
  }
}

export default ErrorBoundary;
