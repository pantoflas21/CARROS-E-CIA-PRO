'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <img
          src="/kinito-logo.svg"
          alt="Kinito Logo"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
            Kinito
          </h1>
          {size !== 'sm' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Movendo seu negócio
            </p>
          )}
        </div>
      )}
    </div>
  );
}

