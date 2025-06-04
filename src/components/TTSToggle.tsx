import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface TTSToggleProps {
  isEnabled: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export const TTSToggle: React.FC<TTSToggleProps> = ({
  isEnabled,
  onToggle,
  isLoading = false,
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-5',
    md: 'w-10 h-6',
    lg: 'w-12 h-7'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`
          inline-flex items-center justify-center rounded-full
          transition-all duration-200 ease-in-out
          ${isEnabled 
            ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' 
            : 'bg-gray-300 hover:bg-gray-400 text-gray-600 shadow-sm'
          }
          ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        title={isEnabled ? 'Turn off AI voice (Hindi accent)' : 'Turn on AI voice (Hindi accent)'}
        aria-label={isEnabled ? 'Turn off AI voice' : 'Turn on AI voice'}
      >
        {isLoading ? (
          <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${iconSizeClasses[size]}`} />
        ) : isEnabled ? (
          <Volume2 className={iconSizeClasses[size]} />
        ) : (
          <VolumeX className={iconSizeClasses[size]} />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Voice icon indicator */}
      <div className={`flex items-center ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
        {isEnabled ? (
          <Volume2 className={iconSizeClasses[size]} />
        ) : (
          <VolumeX className={iconSizeClasses[size]} />
        )}
      </div>

      {/* Toggle switch */}
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`
          relative inline-flex ${sizeClasses[size]} rounded-full
          transition-all duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isEnabled 
            ? 'bg-gradient-to-r from-green-400 to-green-500 shadow-lg' 
            : 'bg-gray-300 shadow-sm'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
        `}
        role="switch"
        aria-checked={isEnabled}
        aria-label={isEnabled ? 'Turn off AI voice' : 'Turn on AI voice'}
        title={isEnabled ? 'Turn off AI voice (Hindi accent)' : 'Turn on AI voice (Hindi accent)'}
      >
        {/* Toggle thumb */}
        <span
          className={`
            inline-block ${thumbSizeClasses[size]} rounded-full bg-white shadow-lg
            transition-transform duration-300 ease-in-out
            ${isEnabled 
              ? size === 'sm' ? 'translate-x-3' : size === 'lg' ? 'translate-x-5' : 'translate-x-4'
              : 'translate-x-0.5'
            }
            ${isLoading ? '' : 'group-hover:shadow-xl'}
          `}
        >
          {/* Loading spinner inside thumb when loading */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 border border-gray-400 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
        </span>
      </button>

      {/* Text label */}
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${isEnabled ? 'text-green-700' : 'text-gray-500'}`}>
          AI Voice
        </span>
        <span className="text-xs text-gray-400">
          {isEnabled ? 'Hindi Accent' : 'Disabled'}
        </span>
      </div>
    </div>
  );
}; 