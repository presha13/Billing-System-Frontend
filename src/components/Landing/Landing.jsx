import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { Zap, BarChart3, Lock, FileText, ArrowRight, Sparkles } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
=======
import { Zap, BarChart3, Lock, FileText, ArrowRight, Sparkles } from 'lucide-react';

const Landing = () => {
  // Replace these with your actual navigation
  const navigate = (path) => {
    window.location.href = path;
  };
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
  const [open, setOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
        * { font-family: 'Sora', sans-serif; }
        h1, h2, h3, .heading { font-family: 'Space Grotesk', sans-serif; }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-floatLogo { animation: floatLogo 3s ease-in-out infinite; }
      `}</style>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Glass effect navbar */}
      <div className="fixed top-0 inset-x-0 z-40">
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="backdrop-blur-xl bg-white/40 border border-white/50 shadow-sm rounded-3xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 group">
              {/* Logo */}
              <div className="relative animate-floatLogo">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="heading text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Eventify</span>
                <p className="text-xs font-semibold text-indigo-600 -mt-1">Smart Billing</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
              {['About', 'Plans', 'Privacy', 'Terms', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-indigo-600 transition-colors duration-300 relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </nav>

            <div className="hidden md:flex gap-2 items-center">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 rounded-full text-indigo-600 hover:bg-indigo-50 font-semibold transition-all duration-300 hover:scale-105"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 font-semibold transition-all duration-300 hover:scale-105"
              >
                Sign up
              </button>
            </div>

            <button onClick={() => setOpen(!open)} className="md:hidden px-3 py-2 rounded-lg hover:bg-indigo-100">
              <span className="sr-only">Toggle menu</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          {open && (
            <div className="mt-2 backdrop-blur-xl bg-white/40 border border-white/50 shadow-sm rounded-3xl px-6 py-4 md:hidden">
              <nav className="flex flex-col space-y-3 text-sm font-medium text-gray-700">
                <a href="#about" onClick={() => setOpen(false)} className="hover:text-indigo-700">About</a>
                <a href="#plans" onClick={() => setOpen(false)} className="hover:text-indigo-700">Plans</a>
                <a href="#privacy" onClick={() => setOpen(false)} className="hover:text-indigo-700">Privacy</a>
                <a href="#terms" onClick={() => setOpen(false)} className="hover:text-indigo-700">Terms</a>
                <a href="#contact" onClick={() => setOpen(false)} className="hover:text-indigo-700">Contact</a>
              </nav>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => { setOpen(false); navigate('/login'); }}
                  className="w-full px-4 py-2.5 rounded-full text-indigo-600 hover:bg-indigo-50 font-semibold transition-all duration-300"
                >
                  Login
                </button>
                <button
                  onClick={() => { setOpen(false); navigate('/signup'); }}
                  className="w-full px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg font-semibold transition-all duration-300"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="relative max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <section className="animate-slideUp grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h1 className="heading text-5xl md:text-6xl font-black leading-tight text-gray-900">
              Smart billing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">modern events</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Create professional GST-compliant invoices, track revenue, and manage clients with a simple, fast workflow designed for event planners, photographers, and agencies.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/signup')}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-indigo-500/40 font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold transition-all duration-300 hover:scale-105"
              >
                I already have an account
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-500 font-medium">
              ✓ No credit card • ✓ Unlimited invoices • ✓ Secure & private
            </div>
          </div>

          <div className="relative lg:h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl blur-2xl opacity-40"></div>
            <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/80 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: FileText, label: 'Create Bills', color: 'from-indigo-50 to-indigo-100' },
                  { icon: BarChart3, label: 'Track Revenue', color: 'from-purple-50 to-purple-100' },
                  { icon: Zap, label: 'Export PDF', color: 'from-emerald-50 to-emerald-100' },
                  { icon: Lock, label: 'Secure', color: 'from-amber-50 to-amber-100' }
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`group p-6 rounded-2xl bg-gradient-to-br ${item.color} hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1`}
                  >
                    <item.icon className="w-8 h-8 text-indigo-600 mb-3" />
                    <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="mb-24">
          <h2 className="heading text-4xl font-black text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-gray-600 mb-16 text-lg max-w-2xl">Everything you need to grow your event business</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <div className="group relative p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 hover:border-indigo-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative flex-1">
                <h3 className="heading text-2xl font-bold text-gray-900 mb-3">Brand your invoices</h3>
                <p className="text-gray-600 leading-relaxed">Add your logo, company details and bank information, plus QR for quick payments.</p>
              </div>
            </div>
            <div className="group relative p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 hover:border-indigo-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative flex-1">
                <h3 className="heading text-2xl font-bold text-gray-900 mb-3">Save and edit anytime</h3>
                <p className="text-gray-600 leading-relaxed">Draft bills, update later, and keep a complete history of your clients.</p>
              </div>
            </div>
            <div className="group relative p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 hover:border-indigo-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="relative flex-1">
                <h3 className="heading text-2xl font-bold text-gray-900 mb-3">One-click PDF</h3>
                <p className="text-gray-600 leading-relaxed">Download polished PDFs with structured tables and totals in ₹.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="plans" className="mb-24">
          <h2 className="heading text-4xl font-black text-gray-900 mb-4">Purchase Plans</h2>
          <p className="text-gray-600 mb-16 text-lg">Choose the perfect plan for your business</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<<<<<<< HEAD
            {/* Starter Plan */}
            <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <h3 className="heading font-bold text-gray-900 text-xl">Starter</h3>
              <p className="text-sm text-gray-600 mt-1">For individuals getting started</p>
              <p className="mt-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Free</p>
              <ul className="mt-6 text-sm text-gray-700 space-y-3 flex-1">
=======
            <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="heading font-bold text-gray-900 text-xl">Starter</h3>
              <p className="text-sm text-gray-600 mt-1">For individuals getting started</p>
              <p className="mt-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">₹0</p>
              <ul className="mt-6 text-sm text-gray-700 space-y-3">
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Unlimited invoices</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>PDF export</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Basic analytics</li>
              </ul>
<<<<<<< HEAD
              <button
                onClick={() => navigate('/signup')}
                className="w-full mt-8 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-xl rounded-2xl border-2 border-indigo-200 shadow-lg p-8 md:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
=======
            </div>

            <div className="group relative bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-xl rounded-2xl border-2 border-indigo-200 shadow-lg p-8 md:scale-105 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
              <h3 className="heading font-bold text-gray-900 text-xl">Pro</h3>
              <p className="text-sm text-gray-600 mt-1">For growing teams and pros</p>
<<<<<<< HEAD
              <p className="mt-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">₹499<span className="text-lg text-gray-500 font-normal">/mo</span></p>
              <ul className="mt-6 text-sm text-gray-700 space-y-3 flex-1">
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Company branding</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>QR payments & bank details</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Advanced analytics</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Priority Support</li>
              </ul>
              <button
                onClick={() => navigate('/payment', {
                  state: {
                    plan: {
                      name: 'Pro',
                      price: 499,
                      period: 'mo',
                      features: ['Company branding', 'QR payments', 'Advanced analytics', 'Priority Support']
                    }
                  }
                })}
                className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all"
              >
                Buy Plan
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <h3 className="heading font-bold text-gray-900 text-xl">Enterprise</h3>
              <p className="text-sm text-gray-600 mt-1">Custom solutions for agencies</p>
              <p className="mt-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Custom</p>
              <ul className="mt-6 text-sm text-gray-700 space-y-3 flex-1">
=======
              <p className="mt-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">₹499/mo</p>
              <ul className="mt-6 text-sm text-gray-700 space-y-3">
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Company branding</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>QR payments & bank details</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Advanced analytics</li>
              </ul>
            </div>

            <div className="group relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="heading font-bold text-gray-900 text-xl">Enterprise</h3>
              <p className="text-sm text-gray-600 mt-1">Custom solutions for agencies</p>
              <p className="mt-6 text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Contact</p>
              <ul className="mt-6 text-sm text-gray-700 space-y-3">
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>SLA & priority support</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Custom features</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"><span className="text-white text-xs">✓</span></span>Dedicated success manager</li>
              </ul>
<<<<<<< HEAD
              <button
                onClick={() => window.location.href = '#contact'}
                className="w-full mt-8 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-colors"
              >
                Contact Sales
              </button>
=======
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
            </div>
          </div>
        </section>

        {/* Privacy Section */}
<<<<<<< HEAD
        {/* Privacy Policy Section */}
        <section id="privacy" className="mb-24 scroll-mt-24">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h2 className="heading text-3xl font-black text-gray-900 mb-8">Privacy Policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="heading text-xl font-bold text-gray-800 mb-2">1. Information We Collect</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    We collect information you provide directly to us, including your name, email address, company details, and billing information. We also automatically collect certain technical data about your device and usage patterns to improve our service security and performance.
                  </p>
                </div>
                <div>
                  <h3 className="heading text-xl font-bold text-gray-800 mb-2">2. How We Use Your Data</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Your data is used primarily to provide the Eventify billing services, process transactions, and communicate with you about your account. We may use aggregated, anonymized data for analytical purposes to enhance our product features.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="heading text-xl font-bold text-gray-800 mb-2">3. Data Security</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    We implement industry-standard security measures including AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your payment information is handled by PCI-DSS compliant payment processors and is never stored on our servers.
                  </p>
                </div>
                <div>
                  <h3 className="heading text-xl font-bold text-gray-800 mb-2">4. Data Sharing & Retention</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    We strictly do not sell your personal data to third parties. Data is retained only as long as necessary to provide our services or as required by law. You have the right to request data deletion at any time by contacting support.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-8 text-xs text-gray-500 border-t pt-6">Last updated: December 2025. For full details, please contact our Data Protection Officer.</p>
          </div>
        </section>

        {/* Terms & Conditions Section */}
        <section id="terms" className="mb-24 scroll-mt-24">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
            <h2 className="heading text-3xl font-black text-gray-900 mb-8">Terms & Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="heading text-xl font-bold text-gray-800 mb-2">1. Acceptance of Terms</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    By accessing or using Eventify, you agree to be bound by these Terms of Service. If you are using the service on behalf of an organization, you represent that you have the authority to bind that organization.
                  </p>
                </div>
                <div>
                  <h3 className="heading text-xl font-bold text-gray-800 mb-2">2. Subscription & Payments</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Services are billed in advance on a subscription basis. You agree to provide accurate billing information. Subscriptions automatically renew unless cancelled. We offer a 14-day money-back guarantee for new Pro plan subscriptions.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="heading text-xl font-bold text-gray-800 mb-2">3. User Responsibilities</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the service for any illegal or unauthorized purpose.
                  </p>
                </div>
                <div>
                  <h3 className="heading text-xl font-bold text-gray-800 mb-2">4. Limitation of Liability</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    Eventify is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mb-12 scroll-mt-24">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="heading text-3xl md:text-4xl font-black mb-6">Need help with Enterprise plans?</h2>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto text-lg">
                Our team is ready to help you set up a custom billing solution perfectly tailored to your agency's needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="mailto:support@eventify.app" className="px-8 py-3.5 rounded-full bg-white text-indigo-900 font-bold hover:bg-indigo-50 transition-colors">
                  Contact Support
                </a>
                <a href="tel:+919876543210" className="px-8 py-3.5 rounded-full border-2 border-indigo-400 text-indigo-50 font-bold hover:bg-white/10 transition-colors">
                  Schedule a Call
                </a>
              </div>
            </div>
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          </div>
=======
        <section id="privacy">
          <h2 className="heading text-2xl font-bold text-gray-900 mb-3">Privacy Policy</h2>
          <p className="text-sm text-gray-600">We respect your privacy. Your data is encrypted and never sold. Detailed policy available on request.</p>
        </section>

        {/* Terms Section */}
        <section id="terms" className="mt-12">
          <h2 className="heading text-2xl font-bold text-gray-900 mb-3">Terms & Conditions</h2>
          <p className="text-sm text-gray-600">By using Eventify, you agree to our standard terms of service. Detailed terms available on request.</p>
        </section>

        {/* Contact Section */}
        <section id="contact" className="mt-12">
          <h2 className="heading text-2xl font-bold text-gray-900 mb-3">Contact</h2>
          <p className="text-sm text-gray-600">Have questions? Write to us at support@eventify.app</p>
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Eventify. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;