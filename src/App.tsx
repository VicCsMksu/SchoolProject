import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/useAdminAuth";
import { useProfileComplete } from "@/hooks/useProfileComplete";
import PublicLayout from "./components/PublicLayout";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Doctors from "./pages/Doctors";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import CompleteProfile from "./pages/CompleteProfile";
import Appointments from "./pages/Appointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import BookAppointment from "./pages/BookAppointment";
import Records from "./pages/Records";
import Support from "./pages/Support";
import Account from "./pages/Account";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminDoctorDetail from "./pages/admin/AdminDoctorDetail";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminServices from "./pages/admin/AdminServices";
import AdminServiceDetail from "./pages/admin/AdminServiceDetail";

const queryClient = new QueryClient();

const AdminRoutes = () => {
  const { isAdminAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={<Navigate to="/admin/login" replace />}
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/doctors/:id" element={<AdminDoctorDetail />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/services/:id" element={<AdminServiceDetail />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Route>
      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/*" element={<NotFound />} />
    </Routes>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const {
    isProfileComplete,
    isLoading: profileLoading,
    isAdmin,
  } = useProfileComplete();
  const location = useLocation();

  if (loading || (isAuthenticated && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  // Redirect authenticated admins to /admin
  if (isAuthenticated && isAdmin) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  if (isAuthenticated) {
    // If profile is incomplete and not already on the complete-profile page
    if (!isProfileComplete && location.pathname !== "/complete-profile") {
      return (
        <Routes>
          <Route
            path="*"
            element={<Navigate to="/complete-profile" replace />}
          />
          <Route path="/complete-profile" element={<CompleteProfile />} />
        </Routes>
      );
    }

    return (
      <Routes>
        <Route
          path="/complete-profile"
          element={
            isProfileComplete ? (
              <Navigate to="/home" replace />
            ) : (
              <CompleteProfile />
            )
          }
        />
        <Route element={<Layout />}>
          <Route path="/home" element={<Profile />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/about" element={<About />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointment/book" element={<BookAppointment />} />
          <Route path="/appointment/:id" element={<AppointmentDetail />} />
          <Route path="/records" element={<Records />} />
          <Route path="/support" element={<Support />} />
          <Route path="/account" element={<Account />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/signin" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const MainRouter = () => {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return <AdminRoutes />;
  }

  return <AppRoutes />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <MainRouter />
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
