import { differenceInMilliseconds } from "date-fns";
import { color } from "src/assets/themes";
import { ACTIVITY_CHANNEL } from "src/lib/constants";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const formatInterest = (interest, formattedInterest) => {
  if (interest > 0) {
    return `+ ${formattedInterest}`;
  }
  if (interest < 0) {
    return `- ${formattedInterest.replace("-", "")}`;
  }
  return `${formattedInterest}`;
};

export const getInterestColor = (interest) => {
  if (typeof interest !== "number") {
    interest = parseFloat(
      interest.replace(/[$\s]/g, "").replace(/\./g, "").replace(",", ".")
    );
  }
  if (interest > 0) {
    return color.green[500];
  }
  if (interest < 0) {
    return color.orange[500];
  }
  return color.neutral[600];
};

export const getSeverityColor = (variant) => {
  switch (variant) {
    case "success":
      return color.btnGreen;
    case "primary":
      return color.btnLightBlue;
    case "danger":
      return color.btnRed;
    default:
      return color.grey;
  }
};

export const responsiveResize = (callback, breakpoint = 1240) => {
  const handleResize = () => {
    if (window.innerWidth < breakpoint) {
      callback("top");
    } else {
      callback("left");
    }
  };
  handleResize();

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
};

export const getDaysRemaining = (dateString) => {
  if (!dateString) return 0;
  const diffTime = differenceInMilliseconds(new Date(dateString), new Date());
  const diffDays = Math.ceil(diffTime / MS_PER_DAY);
  return diffDays > 0 ? diffDays : 0;
};

export const truncateString = (value, maxCharacters) => {
  if (!value) return "";
  const stringValue = String(value);
  if (stringValue.length <= maxCharacters) {
    return stringValue;
  }
  return stringValue.slice(0, maxCharacters);
};

export const prepareUpcomingDueDates = (data) => {
  return {
    logo: data?.company?.path_image || "",
    title: data?.company?.name || "",
    bgcolor: data?.company?.bgcolor || "",
    detail: [
      data?.company?.description && data?.company?.description !== ""
        ? data?.company?.description
        : "",
      data?.company?.client_id_label &&
        `${data?.company?.data_label}: ${data.company.client_id_label}`,
      data?.payment_options?.invoice?.items[0]?.id &&
        `Nro factura: ${data.payment_options.invoice.items[0]?.id}`,
    ].filter(Boolean),
    value:
      data?.payment_options?.invoice?.items[0]?.amount_config?.suggested || 0,
    hasAction: true,
    metadata: data,
    type: data?.type,
  };
};

export const prepareTransactionsHistory = (data) => {
  const resource = data?.recurso;
  // Los items de PSP llegan sin `recurso`: no hay detalle que pedir, así que
  // tampoco tienen que verse clickeables.
  const hasDetail =
    data?.canal === ACTIVITY_CHANNEL.DCP &&
    Boolean(resource?.tipo && resource?.id);

  return {
    logo: data?.multimedia?.path_image,
    bgcolor: data?.multimedia?.bgcolor,
    title: data.title || "Movimiento",
    detail: data.detail,
    value: data.valor,
    type: data?.type,
    status: data?.estado,
    resourceType: resource?.tipo ?? null,
    resourceId: resource?.id ?? null,
    hasDetail,
    hasAction: hasDetail,
    metadata: data,
  };
};

export const prepareAuthorizeTransactionsHistory = (data) => {
  return {
    logo: data.logo_filename_path,
    bgcolor: data.multimedia?.bgcolor,
    type: data?.type,
    title: data.prisma_empresa_nombre
      ? data.prisma_empresa_nombre
      : data.banco_nombre,
    detail: data.categoria ? data.categoria : data.metodo_pago_text,
    value: data.valor,
  };
};

export const objectToTitleTextArray = (obj) => {
  if (!obj || typeof obj !== "object") {
    return [];
  }

  return Object.entries(obj).map(([key, value]) => ({
    title: key,
    text: value,
  }));
};

export const FILE_MIME_TYPES = {
  pdf: "application/pdf",
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  png: "image/png",
};

export const onDownloadFile = (
  base64String,
  fileName = "documento",
  mimeType = "application/octet-stream"
) => {
  const base64 = base64String.replace(/^data:[^;]+;base64,/, "");
  const blob = base64toBlob(base64, mimeType);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

export const copyImageToClipboard = (
  base64String,
  mimeType = FILE_MIME_TYPES.png
) => {
  const base64 = base64String.replace(/^data:[^;]+;base64,/, "");
  const blob = base64toBlob(base64, mimeType);

  return navigator.clipboard.write([new ClipboardItem({ [mimeType]: blob })]);
};

const base64toBlob = (base64, type = "application/octet-stream") => {
  const binStr = atob(base64);
  const len = binStr.length;
  const arr = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i);
  }

  return new Blob([arr], { type });
};

const triggerAnchorDownload = (href, fileName) => {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName || "documento";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

// Descarga inmediata de un Blob/File ya en memoria (sin preview): genera un object
// URL, dispara la descarga y lo libera.
export const downloadBlob = (blob, fileName) => {
  const objectUrl = URL.createObjectURL(blob);
  triggerAnchorDownload(objectUrl, fileName);
  URL.revokeObjectURL(objectUrl);
};

// Abre el archivo de una URL remota en una pestaña nueva (preview en el visor del
// browser). Para descargar sin preview usar `downloadFileFromUrl`.
export const openFileInNewTab = (url) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

// Descarga inmediata de una URL remota (sin preview): baja el archivo como blob y
// lo guarda con el nombre indicado. Requiere que el origen (ej. S3) habilite CORS.
export const downloadFileFromUrl = async (url, fileName) => {
  const response = await fetch(url);
  const blob = await response.blob();
  downloadBlob(blob, fileName);
};

export const capitalizeAndReplaceUnderscore = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
};

export const adaptErrors = (errorData, messageFlag = false) => {
  const { errors, message } = errorData || {};
  if (errors && !messageFlag) {
    return Object.values(errors).flat();
  }
  if (message) {
    return [message];
  }
  return [];
};

export const handleMoneyInputKeyDown = (e, value, onChange, name) => {
  if (e.key === ".") {
    e.preventDefault();
    onChange(name, value + ",");
    return;
  }

  if (e.key === "Backspace") {
    const element = e.target;
    const caretPos = element.selectionStart;
    const currentValue = element.value;

    if (caretPos > 0 && currentValue[caretPos - 1] === ".") {
      e.preventDefault();
      const digitsAndComma = currentValue.replace(/[^\d,]/g, "");
      let digitCount = 0;
      let targetDigitIndex = -1;

      for (let i = 0; i < caretPos; i++) {
        if (/[\d]/.test(currentValue[i])) {
          digitCount++;
          targetDigitIndex = digitCount - 1;
        }
      }

      if (targetDigitIndex >= 0) {
        const newDigitsAndComma =
          digitsAndComma.slice(0, targetDigitIndex) +
          digitsAndComma.slice(targetDigitIndex + 1);

        const newDigitsBeforeCursor = targetDigitIndex;
        onChange(name, newDigitsAndComma);

        setTimeout(() => {
          const newFormattedValue = element.value;
          let newPos = 0;
          let matchCount = 0;

          for (let i = 0; i < newFormattedValue.length; i++) {
            if (/[0-9,]/.test(newFormattedValue[i])) {
              matchCount++;
            }
            if (matchCount >= newDigitsBeforeCursor) {
              newPos = i + 1;
              break;
            }
          }

          element.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
  }
};

export const adaptErrorsWithData = (errorData) => {
  const { data, message, errors } = errorData || {};
  const errorList = errors ? Object.values(errors).flat() : [];
  return {
    message,
    errors: errorList.length ? errorList : undefined,
    value: data?.valor,
  };
};

export const paginationAdapter = (data) => {
  return {
    total: data?.total,
    perPage: data?.per_page,
    currentPage: data?.current_page,
    lastPage: data?.last_page,
    from: data?.from,
    to: data?.to,
  };
};

export const getDecodedTokenFromUrl = (token) => {
  try {
    if (!token) {
      console.warn("No se encontró ningún token en la URL");
      return null;
    }

    const base64Url = token.split(".")[1];

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decodificando el token:", error);
    return null;
  }
};
