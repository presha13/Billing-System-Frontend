import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup.jsx';
import ForgotPassword from './components/Auth/ForgotPassword.jsx';
import ResetPassword from './components/Auth/ResetPassword.jsx';
import Landing from './components/Landing/Landing.jsx';
import Sidebar from './components/Layout/Sidebar.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
<<<<<<< HEAD
import PaymentPage from './components/Payment/PaymentPage.jsx';
=======
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
import CompanyProfile from './components/CompanyProfile/CompanyProfile.jsx';
import BillingService from './components/Billing/BillingService.jsx';
import BillsList from './components/Bills/BillsList.jsx';
import Events from './components/Events/Events.jsx';
<<<<<<< HEAD
import CreateQuotation from './components/Quotations/CreateQuotation.jsx';

import { Menu } from 'lucide-react';

const App = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
=======

const App = () => {
  const { isAuthenticated, loading, user } = useAuth();
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
<<<<<<< HEAD
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
=======
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
<<<<<<< HEAD
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4 flex items-center justify-between">
          <div className="font-semibold text-gray-800">{user?.company?.companyName || 'Eventify'}</div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="hidden md:block mb-6">
            <div className="text-2xl font-semibold text-gray-800">{user?.company?.companyName || ''}</div>
          </div>
          <Routes>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <CompanyProfile />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <BillingService />
              </ProtectedRoute>
            } />
            <Route path="/quotation/create" element={
              <ProtectedRoute>
                <CreateQuotation />
              </ProtectedRoute>
            } />
            <Route path="/bills" element={
              <ProtectedRoute>
                <BillsList />
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
=======
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <div className="text-2xl font-semibold text-gray-800">{user?.company?.companyName || ''}</div>
        </div>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <CompanyProfile />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <BillingService />
            </ProtectedRoute>
          } />
          <Route path="/bills" element={
            <ProtectedRoute>
              <BillsList />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
      </div>
    </div>
  );
};

export default App;