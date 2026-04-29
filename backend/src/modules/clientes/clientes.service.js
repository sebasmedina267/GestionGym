import * as clientesRepository from "./clientes.repository.js";
import * as authRepository from "../auth/auth.repository.js";
import { registrarOperacion } from "../audit/audit.service.js";
import { requireFields } from "../../utils/validators.js";
import { AppError } from "../../utils/AppError.js";
import { hashPassword } from "../../utils/password.js";
import crypto from "crypto";

/* ============================================================
   VALIDACIÓN DE PERMISOS
============================================================ */

async function validarPermisos(adminId, gymId) {
  const gyms = await authRepository.getGymsByAdminId(adminId);
  if (!gyms.some((g) => g.id === gymId)) {
    throw new AppError("No tienes permiso para operar en este gym", 403);
  }
}

/* ============================================================
   GENERAR CONTRASEÑA AUTOMÁTICA
============================================================ */

function generarContraseñaAutomatica() {
  // Genera una contraseña que cumple los requisitos:
  // - Mínimo 8 caracteres
  // - Al menos 1 mayúscula
  // - Al menos 1 número
  // - Al menos 1 símbolo
  
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minusculas = 'abcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const simbolos = '!@#$%^&*';
  
  let contraseña = '';
  contraseña += letras.charAt(Math.floor(Math.random() * letras.length));
  contraseña += numeros.charAt(Math.floor(Math.random() * numeros.length));
  contraseña += simbolos.charAt(Math.floor(Math.random() * simbolos.length));
  
  // Agregar caracteres aleatorios hasta llegar a 10 caracteres
  const todosLosCaracteres = letras + minusculas + numeros + simbolos;
  for (let i = 3; i < 10; i++) {
    contraseña += todosLosCaracteres.charAt(Math.floor(Math.random() * todosLosCaracteres.length));
  }
  
  // Mezclar la contraseña
  return contraseña.split('').sort(() => 0.5 - Math.random()).join('');
}

/* ============================================================
   ELIMINAR CLIENTES INACTIVOS (4+ MESES)
============================================================ */

async function eliminarClientesInactivosMuchotiempo(gymId) {
  try {
    // Eliminar clientes que han estado inactivos desde hace más de 4 meses
    await clientesRepository.deletePermanentlyInactiveClients(gymId, 4);
  } catch (err) {
    console.error("Error al eliminar clientes inactivos:", err);
  }
}

/* ============================================================
   LISTAR CLIENTES
============================================================ */

export async function listarClientes(gymId) {
  // Eliminar clientes que han estado inactivos más de 4 meses
  await eliminarClientesInactivosMuchotiempo(gymId);
  
  return clientesRepository.findByGym(gymId);
}

/* ============================================================
   ESTADÍSTICAS CLIENTES
=========================================================== */

export async function estadisticasClientes(gymId) {
  const [genero, edad] = await Promise.all([
    clientesRepository.statsGenero(gymId),
    clientesRepository.statsEdad(gymId)
  ]);
  
  return { genero, edad };
}

/* ============================================================
   CREAR CLIENTE
============================================================ */

export async function crearCliente(gymId, data, admin) {
  requireFields(data, ["nombre", "apellido", "edad", "sexo"]);

  if (!admin?.id) throw new AppError("Admin inválido", 400);

  await validarPermisos(admin.id, gymId);

  // Si se proporciona email, generar contraseña automática
  let clienteData = { ...data };
  
  if (data.email) {
    // Validar email
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!emailValido) throw new AppError("Email inválido", 400);

    // Generar contraseña automática
    const contraseña = generarContraseñaAutomatica();
    const passwordHash = await hashPassword(contraseña);
    
    clienteData.email = data.email;
    clienteData.password = passwordHash;
    clienteData.tipo_usuario = 'CLIENTE';
    
    // Retornar la contraseña en la respuesta para mostrarla al usuario
    // (puede ser enviada por email o mostrada en pantalla)
    clienteData._contraseña_generada = contraseña;
  }

  const cliente = await clientesRepository.create(gymId, clienteData);

  // Eliminar la contraseña del objeto antes de retornar (mantener seguridad)
  const clienteRespuesta = { ...cliente };
  if (data.email) {
    clienteRespuesta.contraseña_generada = clienteData._contraseña_generada;
  }

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: cliente.id,
    accion: "CREAR",
    detalles: { ...data, password: data.email ? "GENERADA_AUTOMATICAMENTE" : undefined },
  });

  return clienteRespuesta;
}

/* ============================================================
   ACTUALIZAR CLIENTE
============================================================ */

export async function actualizarCliente(gymId, id, data, admin) {
  if (!admin?.id) throw new AppError("Admin inválido", 400);

  await validarPermisos(admin.id, gymId);

  const cliente = await clientesRepository.getById(gymId, id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);

  const actualizado = await clientesRepository.update(gymId, id, data);

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: id,
    accion: "ACTUALIZAR",
    detalles: data,
  });

  return actualizado;
}

/* ============================================================
   ELIMINAR CLIENTE
============================================================ */

export async function eliminarCliente(gymId, id, admin) {
  if (!admin?.id) throw new AppError("Admin inválido", 400);

  await validarPermisos(admin.id, gymId);

  const cliente = await clientesRepository.getById(gymId, id);
  if (!cliente) throw new AppError("Cliente no encontrado", 404);

  await clientesRepository.remove(gymId, id);

  await registrarOperacion({
    adminId: admin.id,
    gymId,
    entidad: "CLIENTE",
    entidadId: id,
    accion: "ELIMINAR",
  });
}
