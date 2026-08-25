import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { BottomNav } from '@/components/BottomNav';
import { SplashPage } from '@/pages/SplashPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { AuthPage } from '@/pages/AuthPage';
import { HomePage } from '@/pages/HomePage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { TailorProfilePage } from '@/pages/TailorProfilePage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CustomOrderPage } from '@/pages/CustomOrderPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { ChatPage } from '@/pages/ChatPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { MeasurementsPage } from '@/pages/MeasurementsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { TailorDashboard } from '@/pages/TailorDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { ReactNode } from 'react';

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50">
      {children}
      <BottomNav />
      <div className="h-20" />
    </div>
  );
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage mode="login" />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <AuthPage mode="signup" />} />

      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout><HomePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/discover" element={
        <ProtectedRoute>
          <AppLayout><DiscoverPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/tailor/:id" element={
        <ProtectedRoute>
          <AppLayout><TailorProfilePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/product/:id" element={
        <ProtectedRoute>
          <AppLayout><ProductDetailPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/custom-order/:tailorId" element={
        <ProtectedRoute>
          <CustomOrderPage />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <AppLayout><OrdersPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders/:id" element={
        <ProtectedRoute>
          <OrderDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <AppLayout><MessagesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/messages/:conversationId" element={
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      } />
      <Route path="/checkout/:type/:id" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/measurements" element={
        <ProtectedRoute>
          <MeasurementsPage />
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      } />

      <Route path="/tailor-dashboard/*" element={
        <ProtectedRoute roles={['tailor']}>
          <TailorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
