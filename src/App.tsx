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

// Refactored AppLayout: Removed the generic background and tightened the layout
function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      <main className="flex-1 pb-24"> 
        {/* pb-24 ensures content doesn't hide behind the BottomNav */}
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Refactored to a premium, editorial loading state
    return (
      <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-[1.5px] border-zinc-200 border-t-black rounded-full animate-spin mb-4" />
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Authenticating</span>
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
      
      {/* Pages without BottomNav (Full-screen flows) */}
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

// Refactored Root App Component
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        {/* Global Desktop Wrapper: Off-white background, centers the mobile app on large screens */}
        <div className="min-h-screen bg-[#F9F9F6] text-[#0A0A0A] font-sans flex justify-center antialiased">
          {/* Mobile App Container: Max-width 448px (md), white background, subtle editorial shadow */}
          <div className="w-full max-w-md bg-white min-h-screen shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] relative overflow-x-hidden flex flex-col">
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </div>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
