import React from "react";
import "./Styles/InventarioTab.css";

/**
 * InventarioTab Component
 * 
 * Renders the primary inventory interface including stock KPIs, asset search, 
 * and the product catalog grid.
 * 
 * Features:
 * - Dynamic stock health indicators (Low Stock vs. In Stock).
 * - Inline image update triggers via invisible file input.
 * - Multi-action product cards (Direct sales and replenishment triggers).
 * - Real-time statistics for total inventory valuation and SKU volume.
 * 
 * Props:
 * @param {Object} inventoryStats - Aggregated metrics for the branch inventory.
 * @param {string} search - Active search query.
 * @param {Function} setSearch - Updates search state.
 * @param {boolean} loading - Data fetch state.
 * @param {Array} filteredProductos - List of products matching the current filter.
 * @param {Function} handleOpenMovimiento - Triggers the logistics movement workflow.
 * @param {Function} handleUpdateImagen - Triggers the asset image update logic.
 */
export default function InventarioTab({
  inventoryStats,
  search,
  setSearch,
  loading,
  filteredProductos,
  handleOpenMovimiento,
  handleUpdateImagen
}) {
  return (
    <div className="inventarioContainer">
      {/* --- 1. CORE INVENTORY METRICS: High-level visibility into stock health --- */}
      <div className="metricsGrid">
        {/* Total Portfolio Valuation */}
        <div className="glassCard">
          <span className={`material-symbols-outlined statIcon`}>inventory_2</span>
          <span className="statLabel">Valor del Stock</span>
          <div className="statValue">
            {inventoryStats.value} <span className="statUnit">€</span>
          </div>
          <span className={`statTrend trendPositive`}>Mercancía Activa</span>
        </div>

        {/* Unique Item Count (SKU Volume) */}
        <div className="glassCard">
          <span className={`material-symbols-outlined statIcon`}>shopping_basket</span>
          <span className="statLabel">Productos Totales</span>
          <div className="statValue">
            {inventoryStats.total} <span className="statUnit">SKUs</span>
          </div>
          <span className={`statTrend trendNeutral`}>Consolidado</span>
        </div>

        {/* Aggregate Physical Stock Volume */}
        <div className="glassCard">
          <span className={`material-symbols-outlined statIcon`}>warning</span>
          <span className="statLabel">Existencias</span>
          <div className="statValue">
            {inventoryStats.stock} <span className="statUnit">Unid.</span>
          </div>
          <span className={`statTrend trendNeutral`}>Nivel de Almacén</span>
        </div>
      </div>

      {/* --- 2. GLOBAL DISCOVERY: Search bar for identifying specific assets --- */}
      <div className="searchWrapper">
        <div className="searchContainer">
          <span className={`material-symbols-outlined searchIcon`}>search</span>
          <input 
            type="text" 
            className="searchInput"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- 3. PRODUCT CATALOG: Dynamic grid of actionable item cards --- */}
      <div className="productGrid">
        {loading ? (
          <div className="loading">Cargando catálogo...</div>
        ) : filteredProductos.length > 0 ? (
          filteredProductos.map((prod) => (
            <div key={prod.id} className="productCard">
              {/* Asset Documentation: Visual representation with update capabilities */}
              <div 
                className="productImageContainer"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e) => handleUpdateImagen(prod.id, e.target.files[0]);
                  input.click();
                }}
              >
                {prod.imagen_url || prod.foto ? (
                  <img src={prod.imagen_url || prod.foto} alt={prod.nombre} className="productImage" />
                ) : (
                  <div className="productImage" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)'}}>
                    <span className="material-symbols-outlined" style={{fontSize: '4rem', opacity: 0.1}}>image</span>
                  </div>
                )}
                
                {/* Aesthetic hover state indicating update availability */}
                <div className="productImageOverlay">
                  <span className={`material-symbols-outlined cameraIcon`}>photo_camera</span>
                </div>

                {/* Stock Health Status Badge */}
                <span className={`stockBadge ${prod.cantidad <= 5 ? "stockLow" : "stockIn"}`}>
                  {prod.cantidad <= 5 ? 'STOCK BAJO' : 'EN STOCK'}
                </span>
              </div>

              {/* Data and Operations: Item identity and logistical controls */}
              <div className="productInfo">
                <div className="productHeader">
                  <div>
                    <h4 className="productName">{prod.nombre}</h4>
                    <p className="statLabel" style={{marginTop: '0.5rem', opacity: 0.6}}>Stock: {prod.cantidad}</p>
                  </div>
                  <span className="productPrice">{prod.precio_unitario}€</span>
                </div>

                <div className="productActions">
                  {/* Retail Transaction: Triggers a sales movement (Outbound) */}
                  <button 
                    disabled={prod.cantidad <= 0}
                    className={`actionBtn sellBtn`}
                    onClick={() => handleOpenMovimiento(prod, "venta")}
                  >
                    Vender
                  </button>
                  {/* Replenishment Transaction: Triggers a supply movement (Inbound) */}
                  <button 
                    className={`actionBtn buyBtn ${prod.cantidad <= 5 ? "buyBtnUrgent" : ""}`}
                    onClick={() => handleOpenMovimiento(prod, "compra")}
                  >
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="noDataState">
            <p>No se encontraron productos que coincidan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
