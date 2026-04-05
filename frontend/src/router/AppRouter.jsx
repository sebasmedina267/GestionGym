import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import LoginPage from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register/RegisterPage";
import SelectGymPage from "../pages/SelectGym/SelectGymPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";

import ClientesPage from "../pages/Clientes/ClientesPage";
import ClasesPage from "../pages/Clases/ClasesPage";
import ProductosPage from "../pages/Productos/ProductosPage";
import PagosPage from "../pages/Pagos/PagosPage";
import EconomiaPage from "../pages/Economia/EconomiaPage";
import MaquinasPage from "../pages/Maquinas/MaquinasPage";
import AdminsPage from "../pages/Admins/AdminsPage";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/select-gym"
          element={
            <ProtectedRoute>
              <SelectGymPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <ClientesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clases"
          element={
            <ProtectedRoute>
              <ClasesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <ProductosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pagos"
          element={
            <ProtectedRoute>
              <PagosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/economia"
          element={
            <ProtectedRoute>
              <EconomiaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maquinas"
          element={
            <ProtectedRoute>
              <MaquinasPage />
            </ProtectedRoute>
          }
        />

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
