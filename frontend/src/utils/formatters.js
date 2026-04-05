// ===============================
// 💰 MONEDA
// ===============================
export function formatCurrency(amount, decimals = 2) {
  if (amount == null || isNaN(amount)) return "-";

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(amount));
}

// ===============================
// 📅 FECHAS
// ===============================
export function formatDate(dateInput) {
  if (!dateInput) return "-";

  const date = new Date(dateInput);

  if (isNaN(date)) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// 👉 FECHA + HORA (la que necesitas)
export function formatDateTime(dateInput) {
  if (!dateInput) return "-";

  const date = new Date(dateInput);
  if (isNaN(date)) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// 👉 SOLO HORA
export function formatTime(dateInput) {
  if (!dateInput) return "-";

  const date = new Date(dateInput);
  if (isNaN(date)) return "-";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// ===============================
// 🔤 TEXTO
// ===============================
export function capitalize(text) {
  if (!text) return "";

  return text
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}

// 👉 NOMBRE COMPLETO
export function fullName(user) {
  if (!user) return "";

  const { nombre = "", apellido = "" } = user;

  return `${capitalize(nombre)} ${capitalize(apellido)}`.trim();
}

// ===============================
// 📊 NÚMEROS
// ===============================
export function formatNumber(num) {
  if (num == null || isNaN(num)) return "-";

  return new Intl.NumberFormat("es-ES").format(num);
}

// 👉 PORCENTAJE
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return "-";

  return `${Number(value).toFixed(decimals)}%`;
}