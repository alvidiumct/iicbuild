import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface IICLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textClassName?: string;
  subtextClassName?: string;
  forceLogo?: boolean;
}

export const IICLogo: React.FC<IICLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textClassName = '',
  subtextClassName = '',
  forceLogo = false,
}) => {
  const { logoSettings } = useApp();
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-24 h-24 text-2xl',
  };

  const shouldShowLogo = forceLogo || logoSettings.useIICLogo;
  const currentLogoUrl = logoSettings.logoUrl;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {shouldShowLogo && !imgError && currentLogoUrl ? (
        <div
          className={`${sizeClasses[size]} rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200/80 flex items-center justify-center shrink-0 p-0.5 transition-transform hover:scale-105`}
          title="Industrial Innovation Centre (IIC) Logo"
        >
          <img
            src={currentLogoUrl}
            alt="IIC Logo"
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#214FA2] to-blue-600 text-white flex items-center justify-center font-black tracking-tight shadow-md shadow-blue-900/30 shrink-0 select-none`}
        >
          IIC
        </div>
      )}

      {showText && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-bold tracking-tight text-slate-900 leading-none truncate ${
              textClassName || 'text-sm'
            }`}
          >
            IIC Ambassador Platform
          </span>
          <span
            className={`text-slate-500 font-medium leading-tight truncate ${
              subtextClassName || 'text-[10px]'
            }`}
          >
            Daffodil International University
          </span>
        </div>
      )}
    </div>
  );
};
