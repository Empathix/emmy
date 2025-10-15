import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface EmmyHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  title?: string;
  subtitle?: string;
  variant?: 'landing' | 'app';
}

export const EmmyHeader: React.FC<EmmyHeaderProps> = ({
  showBackButton = false,
  backHref = '/emmy',
  title = 'Emmy',
  subtitle = 'by Empathix',
  variant = 'landing',
}) => {
  if (variant === 'landing') {
    return (
      <header className="px-8 py-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <img src="/empathix-icon-white.png" className="w-6 h-6" alt="Empathix" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">{title}</span>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {showBackButton ? (
          <Link
            href={backHref}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
        ) : (
          <div className="w-16" />
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <img src="/empathix-icon-white.png" className="w-6 h-6" alt="Emmy" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="w-16" />
      </div>
    </div>
  );
};
