import React from 'react';

export const EmmyFooter: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm px-8 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <img src="/empathix-icon-white.png" className="w-5 h-5" alt="Empathix" />
          </div>
          <span className="text-sm text-gray-600">
            Powered by <span className="font-semibold">Empathix</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <a href="mailto:hello@empathix.xyz" className="hover:text-purple-600 transition-colors">
            Contact
          </a>
          <a
            href="https://www.empathix.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-600 transition-colors"
          >
            About Empathix
          </a>
        </div>
      </div>
    </footer>
  );
};
