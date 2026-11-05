/**
 * Utilidades para formateo de datos específicos para ARG
 */
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";

// Formateo de números ARG (miles con punto, decimales con coma)
export const formatARGNumber = (num, decimals = 2) => {
  if (isNaN(num)) {
    console.error("Se intentó formatear un valor no numérico:", num);
    return "0,00";
  }

  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Parseo de números en formato ARG a número JS
export const parseARGNumber = (str) => {
  if (typeof str !== "string") return str;

  const cleaned = str
    .replace(/\./g, "") // Elimina puntos de miles
    .replace(",", "."); // Reemplaza coma decimal por punto

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Formateo de porcentajes (agrega el símbolo %)
export const formatPercentage = (value, decimals = 2) => {
  const num =
    typeof value === "string" ? parseFloat(value.replace(",", ".")) : value;
  return `${formatARGNumber(num, decimals)}%`;
};

// Formateo de fechas (DD/MM/YYYY)
export const formatARGDate = (dateString) => {
  if (!dateString) return "Fecha inválida";

  const date = parse(dateString, "d/M/yyyy", new Date());
  if (!isValid(date)) return dateString; // Devuelve el original si falla
  return format(date, "dd/MM/yyyy");
};

// Formateo de Date a fecha (YYYY-MM-DD)
export const formatDateToString = (date) => {
  if (!date) return "";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (!(parsed instanceof Date) || !isValid(parsed)) {
    console.error("Fecha inválida:", date);
    return "";
  }
  return format(parsed, "yyyy-MM-dd");
};

export const formatToISO = (date) => {
  if (!date) return null;
  const parsed = parse(date, "d/M/yyyy", new Date());
  if (!isValid(parsed)) return null;
  return format(parsed, "yyyy-MM-dd");
};

// Parsea "DD/MM/YYYY" a un Date en medianoche local (evita desfases UTC).
export const formatDateToISOFixedDay = (fechaStr) => {
  if (!fechaStr) return null;
  if (fechaStr instanceof Date) return fechaStr;
  if (typeof fechaStr !== "string") return null;

  const date = parse(fechaStr, "d/M/yyyy", new Date());
  return isValid(date) ? date : null;
};

// Formateo de CUIT (XX-XXXXXXXX-X)
export const formatCUIT = (cuit) => {
  if (!cuit) return "";
  const cleaned = cuit.replace(/\D/g, "").slice(0, 11);
  return cleaned.replace(/(\d{2})(\d{8})(\d{1})/, "$1-$2-$3");
};

// Helper para valores monetarios
export const formatCurrency = (value, decimals = 2) => {
  return `${formatARGNumber(value, decimals)}`;
};

/**
 * Convierte cualquier formato numérico (string o number) a número
 * @param {string|number} value - Valor a convertir
 * @returns {number} - Valor convertido a número
 */
export const toNumber = (value) => {
  // Si ya es número, retornarlo directamente
  if (typeof value === "number") return value;

  // Si es string vacío o no es string, retornar 0
  if (typeof value !== "string" || value.trim() === "") return 0;

  // Limpiar el string: quitar puntos de miles y reemplazar coma decimal
  const cleaned = value
    .replace(/\./g, "") // Eliminar separadores de miles
    .replace(",", ".") // Reemplazar coma decimal por punto
    .replace(/[^\d.-]/g, ""); // Eliminar caracteres no numéricos

  // Convertir a número
  const parsed = parseFloat(cleaned);

  // Retornar 0 si el resultado no es un número válido
  return isNaN(parsed) ? 0 : parsed;
};

export const formatNumberWithDecimals = (value, decimals = 2) => {
  const number =
    typeof value === "string"
      ? parseFloat(value.replace(/\./g, "").replace(",", "."))
      : value;

  if (isNaN(number)) return { enteros: "0", decimales: "00" };

  const fixed = number.toFixed(decimals);
  const [enteros, decimales] = fixed.split(".");

  return {
    enteros,
    decimales: decimales.padEnd(decimals, "0"),
  };
};

export const formatDecimalValue = (value) => {
  if (value === null || value === undefined) return "";

  // Los números usan punto decimal: se pasa a coma antes de sanitizar para no
  // perder los decimales (1234.56 -> "1234,56", no "123456").
  const stringValue =
    typeof value === "number" ? String(value).replace(".", ",") : String(value);

  let sanitizedValue = stringValue.replace(/[^\d,]/g, "");

  if ((sanitizedValue.match(/,/g) || []).length > 1) {
    const parts = sanitizedValue.split(",");
    sanitizedValue = parts[0] + "," + parts.slice(1).join("");
  }

  if (sanitizedValue.includes(",")) {
    const [intPart, decPart] = sanitizedValue.split(",");
    if (decPart.length > 2) {
      sanitizedValue = `${intPart},${decPart.substring(0, 2)}`;
    }
  }

  return sanitizedValue;
};

export const formatCurrencyARG = (value, currencySymbol = true) => {
  if (!value) return "";

  if (value.toString().startsWith("$ ")) return value;

  const formattedValue = value.toString().replace(".", ",");
  const prefix = currencySymbol ? "$ " : "";

  if (formattedValue.includes(",")) {
    const [integerPart, decimalPart] = formattedValue.split(",");
    const limitedDecimalPart = decimalPart.slice(0, 2);
    const cleanedInteger = integerPart.replace(/\D/g, "") || "0";
    const formattedInteger = BigInt(cleanedInteger).toLocaleString("es-AR");
    return `${prefix}${formattedInteger},${limitedDecimalPart}`;
  } else {
    const numericValue = formattedValue.replace(/\D/g, "");
    if (numericValue === "") return "";
    const num = BigInt(numericValue);
    return prefix + num.toLocaleString("es-AR");
  }
};

export const formatIntegerInput = (value) => {
  const cleaned = value.replace(/\D/g, ""); // Elimina todo lo que no sea dígito
  return cleaned ? parseInt(cleaned, 10) : "";
};

export const secondsToTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const formatDateParts = (dateString) => {
  if (!dateString) return { dayMonth: "-- / --", year: "----" };
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  if (!isValid(date)) return { dayMonth: "-- / --", year: "----" };
  return {
    dayMonth: format(date, "dd / MM"),
    year: format(date, "yyyy"),
  };
};

export const formatDateObjectToARG = (dateObj) => {
  if (!dateObj) return "Fecha inválida";

  const date = typeof dateObj === "string" ? new Date(dateObj) : dateObj;
  if (!(date instanceof Date) || !isValid(date)) {
    console.error("Fecha inválida:", dateObj);
    return "Fecha inválida";
  }
  return format(date, "dd/MM/yyyy");
};

export const formatArrayToOptionsArray = (array, key, value) => {
  if (!Array.isArray(array)) return [];
  return array.map((item) => ({
    value: item[key],
    label: item[value],
  }));
};

export const objectToQueryParam = (obj) => {
  if (!obj || typeof obj !== "object") return "";

  const cleanObj = Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});

  return new URLSearchParams(cleanObj).toString();
};

const parseLocalizedNumber = (str) => {
  const lastComma = str.lastIndexOf(",");
  const lastDot = str.lastIndexOf(".");

  if (lastComma === -1 && lastDot === -1) return parseFloat(str);

  if (lastComma !== -1 && lastDot !== -1) {
    return lastComma > lastDot
      ? parseFloat(str.replace(/\./g, "").replace(",", "."))
      : parseFloat(str.replace(/,/g, ""));
  }

  if (lastComma !== -1) {
    const parts = str.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      return parseFloat(str.replace(",", "."));
    }
    return parseFloat(str.replace(/,/g, ""));
  }

  return str.split(".").length > 2
    ? parseFloat(str.replace(/\./g, ""))
    : parseFloat(str);
};

export const sanitizeCurrency = (value, decimals = 2) => {
  if (value == null || value === "") return "0,00";

  if (typeof value === "number") {
    return formatARGNumber(value, decimals);
  }

  const stripped = String(value).replace(/[^0-9.,-]/g, "");
  if (stripped === "") return "0,00";

  const numericValue = parseLocalizedNumber(stripped);

  return isNaN(numericValue) ? "0,00" : formatARGNumber(numericValue, decimals);
};

export const addSymbolCurrency = (value) => {
  if (value === null || value === undefined) {
    return "$ 0,00";
  }
  const valueParsed = String(value);
  const isNegative = `${valueParsed}`.startsWith("-");
  if (isNegative) {
    return `-$ ${valueParsed.slice(1)}`;
  }
  return `$ ${valueParsed}`;
};

export const parseDateWithoutTimezone = (dateString) => {
  if (!dateString) return undefined;

  // Si ya es un objeto Date, devolverlo directamente
  if (dateString instanceof Date) return dateString;

  // Si no es un string, devolver undefined
  if (typeof dateString !== "string") return undefined;

  // Parsear fecha en hora local (YYYY-MM-DD) para evitar desfases UTC
  const date = parse(dateString, "yyyy-MM-dd", new Date());
  return isValid(date) ? date : undefined;
};

export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formatea una fecha ARG del back ("22/07/2026" o "22/07/2026 a las 13:15 hs")
 * al formato largo que muestran los detalles: "22 de Julio · 13:15".
 * Si no matchea el patrón esperado, devuelve el valor original.
 */
export const formatLongDayMonth = (value) => {
  if (!value) return "";
  const match = String(value).match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\D*(\d{2}:\d{2}))?/
  );
  if (!match) return String(value);

  const [, day, month, year, time] = match;
  const date = parse(`${day}/${month}/${year}`, "dd/MM/yyyy", new Date());
  if (!isValid(date)) return String(value);

  const monthName = capitalizeFirstLetter(format(date, "MMMM", { locale: es }));
  return time ? `${day} de ${monthName} · ${time}` : `${day} de ${monthName}`;
};

/**
 * Parte un importe formateado del back ("$ 8.941.590,00") en monto y centavos,
 * que es como los renderiza `PriceWithCents` (centavos en superíndice).
 */
export const splitAmountAndCents = (value) => {
  const [amount = "0", cents = "00"] = String(value ?? "")
    .replace(/[$\s]/g, "")
    .split(",");
  return { amount, cents };
};
