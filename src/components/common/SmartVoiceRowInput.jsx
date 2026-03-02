import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const SmartVoiceRowInput = ({ onItemComplete, className = '' }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setIsSupported(false);
        }
    }, []);

    const parseCommand = (text) => {
        if (!text || text.trim() === '') return null;

        const tokens = text.trim().split(/\s+/);
        let name = '';
        let quantity = 1;
        let rate = 0;

        // Try to find numbers at the end
        if (tokens.length >= 2) {
            const lastToken = tokens[tokens.length - 1];
            const secondLastToken = tokens[tokens.length - 2];

            const lastNum = parseFloat(lastToken);
            const secondLastNum = parseFloat(secondLastToken);

            if (!isNaN(lastNum) && !isNaN(secondLastNum)) {
                // Format: Name Qty Rate
                // Example: "Chicken Biryani 2 300"
                rate = lastNum;
                quantity = secondLastNum;
                name = tokens.slice(0, tokens.length - 2).join(' ');
            } else if (!isNaN(lastNum)) {
                // Format: Name Qty (assume Rate is 0) OR Name Rate?
                // Ambiguous. Let's assume Name Qty if typical ordering, or Name Rate.
                // User requirement: "Item Name, Qty, Rate". 
                // Let's assume if 1 number, it's Quantity. Rate defaults to 0.
                quantity = lastNum;
                name = tokens.slice(0, tokens.length - 1).join(' ');
            } else {
                // No numbers at end
                name = text;
            }
        } else {
            // Only 1 token or no numbers
            // Check if single token is a number (unlikely for item name, but possible)
            if (!isNaN(parseFloat(tokens[0]))) {
                // Just a number? Treat as Qty for "Unknown Item"? No, treat as Name "500"
                name = text;
            } else {
                name = text;
            }
        }

        // Clean up name
        name = name.replace(/[.,;]+$/, '').trim(); // Remove trailing punctuation

        return { name, quantity, rate };
    };

    const startListening = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.continuous = true; // Key for "universal" input
            recognition.interimResults = false;
            recognition.lang = 'en-IN';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const lastResultIndex = event.results.length - 1;
                const result = event.results[lastResultIndex];

                if (result.isFinal) {
                    const text = result[0].transcript;
                    setTranscript(text);
                    const parsedItem = parseCommand(text);

                    if (parsedItem && parsedItem.name) {
                        onItemComplete(parsedItem);
                        setTranscript(''); // Clear visual feedback after processing
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Smart voice recognition error', event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setIsListening(false);
                }
            };

            recognition.onend = () => {
                // Verify if we should still be listening (e.g., silence timeout)
                // If the user didn't manually stop, we interactively restart?
                // Browsers often kill 'continuous' on silence. 
                // For a true "always on" feel, we might need to restart.
                // But let's respect the browser's stop for now to avoid loops, 
                // unless we use a state check.
                if (isListening) {
                    // Optional: recognition.start(); // Auto-restart
                    // Let's just update state to show it stopped.
                    setIsListening(false);
                }
            };

            recognition.start();
        } catch (error) {
            console.error('Failed to start smart recognition', error);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) return null;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                type="button"
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-medium text-sm ${isListening
                        ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse shadow-sm'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 shadow-sm'
                    }`}
            >
                {isListening ? (
                    <>
                        <MicOff size={18} />
                        <span>Listening...</span>
                        <span className="flex h-2 w-2 relative ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    </>
                ) : (
                    <>
                        <Mic size={18} />
                        <span>Hands-Free Mode</span>
                    </>
                )}
            </button>
            {isListening && (
                <div className="text-xs text-gray-500 italic hidden md:block animate-in fade-in slide-in-from-left-4">
                    Say: "Item Name [Qty] [Price]"
                </div>
            )}
        </div>
    );
};

export default SmartVoiceRowInput;
