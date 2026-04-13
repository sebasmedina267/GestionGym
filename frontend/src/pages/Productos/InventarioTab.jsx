import React from "react";
import "./Styles/InventarioTab.css";


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
      {/* 1. TOP METRICS */}
      <div className="metricsGrid">
        <div className="glassCard">
          <span className={`material-symbols-outlined statIcon`}>inventory_2</span>
          <span className="statLabel">Valor del Stock</span>
          <div className="statValue">
            {inventoryStats.value} <span className="statUnit">€</span>
          </div>
          <span className={`statTrend trendPositive`}>Mercancía Activa</span>
        </div>

        <div className="glassCard">
          <span className={`material-symbols-outlined statIcon`}>shopping_basket</span>
          <span className="statLabel">Productos Totales</span>
          <div className="statValue">
            {inventoryStats.total} <span className="statUnit">SKUs</span>
          </div>
          <span className={`statTrend trendNeutral`}>Consolidado</span>
        </div>

        <div className="glassCard">
          <span className={`material-symbols-outlined statIcon`}>warning</span>
          <span className="statLabel">Existencias</span>
          <div className="statValue">
            {inventoryStats.stock} <span className="statUnit">Unid.</span>
          </div>
          <span className={`statTrend trendNeutral`}>Nivel de Almacén</span>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
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

      {/* 3. PRODUCTS GRID */}
      <div className="productGrid">
        {loading ? (
          <div className="loading">Cargando catálogo...</div>
        ) : filteredProductos.length > 0 ? (
          filteredProductos.map((prod) => (
            <div key={prod.id} className="productCard">
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
                
                <div className="productImageOverlay">
                  <span className={`material-symbols-outlined cameraIcon`}>photo_camera</span>
                </div>

                <span className={`stockBadge ${prod.cantidad <= 5 ? "stockLow" : "stockIn"}`}>
                  {prod.cantidad <= 5 ? 'STOCK BAJO' : 'EN STOCK'}
                </span>
              </div>

              <div className="productInfo">
                <div className="productHeader">
                  <div>
                    <h4 className="productName">{prod.nombre}</h4>
                    <p className="statLabel" style={{marginTop: '0.5rem', opacity: 0.6}}>Stock: {prod.cantidad}</p>
                  </div>
                  <span className="productPrice">{prod.precio_unitario}€</span>
                </div>

                <div className="productActions">
                  <button 
                    disabled={prod.cantidad <= 0}
                    className={`actionBtn sellBtn`}
                    onClick={() => handleOpenMovimiento(prod, "venta")}
                  >
                    Vender
                  </button>
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

