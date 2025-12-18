import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Check, Lock, CreditCard, ArrowLeft } from 'lucide-react';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Default to Pro plan if accessed directly
    const selectedPlan = location.state?.plan || {
        name: 'Pro',
        price: 499,
        period: 'mo',
        features: ['Company branding', 'QR payments', 'Advanced analytics', 'Priority support']
    };

    const handlePayment = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
        }, 2000);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for subscribing to the {selectedPlan.name} plan. Your account has been upgraded.
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="w-full py-3 px-6 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-300"
                    >
                        Continue to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
                .heading { font-family: 'Space Grotesk', sans-serif; }
                * { font-family: 'Sora', sans-serif; }
            `}</style>
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <span className="font-bold text-xl heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Eventify</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Lock className="w-4 h-4 mr-1" /> Secure Checkout
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Form */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Complete your purchase</h1>
                            <p className="text-gray-600">Enter your details to activate your subscription.</p>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input required type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
                                <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>

                                {/* Visual Card Selection */}
                                <div className="flex gap-3 mb-4">
                                    <div className="flex-1 py-3 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-medium cursor-pointer">
                                        <CreditCard className="w-4 h-4 mr-2" /> Card
                                    </div>
                                    <div className="flex-1 py-3 border border-gray-200 bg-white text-gray-600 rounded-lg flex items-center justify-center font-medium hover:bg-gray-50 cursor-pointer">
                                        UPI / Netbanking
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input required type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                            <input required type="text" placeholder="MM/YY" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                            <input required type="text" placeholder="123" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                        <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg hover:shadow-lg shadow-indigo-500/30 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>Pay ₹{selectedPlan.price}</>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-4">
                                By confirming, you agree to our Terms of Service. Authentication is secure and encrypted.
                            </p>
                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:pl-12">
                        <div className="sticky top-8 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100">
                                <h3 className="font-bold text-gray-900 text-lg mb-6">Order Summary</h3>

                                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">{selectedPlan.name} Plan</div>
                                        <div className="text-sm text-gray-500 mt-1">Billed {selectedPlan.period === 'mo' ? 'Monthly' : 'Yearly'}</div>
                                    </div>
                                    <div className="text-xl font-bold text-indigo-600">₹{selectedPlan.price}</div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Includes:</div>
                                    {selectedPlan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center text-sm text-gray-600">
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-indigo-900">
                                        <span className="font-bold">Money-back guarantee</span>
                                        <p className="opacity-80 mt-0.5">Cancel within 14 days for a full refund. No questions asked.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex justify-center gap-6 opacity-60 grayscale">
                                {/* Placeholder for logos like Visa, Mastercard, etc. could go here */}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentPage;
