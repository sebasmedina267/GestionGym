import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import "./ClientDashboard.css";

/**
 * ClientEnrolled Component
 * 
 * Dashboard for users enrolled in a gym (USUARIO_FINAL).
 * Displays gym information, facilities overview, and quick access to classes/products.
 */
export default function ClientEnrolled({ gym, onUnenroll }) {
  const { admin: user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [machines, setMachines] = useState([]);
  const [products, setProducts] = useState([]);
  const [classLoading, setClassLoading] = useState(false);
  const [enrollingClass, setEnrollingClass] = useState(null);

  // Fetch available classes when tab changes to "classes"
  useEffect(() => {
    if (activeTab === "classes" && gym?.id) {
      fetchClasses();
    }
  }, [activeTab, gym?.id]);

  // Fetch machines when tab changes to "machines"
  useEffect(() => {
    if (activeTab === "machines" && gym?.id) {
      fetchMachines();
    }
  }, [activeTab, gym?.id]);

  // Fetch products when tab changes to "products"
  useEffect(() => {
    if (activeTab === "products" && gym?.id) {
      fetchProducts();
    }
  }, [activeTab, gym?.id]);

  const fetchClasses = async () => {
    try {
      setClassLoading(true);
      // Get available classes
      const availRes = await api.get(
        `/client/dashboard/my-gyms/${gym.id}/available-classes?includeEnrolled=true`
      );
      setAvailableClasses(availRes.data.data || []);

      // Get enrolled classes
      const enrolledRes = await api.get(`/client/dashboard/my-classes`);
      setEnrolledClasses(enrolledRes.data.data || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setClassLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await api.get(`/client/dashboard/my-gyms/${gym.id}/machines`);
      setMachines(res.data.data || []);
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/client/dashboard/my-gyms/${gym.id}/products`);
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleEnrollClass = async (classScheduleId) => {
    try {
      setEnrollingClass(classScheduleId);
      await api.post(
        `/client/dashboard/classes/${classScheduleId}/enroll`,
        {}
      );
      // Refresh classes
      await fetchClasses();
      alert("¡Inscrito en la clase exitosamente!");
    } catch (err) {
      console.error("Error enrolling in class:", err);
      alert(
        err.response?.data?.message || "Error al inscribirse en la clase"
      );
    } finally {
      setEnrollingClass(null);
    }
  };

  const handleUnenrollClass = async (classScheduleId) => {
    if (window.confirm("¿Desapuntarte de esta clase?")) {
      try {
        await api.delete(
          `/client/dashboard/classes/${classScheduleId}/unenroll`
        );
        // Refresh classes
        await fetchClasses();
        alert("Desapuntado de la clase");
      } catch (err) {
        console.error("Error unenrolling from class:", err);
        alert(
          err.response?.data?.message || "Error al desapuntarse de la clase"
        );
      }
    }
  };

  const handleUnenroll = async () => {
    if (window.confirm("¿Estás seguro de que quieres desapuntarte de este gimnasio?")) {
      try {
        setLoading(true);
        await api.put(`/client/dashboard/my-gyms/${gym.id}/cancel`);
        if (onUnenroll) onUnenroll();
      } catch (err) {
        console.error("Error unenrolling:", err);
        alert("Error al desapuntarse del gimnasio");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0b14] text-gym-accent">
        <div className="animate-pulse text-xl font-bold tracking-widest uppercase">
          Actualizando...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container p-4 lg:p-6 space-y-4 bg-[#0a0b14] min-h-screen text-gray-100 font-inter">
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-2 text-gym-accent">
            <svg
              className="h-8 w-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.86 6.29L2.71 8.43L4.14 9.86L5.57 8.43L7 9.86L3.43 13.43L4.86 14.86L6.29 13.43L14.86 22L11.43 18.57L10 20L11.43 21.43L10 22.86L12.14 25l2.14-2.14 1.43 1.43 1.43-1.43-2.14-2.14 2.14-2.14-1.43-1.43-1.43 1.43-3.57-3.57 8.57-8.57z"></path>
            </svg>
            <span className="text-2xl font-bold tracking-tight">FitFlow</span>
          </div>

          {/* User Welcome */}
          <div>
            <h1 className="text-lg font-semibold">Hola, {user?.nombre || "Usuario"} 👋</h1>
            <p className="text-xs text-gray-400">Tu panel de gimnasio</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center space-x-2 px-4 py-2 bg-[#111422] border border-[#1f2937] hover:bg-red-900/20 transition-colors rounded-lg text-sm font-medium"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </header>

      {/* --- NAVIGATION --- */}
      <nav className="border-b border-[#1f2937]">
        <ul className="flex space-x-8 text-sm font-medium overflow-x-auto">
          <li
            className={`pb-3 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "relative text-gym-accent border-b-2 border-gym-accent"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <a className="flex items-center space-x-2">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
              <span>Mi Gym</span>
            </a>
          </li>
          <li
            className={`pb-3 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === "classes"
                ? "relative text-gym-accent border-b-2 border-gym-accent"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("classes")}
          >
            <a className="flex items-center space-x-2">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
              <span>Clases</span>
            </a>
          </li>
          <li
            className={`pb-3 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === "machines"
                ? "relative text-gym-accent border-b-2 border-gym-accent"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("machines")}
          >
            <a className="flex items-center space-x-2">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
              <span>Máquinas</span>
            </a>
          </li>
          <li
            className={`pb-3 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === "products"
                ? "relative text-gym-accent border-b-2 border-gym-accent"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("products")}
          >
            <a className="flex items-center space-x-2">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
              <span>Productos</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* --- TAB CONTENT --- */}
      {activeTab === "overview" && (
        <div className="space-y-4">

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-44 bg-[#111422] rounded-2xl overflow-hidden border border-[#1f2937] flex flex-col justify-end p-8">
        {/* Background Image or Gradient */}
        {gym?.foto ? (
          <img
            src={gym.foto}
            alt={gym.nombre}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b14] to-transparent opacity-60"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-gym-accent/10 to-transparent"></div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black tracking-tighter text-white">
            {gym?.nombre || "Gimnasio"}
          </h2>
          <div className="flex items-center text-gray-400 mt-2 text-sm">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
              <path
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span>{gym?.direccion || gym?.ciudad || "Sin ubicación registrada"}</span>
          </div>
        </div>
      </section>

      {/* --- CONTENT GRID --- */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card: Facilities */}
        <div className="bg-[#111422] border border-[#1f2937] rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex items-center space-x-2 text-gym-accent mb-8">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Instalaciones
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 flex-1 items-center">
            <div className="text-center">
              <p className="text-4xl font-black text-white">{gym?.total_clases || 0}</p>
              <p className="text-[9px] uppercase text-gray-500 font-bold mt-1">Clases</p>
            </div>
            <div className="text-center border-x border-[#1f2937]">
              <p className="text-4xl font-black text-white">{gym?.total_maquinas || 0}</p>
              <p className="text-[9px] uppercase text-gray-500 font-bold mt-1">Máquinas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-white">{gym?.total_productos || 0}</p>
              <p className="text-[9px] uppercase text-gray-500 font-bold mt-1">Productos</p>
            </div>
          </div>
        </div>

        {/* Card: Schedule Quick View */}
        <div className="bg-[#111422] border border-[#1f2937] rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex items-center space-x-2 text-gym-accent mb-6">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Horarios
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[#1f2937]/50">
              <span className="text-sm text-gray-400">Apertura del centro</span>
              <span className="font-mono text-lg font-bold text-white">
                {gym?.horario_inicio || "06:00:00"}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-400">Cierre del centro</span>
              <span className="font-mono text-lg font-bold text-white">
                {gym?.horario_fin || "22:00:00"}
              </span>
            </div>
          </div>
        </div>

        {/* Card: Contact */}
        <div className="bg-[#111422] border border-[#1f2937] rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex items-center space-x-2 text-gym-accent mb-6">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
              <path
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              ></path>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Contacto
            </span>
          </div>
          <div className="flex-1 space-y-5">
            <div>
              <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Teléfono</p>
              <p className="text-sm text-gray-200">{gym?.telefono || "No disponible"}</p>
            </div>
            <div className="pt-4 border-t border-[#1f2937]/50">
              <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Email</p>
              <p className="text-sm text-gray-200 truncate">
                {gym?.email_contacto || "No disponible"}
              </p>
            </div>
          </div>
        </div>

        {/* Banner: Large Center Hours */}
        <div className="bg-[#111422] border border-gym-accent/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between col-span-1 md:col-span-2 lg:col-span-3 shadow-2xl">
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
            <div className="bg-gym-accent/10 p-5 rounded-full text-gym-accent">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gym-accent">
                Horario del Centro
              </span>
              <p className="text-sm text-gray-400 mt-1">
                Lunes a Viernes (Consultar fines de semana)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-5xl lg:text-7xl font-black text-gym-accent tracking-tighter">
              {gym?.horario_inicio?.substring(0, 5) || "06:00"}
            </span>
            <span className="text-2xl text-gray-600 font-bold mt-4">a</span>
            <span className="text-5xl lg:text-7xl font-black text-gym-accent tracking-tighter">
              {gym?.horario_fin?.substring(0, 5) || "22:00"}
            </span>
          </div>
        </div>

        {/* Action: Unenroll Button */}
        <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-6 col-span-1 md:col-span-2 lg:col-span-3">
          <button
            onClick={handleUnenroll}
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ❌ Desapuntarse de {gym?.nombre}
          </button>
        </div>
      </main>
        </div>
      )}

      {activeTab === "classes" && (
        <section className="bg-[#111422] border border-[#1f2937] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">Clases</h2>
            <p className="text-sm text-gray-400">Reserva y gestiona tus sesiones.</p>
          </div>

          {classLoading ? (
            <p className="text-sm text-gray-400">Cargando clases...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableClasses.length === 0 ? (
                <p className="text-sm text-gray-400">No hay clases disponibles.</p>
              ) : (
                availableClasses.flatMap((clase) =>
                  (clase.horarios?.length ? clase.horarios : [clase]).map((horario) => {
                    const horarioId = horario.id || clase.horario_id;
                    const alreadyEnrolled = enrolledClasses.some(
                      (item) =>
                        item.horario_id === horarioId ||
                        item.clase_horario_id === horarioId ||
                        item.id === horarioId
                    );

                    return (
                      <article
                        key={`${clase.id}-${horarioId}`}
                        className="border border-[#1f2937] rounded-xl p-4 bg-[#0a0b14]"
                      >
                        <h3 className="font-bold text-white">{clase.nombre}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {horario.inicio || clase.inicio || "Horario pendiente"}
                        </p>
                        <button
                          className="mt-4 px-4 py-2 rounded-lg bg-gym-accent text-[#0a0b14] text-sm font-bold disabled:opacity-60"
                          disabled={enrollingClass === horarioId}
                          onClick={() =>
                            alreadyEnrolled
                              ? handleUnenrollClass(horarioId)
                              : handleEnrollClass(horarioId)
                          }
                        >
                          {alreadyEnrolled ? "Desapuntarme" : "Inscribirme"}
                        </button>
                      </article>
                    );
                  })
                )
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === "machines" && (
        <section className="bg-[#111422] border border-[#1f2937] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">Maquinas</h2>
            <p className="text-sm text-gray-400">Equipamiento disponible en tu gimnasio.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {machines.length === 0 ? (
              <p className="text-sm text-gray-400">No hay maquinas registradas.</p>
            ) : (
              machines.map((machine) => (
                <article key={machine.id} className="border border-[#1f2937] rounded-xl p-4 bg-[#0a0b14]">
                  <h3 className="font-bold text-white">{machine.nombre}</h3>
                  <p className="text-xs text-gray-400 mt-2">{machine.ubicacion || machine.uso || "Sin ubicacion"}</p>
                  <p className="text-sm text-gym-accent mt-3">Cantidad: {machine.cantidad || 1}</p>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === "products" && (
        <section className="bg-[#111422] border border-[#1f2937] rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-white">Productos</h2>
            <p className="text-sm text-gray-400">Productos disponibles para compra.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.length === 0 ? (
              <p className="text-sm text-gray-400">No hay productos disponibles.</p>
            ) : (
              products.map((product) => (
                <article key={product.id} className="border border-[#1f2937] rounded-xl p-4 bg-[#0a0b14]">
                  <h3 className="font-bold text-white">{product.nombre}</h3>
                  <p className="text-xs text-gray-400 mt-2">{product.descripcion || "Sin descripcion"}</p>
                  <p className="text-lg font-black text-gym-accent mt-3">
                    {product.precio ?? product.precio_unitario ?? 0} EUR
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
