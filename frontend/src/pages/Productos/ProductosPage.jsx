import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";

import { useProductosLogic } from "./useProductosLogic";
import InventarioTab from "./InventarioTab";
import FinanzasTab from "./FinanzasTab";
import CrearProductoModal from "./CrearProductoModal";
import MovimientoModal from "./MovimientoModal";

import "./Styles/ProductosPage.css";

/**
 * ProductosPage Component
 * 
 * Orchestrates the retail and inventory management system of the gym.
 * Features:
 * - Tabbed interface for switching between real-time inventory and financial analytics.
 * - Global product acquisition (Creation of new items).
 * - Stock movement management (Inbound/Outbound logistics).
 * - Reactive search and filtering of the product catalog.
 */
export default function ProductosPage() {
  const {
    gymReady,
    activeTab, setActiveTab,
    loading,
    movimientos,
    openCrear, setOpenCrear,
    formCrear, setFormCrear,
    openMovimiento, setOpenMovimiento,
    movTipo, 
    selectedProd, 
    formMov, setFormMov,
    search, setSearch,
    saving,
    handleCrearProducto,
    handleRegistrarMovimiento,
    handleOpenMovimiento,
    inventoryStats,
    filteredProductos,
    chartData,
    handleUpdateImagen
  } = useProductosLogic();

  // Guard: Context synchronization check
  if (!gymReady) {
    return (
      <AppLayout>
        <div className="productos-loading">Sincronizando Atmósfera...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="productosPage">
        {/* Module Header: Contextual identity and primary acquisition action */}
        <div className="headerSection">
          <div>
            <h2 className="headerTitle">Gestión de Tienda e Inventario</h2>
            <p className="headerSubtitle">Control operativo y financiero de existencias.</p>
          </div>
          <Button variant="primary" onClick={() => setOpenCrear(true)}>
            <span className="material-symbols-outlined" style={{marginRight: '10px', fontSize: '1.25rem', fontWeight: 'bold'}}>add</span>
            Nuevo Artículo
          </Button>
        </div>

        {/* Global Navigation: Tabbed subsystem selection */}
        <div className="tabsNav">
          <button 
            className={`tabBtn ${activeTab === "inventario" ? "tabBtnActive" : ""}`}
            onClick={() => setActiveTab("inventario")}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            Inventario
          </button>
          <button 
            className={`tabBtn ${activeTab === "finanzas" ? "tabBtnActive" : ""}`}
            onClick={() => setActiveTab("finanzas")}
          >
            <span className="material-symbols-outlined">payments</span>
            Finanzas
          </button>
        </div>

        {/* Subsystem: Inventory Control & Catalog */}
        {activeTab === "inventario" && (
          <InventarioTab 
            inventoryStats={inventoryStats}
            search={search}
            setSearch={setSearch}
            loading={loading}
            filteredProductos={filteredProductos}
            handleOpenMovimiento={handleOpenMovimiento}
            handleUpdateImagen={handleUpdateImagen}
          />
        )}

        {/* Subsystem: Financial Performance & Sales Metrics */}
        {activeTab === "finanzas" && (
          <FinanzasTab 
            chartData={chartData}
            movimientos={movimientos}
          />
        )}

        {/* Action Modal: New Item Acquisition */}
        <CrearProductoModal 
          open={openCrear}
          onClose={() => setOpenCrear(false)}
          form={formCrear}
          setForm={setFormCrear}
          onSave={handleCrearProducto}
          saving={saving}
        />

        {/* Action Modal: Logistics Movement (Stock entry/removal) */}
        <MovimientoModal 
          open={openMovimiento}
          onClose={() => setOpenMovimiento(false)}
          selectedProd={selectedProd}
          movTipo={movTipo}
          form={formMov}
          setForm={setFormMov}
          onSave={handleRegistrarMovimiento}
          saving={saving}
        />

      </div>
    </AppLayout>
  );
}
