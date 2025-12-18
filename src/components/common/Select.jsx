import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({
    value,
    onChange,
    options = [],
    className = '',
    disabled = false,
    placeholder = 'Select...',
    variant = 'default', // 'default' or 'status' (for payment status)
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value) || options[0];
    const displayText = selectedOption ? selectedOption.label : placeholder;

    return (
        <div className={`relative ${className}`} ref={selectRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
          w-full px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 cursor-pointer 
          focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500
          transition-all duration-200 bg-white
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${variant === 'status'
                        ? value === 'paid'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300 rounded-full px-3 py-1 text-xs font-semibold'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300 rounded-full px-3 py-1 text-xs font-semibold'
                        : ''
                    }
        `}
                {...props}
            >
                <div className="flex items-center justify-between">
                    <span>{displayText}</span>
                    <ChevronDown
                        size={14}
                        className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {isOpen && !disabled && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`
                  w-full px-3 py-2 text-left text-xs font-semibold
                  transition-colors duration-150
                  flex items-center justify-between
                  ${value === option.value
                                        ? variant === 'status'
                                            ? option.value === 'paid'
                                                ? 'text-green-700 bg-green-50'
                                                : 'text-red-700 bg-red-50'
                                            : 'bg-indigo-50 text-indigo-700'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }
                  ${variant === 'status' && value !== option.value
                                        ? option.value === 'paid'
                                            ? 'hover:text-green-700 hover:bg-green-50'
                                            : 'hover:text-red-700 hover:bg-red-50'
                                        : ''
                                    }
                `}
                            >
                                <span>{option.label}</span>
                                {value === option.value && (
                                    <span className="ml-2 text-indigo-600">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Select;

