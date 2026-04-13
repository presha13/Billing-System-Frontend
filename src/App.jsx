import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Login from './components/Auth/Login.jsx';
import Signup from './components/Auth/Signup.jsx';
import ForgotPassword from './components/Auth/ForgotPassword.jsx';
import ResetPassword from './components/Auth/ResetPassword.jsx';
import Landing from './components/Landing/Landing.jsx';
import Sidebar from './components/Layout/Sidebar.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';
import FinancialYearSelector from './components/Layout/FinancialYearSelector.jsx';
import NotificationCenter from './components/common/NotificationCenter.jsx';
import { FinancialYearProvider } from './contexts/FinancialYearContext.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import PaymentPage from './components/Payment/PaymentPage.jsx';
import CompanyProfile from './components/CompanyProfile/CompanyProfile.jsx';
import BillingService from './components/Billing/BillingService.jsx';
import BillsList from './components/Bills/BillsList.jsx';
import Events from './components/Events/Events.jsx';
import CreateQuotation from './components/Quotations/CreateQuotation.jsx';
import ViewQuotations from './components/Quotations/ViewQuotations.jsx';
import ProductLibrary from './components/ProductLibrary/ProductLibrary.jsx';
import Expenses from './components/Expenses/Expenses.jsx';
import FinancialReports from './components/Reports/FinancialReports.jsx';
import Loader from './components/common/Loader.jsx';
import { Menu } from 'lucide-react';

const App = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Global keyboard shortcuts for rapid app navigation (Alt + Key)
      // Only active for authenticated users
      if (!isAuthenticated) return;

      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            navigate('/');
            break;
          case 'b':
            e.preventDefault();
            navigate('/billing');
            break;
          case 'q':
            e.preventDefault();
            navigate('/quotations/create');
            break;
          case 'p':
            e.preventDefault();
            navigate('/products');
            break;
          case 'e':
            e.preventDefault();
            navigate('/expenses');
            break;
          case 'v': // View bills
            e.preventDefault();
            navigate('/bills');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Initializing" />
      </div>
    );
  }

  if (!isAuthenticated || window.location.pathname.startsWith('/reset-password')) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out lg:relative overflow-hidden
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'}
        ${isDesktopSidebarOpen ? 'lg:w-64' : 'lg:w-0'}
      `}>
        <div className="w-64 h-full">
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      </div>

      <FinancialYearProvider>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden shrink-0 bg-white border-b p-4 flex items-center justify-between">
            <div className="font-semibold text-gray-800">{user?.company?.companyName || 'Eventify'}</div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between bg-white border-b px-8 py-4 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={isDesktopSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
              >
                <Menu size={24} />
              </button>
              <div className="text-xl font-semibold text-gray-800">{user?.company?.companyName || ''}</div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <FinancialYearSelector />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
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
              <Route path="/quotations" element={
                <ProtectedRoute>
                  <ViewQuotations />
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
              <Route path="/expenses" element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <FinancialReports />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              {/* Product Library */}
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductLibrary />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </FinancialYearProvider>
    </div>
  );
};

export default App;