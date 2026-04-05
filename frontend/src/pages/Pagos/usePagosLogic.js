import { useState, useMemo, useEffect } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useGym } from "../../hooks/useGym";
import api from "../../api/axios";

export function usePagosLogic() {
  const { gym } = useGym();
  const gymReady = Boolean(gym);

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const [mes, setMes] = useState(currentMonthStr);
  
  const { data: clases } = useFetch(
    gymReady ? `/clases?gymId=${gym.id}` : null
  );
  
  const [claseId, setClaseId] = useState("");
  const [clasePrecio, setClasePrecio] = useState(null);
  
  const [estadoClase, setEstadoClase] = useState([]);
  const [loadingEstado, setLoadingEstado] = useState(false);
  
  const [showMetodoModal, setShowMetodoModal] = useState(false);
  const [clientePendiente, setClientePendiente] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [pagando, setPagando] = useState(false);
  
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'info' });
  
  const handleFetchEstado = async () => {
    if (!claseId) {
      setEstadoClase([]);
      setClasePrecio(null);
      return;
    }
    try {
      setLoadingEstado(true);
      const res = await api.get(`/pagos/estado/${claseId}?mes=${mes}`);
      setEstadoClase(res.data.data);
      
      try {
        const preciosRes = await api.get(`/clases/${claseId}/precios`);
        if (Array.isArray(preciosRes.data.data) && preciosRes.data.data.length > 0) {
          setClasePrecio(preciosRes.data.data[0].precio);
        }
      } catch (err) {
        console.warn("No se pudo obtener precio de clase:", err);
        setClasePrecio(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEstado(false);
    }
  };

  useEffect(() => {
    handleFetchEstado();
  }, [claseId, mes]);

  const handleQuickPayClick = (cliente) => {
    if (cliente.pagado) {
      setAlertModal({
        open: true,
        title: 'Pago Registrado',
        message: 'Este cliente ya tiene un pago registrado este mes para esta clase.',
        type: 'info'
      });
      return;
    }

    if (!clasePrecio) {
      setAlertModal({
        open: true,
        title: 'Sin Precio Configurado',
        message: 'No se encontró un precio configurado para esta clase. Configura un precio primero.',
        type: 'warning'
      });
      return;
    }

    setClientePendiente(cliente);
    setMetodoPago('EFECTIVO');
    setShowMetodoModal(true);
  };

  const handleConfirmarPago = async () => {
    if (!clientePendiente) return;

    try {
      setPagando(true);
      const payload = {
        cliente_id: clientePendiente.cliente_id,
        clase_id: Number(claseId),
        importe: Number(clasePrecio),
        metodo_pago: metodoPago,
        fecha_pago: new Date().toISOString().split('T')[0],
      };

      await api.post("/pagos", payload);
      
      setAlertModal({
        open: true,
        title: '✅ Pago Registrado',
        message: `Pago de €${Number(clasePrecio).toFixed(2)} registrado exitosamente con ${metodoPago}.`,
        type: 'success'
      });
      
      await handleFetchEstado();
      setShowMetodoModal(false);
      setClientePendiente(null);
    } catch (err) {
      console.error(err);
      setAlertModal({
        open: true,
        title: '❌ Error al Registrar',
        message: err.response?.data?.message || 'No se pudo registrar el pago. Intenta de nuevo.',
        type: 'error'
      });
    } finally {
      setPagando(false);
    }
  };

  const classStats = useMemo(() => {
    let totalPagado = 0;
    let pagadosCount = 0;
    let pendientesCount = 0;
    
    estadoClase.forEach(c => {
      if (c.pagado) {
        pagadosCount++;
        totalPagado += Number(c.importe || 0);
      } else {
        pendientesCount++;
      }
    });
    
    return {
      totalPagado,
      pagadosCount,
      pendientesCount,
      totalAlumnos: estadoClase.length
    };
  }, [estadoClase]);

  const metodoPagoStats = useMemo(() => {
    const conteo = {};
    
    estadoClase.forEach(c => {
      if (c.pagado && c.metodo_pago) {
        conteo[c.metodo_pago] = (conteo[c.metodo_pago] || 0) + 1;
      }
    });

    return Object.entries(conteo)
      .map(([nombre, cantidad]) => ({
        name: nombre,
        cantidad: cantidad
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }, [estadoClase]);

  const chartData = [
    { name: "Al corriente", value: classStats.pagadosCount },
    { name: "Pendientes", value: classStats.pendientesCount }
  ];

  return {
    gymReady,
    mes,
    setMes,
    clases,
    claseId,
    setClaseId,
    clasePrecio,
    estadoClase,
    loadingEstado,
    showMetodoModal,
    setShowMetodoModal,
    clientePendiente,
    setClientePendiente,
    metodoPago,
    setMetodoPago,
    pagando,
    alertModal,
    setAlertModal,
    handleQuickPayClick,
    handleConfirmarPago,
    classStats,
    metodoPagoStats,
    chartData
  };
}
