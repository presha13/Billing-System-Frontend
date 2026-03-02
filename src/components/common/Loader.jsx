import React from 'react';

const Loader = ({ message = 'Loading...', size = 'default' }) => {
    const sizeClasses = {
        small: 'w-12 h-12',
        default: 'w-20 h-20',
        large: 'w-32 h-32'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
            {/* Animated Invoice Icon Loader */}
            <div className={`relative ${sizeClasses[size]}`}>
                {/* Outer rotating circle */}
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-spin-slow"></div>

                {/* Middle pulsing circle */}
                <div className="absolute inset-2 border-4 border-indigo-300 rounded-full animate-pulse"></div>

                {/* Inner invoice icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-indigo-600 animate-bounce-subtle"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Animated dots around the circle */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
            </div>

            {/* Loading text with animated dots */}
            <div className="mt-6 flex items-center gap-1">
                <span className="text-gray-600 font-medium">{message}</span>
                <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-progress"></div>
            </div>
        </div>
    );
};

export default Loader;
