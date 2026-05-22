import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

// Auth and Registration Pages
import LoginPage from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register/RegisterPageNew";
import ForgotPasswordPage from "../pages/ForgotPassword/ForgotPasswordPage";
import PasswordResetPage from "../pages/ForgotPassword/PasswordResetPage";
import StripeCheckoutPage from "../pages/Stripe/StripeCheckoutPage";
import SelectGymPage from "../pages/SelectGym/SelectGymPage";

// Client/User Pages
import ClientOnboarding from "../pages/ClientOnboarding/ClientOnboarding";
import ClientDashboard from "../pages/ClientDashboard/ClientDashboard";
import ClientEnroll from "../pages/ClientDashboard/ClientEnroll";
import ClientProfile from "../pages/ClientProfile/ClientProfile";

// Dashboard and Management Pages
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ClientesPage from "../pages/Clientes/ClientesPage";
import ClasesPage from "../pages/Clases/ClasesPage";
import ProductosPage from "../pages/Productos/ProductosPage";
import PagosPage from "../pages/Pagos/PagosPage";
import EconomiaPage from "../pages/Economia/EconomiaPage";
import MaquinasPage from "../pages/Maquinas/MaquinasPage";
import AdminsPage from "../pages/Admins/AdminsPage";

/**
 * AppRouter Component
 * 
 * Defines the application's routing structure using React Router.
 * Distinguishes between public routes (login, register) and protected routes
 * that require authentication through the ProtectedRoute wrapper.
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />

        {/* Stripe Checkout flow for initial registration */}
        <Route path="/stripe-checkout" element={<StripeCheckoutPage />} />

        {/* --- Protected Routes (Require Authentication) --- */}

        {/* Client onboarding - search for gyms (for USUARIO_FINAL) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute allowedType="USUARIO_FINAL">
              <ClientOnboarding />
            </ProtectedRoute>
          }
        />

        {/* Client dashboard - for enrolled USUARIO_FINAL users */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute allowedType="USUARIO_FINAL">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Client enrollment - join a gym with payment */}
        <Route
          path="/client/enroll"
          element={
            <ProtectedRoute allowedType="USUARIO_FINAL">
              <ClientEnroll />
            </ProtectedRoute>
          }
        />

        {/* Client profile - manage personal info */}
        <Route
          path="/client/profile"
          element={
            <ProtectedRoute allowedType="USUARIO_FINAL">
              <ClientProfile />
            </ProtectedRoute>
          }
        />

        {/* Route for existing owners to add and pay for new branches */}
        <Route
          path="/branch-payment"
          element={
            <ProtectedRoute>
              <StripeCheckoutPage />
            </ProtectedRoute>
          }
        />

        {/* Multi-gym selection screen for authorized users */}
        <Route
          path="/select-gym"
          element={
            <ProtectedRoute>
              <SelectGymPage />
            </ProtectedRoute>
          }
        />

        {/* Main Dashboard / Landing after login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Client management section */}
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <ClientesPage />
            </ProtectedRoute>
          }
        />

        {/* Class scheduling and management */}
        <Route
          path="/clases"
          element={
            <ProtectedRoute>
              <ClasesPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory and product management */}
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <ProductosPage />
            </ProtectedRoute>
          }
        />

        {/* Payment history and transaction tracking */}
        <Route
          path="/pagos"
          element={
            <ProtectedRoute>
              <PagosPage />
            </ProtectedRoute>
          }
        />

        {/* Financial reports and economic overview */}
        <Route
          path="/economia"
          element={
            <ProtectedRoute>
              <EconomiaPage />
            </ProtectedRoute>
          }
        />

        {/* Equipment/Machine maintenance and tracking */}
        <Route
          path="/maquinas"
          element={
            <ProtectedRoute>
              <MaquinasPage />
            </ProtectedRoute>
          }
        />

        {/* Administrative user management */}
        <Route
          path="/admins"
          element={
            <ProtectedRoute>
              <AdminsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
