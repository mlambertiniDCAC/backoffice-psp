export const GENERIC_ERROR_MESSAGE =
  "No pudimos completar la operación. Probá de nuevo en unos minutos.";

const ONBOARDING_SCOPE_MESSAGE = "la sesión todavía está en onboarding";
const MISSING_PSP_IDENTITY_MESSAGE = "no existe una cuenta PSP para ese mail";

const rawMessage = (error) =>
  error?.response?.data?.error?.message ?? error?.response?.data?.message;

export const getApiErrorMessage = (error) => {
  const response = error?.response;
  if (!response || response.status >= 500) return GENERIC_ERROR_MESSAGE;
  const raw = rawMessage(error);
  if (Array.isArray(raw) && raw.length) return raw.join(". ");
  if (typeof raw === "string" && raw.trim()) return raw;
  return GENERIC_ERROR_MESSAGE;
};

export const isOnboardingScopeError = (error) =>
  error?.response?.status === 403 &&
  String(rawMessage(error) ?? "").includes(ONBOARDING_SCOPE_MESSAGE);

export const isMissingPspIdentityError = (error) =>
  error?.response?.status === 401 &&
  String(rawMessage(error) ?? "").includes(MISSING_PSP_IDENTITY_MESSAGE);
