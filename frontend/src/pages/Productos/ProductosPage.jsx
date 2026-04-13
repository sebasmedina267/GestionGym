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

        {/* TABS NAVBAR */}
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

        {activeTab === "finanzas" && (
          <FinanzasTab 
            chartData={chartData}
            movimientos={movimientos}
          />
        )}

        <CrearProductoModal 
          open={openCrear}
          onClose={() => setOpenCrear(false)}
          form={formCrear}
          setForm={setFormCrear}
          onSave={handleCrearProducto}
          saving={saving}
        />

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

