import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

// Auth and Registration Pages
import LoginPage from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register/RegisterPageNew";
import StripeCheckoutPage from "../pages/Stripe/StripeCheckoutPage";
import SelectGymPage from "../pages/SelectGym/SelectGymPage";

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
        
        {/* Stripe Checkout flow for initial registration */}
        <Route path="/stripe-checkout" element={<StripeCheckoutPage />} />

        {/* --- Protected Routes (Require Authentication) --- */}
        
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
