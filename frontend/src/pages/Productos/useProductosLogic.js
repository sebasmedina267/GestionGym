import { useState, useMemo } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useGym } from "../../hooks/useGym";
import api from "../../api/axios";

/**
 * useProductosLogic Hook
 * 
 * Centralizes the business logic for the gym's retail and inventory subsystem.
 * Handles:
 * - Reactive fetching of product catalogs, transaction history, and aggregated stats.
 * - Multi-part form management for product acquisition (including image uploads).
 * - Logistics management for stock movements (Sales vs. Supplies).
 * - Real-time filtering and computed analytics for financial visualization.
 * 
 * @returns {Object} State and operations for product and stock management.
 */
export function useProductosLogic() {
  const { gym } = useGym();
  const gymReady = Boolean(gym);

  const [activeTab, setActiveTab] = useState("inventario");

  // Parallel data streams for high-speed synchronization
  const { data: productos, loading, refetch: refetchProductos } = useFetch(
    gymReady ? `/productos?gymId=${gym.id}` : null
  );

  const { data: movimientos, refetch: refetchMovimientos } = useFetch(
    gymReady ? `/productos/movimientos?gymId=${gym.id}` : null
  );

  const { data: stats, refetch: refetchStats } = useFetch(
    gymReady ? `/productos/stats?gymId=${gym.id}` : null
  );

  // UI State for Acquisition and Logistics modals
  const [openCrear, setOpenCrear] = useState(false);
  const [formCrear, setFormCrear] = useState({
    nombre: "",
    precio: "",
    stock: "",
    imagen: null,
  });

  const [openMovimiento, setOpenMovimiento] = useState(false);
  const [movTipo, setMovTipo] = useState("venta"); // 'venta' or 'abastecimiento'
  const [selectedProd, setSelectedProd] = useState(null);
  const [formMov, setFormMov] = useState({
    cantidad: 1,
    precio_unitario: 0,
  });

  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  /**
   * Product Acquisition Handler
   * Persists a new item to the inventory using multi-part form data for image support.
   */
  const handleCrearProducto = async () => {
    if (!formCrear.nombre || !formCrear.precio) {
      return alert("Faltan datos requeridos.");
    }

    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append("nombre", formCrear.nombre.trim());
      formData.append("precio_unitario", Number(formCrear.precio));
      formData.append("cantidad", Number(formCrear.stock) || 0);
      if (formCrear.imagen) {
        formData.append("foto", formCrear.imagen);
      }

      await api.post("/productos", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setOpenCrear(false);
      setFormCrear({ nombre: "", precio: "", stock: "", imagen: null });
      await refetchProductos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error al crear producto");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Logistics Movement Handler
   * Records sales (outbound) or supplies (inbound) for a specific item.
   * Includes stock level validation to prevent overselling.
   */
  const handleRegistrarMovimiento = async () => {
    const cantidad = Number(formMov.cantidad);
    const precio = Number(formMov.precio_unitario);

    if (cantidad <= 0 || precio <= 0) {
      return alert("Valores deben ser mayores a 0");
    }

    // Guard: Prevent selling more units than currently available in inventory
    if (movTipo === "venta" && cantidad > selectedProd.cantidad) {
      return alert(`Solo hay ${selectedProd.cantidad} en stock.`);
    }

    try {
      setSaving(true);

      await api.post(`/productos/${selectedProd.id}/${movTipo}`, {
        cantidad,
        precio_unitario: precio,
      });

      setOpenMovimiento(false);

      // Multi-stream refresh to ensure UI consistency across tabs
      await Promise.all([
        refetchProductos(),
        refetchMovimientos(),
        refetchStats(),
      ]);

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error al procesar la operación");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Asset Update Handler
   * Specifically handles the asynchronous replacement of product photography.
   */
  const handleUpdateImagen = async (prodId, file) => {
    if (!file) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("foto", file);
      
      await api.patch(`/productos/${prodId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      await refetchProductos();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error al actualizar imagen del producto");
    } finally {
      setSaving(false);
    }
  };

  /** Initializes the logistics workflow for a selected asset */
  const handleOpenMovimiento = (prod, tipo) => {
    setSelectedProd(prod);
    setMovTipo(tipo);
    setFormMov({
      cantidad: 1,
      precio_unitario: Number(prod.precio_unitario),
    });
    setOpenMovimiento(true);
  };

  /** 
   * Inventory KPI Processor
   * Aggregates item volume, total stock count, and total inventory value.
   */
  const inventoryStats = useMemo(() => {
    const list = Array.isArray(productos) ? productos : [];
    const totalStock = list.reduce(
      (sum, item) => sum + Number(item.cantidad || 0),
      0
    );
    const totalValue = list.reduce(
      (sum, item) =>
        sum +
        Number(item.precio_unitario || 0) *
          Number(item.cantidad || 0),
      0
    );
    return { total: list.length, stock: totalStock, value: totalValue };
  }, [productos]);

  /** Product filter logic for real-time search interactivity */
  const filteredProductos = useMemo(() => {
    if (!Array.isArray(productos)) return [];
    return productos.filter((p) =>
      String(p.nombre || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [productos, search]);

  /** 
   * Financial Visualization Processor
   * Consolidates performance data by product for high-fidelity charting.
   */
  const chartData = useMemo(() => {
    if (!stats || (!stats.ingresos && !stats.gastos)) return [];

    const map = new Map();

    stats.ingresos?.forEach((i) => {
      map.set(i.id, {
        name: i.nombre,
        ingresos: Number(i.total_ingresos) || 0,
        gastos: 0,
      });
    });

    stats.gastos?.forEach((g) => {
      if (map.has(g.id)) {
        map.get(g.id).gastos = Number(g.total_gastos) || 0;
      } else {
        map.set(g.id, {
          name: g.nombre,
          ingresos: 0,
          gastos: Number(g.total_gastos) || 0,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.ingresos - b.gastos - (a.ingresos - a.gastos)
    );
  }, [stats]);


  return {
    gymReady,
    activeTab, setActiveTab,
    productos, loading, refetchProductos,
    movimientos, refetchMovimientos,
    stats, refetchStats,
    openCrear, setOpenCrear,
    formCrear, setFormCrear,
    openMovimiento, setOpenMovimiento,
    movTipo, setMovTipo,
    selectedProd, setSelectedProd,
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
  };
}
