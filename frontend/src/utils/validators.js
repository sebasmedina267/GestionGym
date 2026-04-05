export function isRequired(value) {
  return value !== null && value !== undefined && value !== "";
}

export function isEmail(value) {
  if (!value) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
}

export function isNumber(value) {
  return !isNaN(value);
}

export function minLength(value, length) {
  return value && value.length >= length;
}

export function validateForm(fields) {
  const errors = {};

  for (const key in fields) {
    const { value, required, email, number, min } = fields[key];

    if (required && !isRequired(value)) {
      errors[key] = "Este campo es obligatorio";
      continue;
    }

    if (email && !isEmail(value)) {
      errors[key] = "Email inválido";
      continue;
    }

    if (number && !isNumber(value)) {
      errors[key] = "Debe ser un número";
      continue;
    }

    if (min && !minLength(value, min)) {
      errors[key] = `Debe tener al menos ${min} caracteres`;
      continue;
    }
  }

  return errors;
}
