
import React, { useState, useEffect } from 'react';
import { Bell, Info, Sparkles, AlertTriangle, X } from 'lucide-react';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        // Generate System Notifications
        const systemNotifications = [];
        const today = new Date();
        const currentMonth = today.getMonth(); // 0-indexed: 2 is March

        // 1. New Financial Year Alert (1 month prior - March)
        if (currentMonth === 2) {
            systemNotifications.push({
                id: 'fy-reminder',
                type: 'warning',
                title: 'New Financial Year Approaching',
                message: `The 2026-27 financial year begins on April 1st. Please ensure your company profile and settings are finalized for the new session.`,
                date: new Date().toLocaleDateString(),
                priority: 'high'
            });
        }

        // 2. Developer Updates (Static for now, could be an API)
        systemNotifications.push({
            id: 'update-v2',
            type: 'info',
            title: 'Version 2.0 Live',
            message: 'We have updated the system architecture for high performance. Auto-bootstrapping for 2026-27 is now active.',
            date: '13 April 2026',
            priority: 'medium'
        });

        systemNotifications.push({
            id: 'update-voice',
            type: 'feature',
            title: 'Smart Voice Input',
            message: 'You can now create bill items using voice commands. Look for the microphone icon in the creation pages!',
            date: '12 April 2026',
            priority: 'low'
        });

        setNotifications(systemNotifications);
        setHasUnread(systemNotifications.length > 0);
    }, []);

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setHasUnread(false);
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="System Notifications"
            >
                <Bell size={24} />
                {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
                        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Sparkles size={18} className="text-indigo-600" />
                                Notifications & Updates
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-4 border-b hover:bg-gray-50 transition-colors ${n.priority === 'high' ? 'bg-amber-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                                n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                                                n.type === 'feature' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
                                            }`}>
                                                {n.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-sm text-gray-900">{n.title}</h4>
                                                    <span className="text-[10px] text-gray-400 font-medium">{n.date}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-10 text-center text-gray-400 italic text-sm">
                                    No notifications for now.
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-gray-50 text-center">
                            <button 
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider"
                                onClick={() => setIsOpen(false)}
                            >
                                Dismiss All
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
