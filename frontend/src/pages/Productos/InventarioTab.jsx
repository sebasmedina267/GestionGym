import React, { useRef } from 'react';
import styles from "../../styles/ProductosPage.module.css";

export default function InventarioTab({ 
  inventoryStats, 
  search, 
  setSearch, 
  loading, 
  filteredProductos, 
  handleOpenMovimiento,
  handleUpdateImagen 
}) {
  const fileInputRef = useRef(null);
  const activeProdIdRef = useRef(null);

  // Imágnes de placeholder basadas en el diseño proporcional
  const getProductImage = (prod) => {
    if (prod.foto) return prod.foto;
    
    // Asignación determinista de placeholders para que no cambien al recargar
    const placeholders = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAf8ytWeLYdao2sBGkr_Pb9Gc5SBRQj-D-_1nPU_IQwNx9T9O024Hq0CKUja_iL2hHtzHBSvLTbf2fPATtl4fh_DtxMxd8pn7p4S0GQ4vT11SJMNgkTyehHolQVdtt47gfa4FZOH8RUcxobWjqa9H24oXWi65uN1hk6--zYQ5-4gxGgQZK3FBhTKBYB7zjXe9xqPwQlggwNFvaz3N9y_sAXbABY9rEHxay9R_qP4ped43Hm00cvyxhTlBHm5sQoXnGcR1Ilmhiar_s",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCExukyFO3G_5NQcd5gL2OLuxeRnQ5pJ3Yv6Hvhazd8yb_dAialuptQ4Xp0dVdITX7Sgj0waKneU9PCelSr64r25GemdfcBtyhW-fceOnFQIdcaN33k-KmKO-eU7MyAapY94Ei0OhjGHX-1qmlaczyUqVeFLD2-W_iLq8QXW9nP1_zCpB2Sk3CYKiG8H9m444t4qxpzQhCbiV4hQCMbLHS0gIxWzY1hGJ_6N9jcYGrXEE7wj8vyAA3Yaha7-hxRUdI_xqNCJ2WXG_k",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNiaqxOwYZJU0gfGjh6UPDQYP3h4TFkp2Swe1TS9TK3ReXtgRvZW4eDDbGJST-t88bgIItZdQ7ylnWLTN5J31FTqzzu5C9uQZ6b4BiAsTaCAXyhUKqGm47AOglX58RYC4TaLCjcBtRlRK2cnjxc_C-kkzrqwcZVE-anGZo9_i2VGyLi2UMBK4Qw5Kc7DDwYF0MrWTU6LgpkhcqgAfyoolsEsia5m-O7MrcX1wtXmSPtYCeOQ3IOwVZXd0mcBFQQc752FdML9dq0p4",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC8LqjF9qPxfBILj8Mng1_NomtIse5Od_I74nm_dqR2Q3vzSgpLsp0cPPaplLHj0oGxfdUPFh9EuCGr-eqf1X72n7WTqZFaoK4aEsBlyxWrtfbgcvjezvCeOKgsVSt8aVKg334e_3EO1pfhASrV8NdsOjslJevrZFuTYDESj0uTERAzfw4xhf1NwBXfGLUO9JgGXpgDBFrOryC8mtL0NVZMJ_EfSX75e36aAQqWlcwTbKi9Bri_BamzvX4XjLZxro8MmruThtut0v0",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB3gL2Rzgh5kntw3kKA7pX1AvQaaFIA1SWlYsVEfoG8ZF-ZYSelYtzfnQgxJkNqSv7QLHHEuM9F9Y5aBjjHXoNVfwuLfpaTBlQAo5k8boKO5LwOyXUpq_f4UsHlgr7nfV_MpnqU7M7cYnbnyb4Mrpc-QQQlONKP3HNof1Dnw9-nGpH3cd7lGrWPgfTcqb4NSUqO3ebHI7_oZi-qOBtv-M30OFZXQhH_J9AVzX-dQj_TCq2ImWcdnUcsF1TBqDn8PLGb32F8ZO5FPFM",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBiIR700fv0cDU2BVO4iIBZVdKAYM1ugtAbiHEo-2ucTToZ87CRcvWqt1rvRi9aOEKDN-SyW9n3jds1OO1VBFeRBcKn50Npij1abvsPoMvuExpoMZ3KT8I7Fk1PezZFzAIaCUJA5_eSRw0NvfhjQLnL7IOz_TSWdKdKQjrPRleboE4aQ5NJLeyhoymzVfDSB5UtVlTty9Z12KrYUsX93vYn_kU7OoqvcVB6dVueLqCm2TEMJs4bfZYk2ilVPU17DC4WVT1KV_Fjnos"
    ];
    return placeholders[prod.id % placeholders.length];
  };

  const handleImageClick = (prodId) => {
    activeProdIdRef.current = prodId;
    fileInputRef.current?.click();
  };

  const onFileSelected = (e) => {
    const file = e.target.files[0];
    if (file && activeProdIdRef.current) {
        handleUpdateImagen(activeProdIdRef.current, file);
    }
  };

  return (
    <div className={styles.tabInventario}>

      {/* Hidden File Input for Card Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={onFileSelected}
      />

      {/* METRICS GRID */}
      <div className={styles.metricsGrid}>
        <div className={styles.glassCard}>
          <span className={`material-symbols-outlined ${styles.statIcon}`}>inventory</span>
          <span className={styles.statLabel}>Artículos Disponibles</span>
          <div className={styles.statValue}>
            {inventoryStats.total}
            <span className={styles.statUnit}>SKUs</span>
          </div>
          <span className={`${styles.statTrend} ${styles.trendPositive}`}>+12% RENDIMIENTO</span>
        </div>
        
        <div className={styles.glassCard}>
          <span className={`material-symbols-outlined ${styles.statIcon}`}>box</span>
          <span className={styles.statLabel}>Volumen Físico</span>
          <div className={styles.statValue}>
            {inventoryStats.stock}
            <span className={styles.statUnit}>uds</span>
          </div>
          <span className={`${styles.statTrend} ${styles.trendNeutral}`}>OCUPACIÓN 86%</span>
        </div>

        <div className={styles.glassCard}>
          <span className={`material-symbols-outlined ${styles.statIcon}`}>payments</span>
          <span className={styles.statLabel}>Valor Comercial Total</span>
          <div className={styles.statValue}>
            {inventoryStats.value > 1000 ? `${(inventoryStats.value / 1000).toFixed(1)}k` : inventoryStats.value.toFixed(2)}
            <span className={styles.statUnit}>€</span>
          </div>
          <span className={`${styles.statTrend} ${styles.trendPrimary}`}>RETAIL ESTIMADO</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchContainer}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar producto por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Sincronizando atmósfera de inventario...</div>
      ) : (
        <div className={styles.productGrid}>
          {filteredProductos.map(prod => (
            <div key={prod.id} className={styles.productCard}>
              <div 
                className={styles.productImageContainer} 
                style={{ cursor: 'pointer' }}
                onClick={() => handleImageClick(prod.id)}
              >
                <img 
                  src={getProductImage(prod)} 
                  alt={prod.nombre} 
                  className={styles.productImage}
                />
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)', transition: 'background-color 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(0,0,0,0.3)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='rgba(0,0,0,0)'}>
                    <span className="material-symbols-outlined" style={{ color: 'white', opacity: 0, fontSize: '2.5rem', transition: 'opacity 0.3s' }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0}>photo_camera</span>
                </div>
                <div className={`${styles.stockBadge} ${prod.cantidad > 5 ? styles.stockIn : styles.stockLow}`}>
                  {prod.cantidad} EN STOCK
                </div>
              </div>
              
              <div className={styles.productInfo}>
                <div className={styles.productHeader}>
                  <h3 className={styles.productName}>{prod.nombre}</h3>
                  <span className={styles.productPrice}>{prod.precio_unitario} €</span>
                </div>

                <div className={styles.productActions}>
                  <button 
                    className={`${styles.actionBtn} ${styles.sellBtn}`}
                    onClick={() => handleOpenMovimiento(prod, "venta")}
                    disabled={prod.cantidad <= 0}
                  >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    Vender
                  </button>
                  <button 
                    className={`${styles.actionBtn} ${styles.buyBtn} ${prod.cantidad <= 5 ? styles.buyBtnUrgent : ""}`}
                    onClick={() => handleOpenMovimiento(prod, "compra")}
                  >
                    <span className="material-symbols-outlined">local_shipping</span>
                    {prod.cantidad <= 5 ? "Restock Urgente" : "Comprar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
