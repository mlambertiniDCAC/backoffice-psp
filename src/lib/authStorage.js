const TOKEN_KEY = "backoffice_psp_token";
const SUB_KEY = "backoffice_psp_sub";
const SCOPE_KEY = "backoffice_psp_scope";

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getSub: () => localStorage.getItem(SUB_KEY),
  setSub: (sub) =>
    sub ? localStorage.setItem(SUB_KEY, sub) : localStorage.removeItem(SUB_KEY),
  getScope: () => localStorage.getItem(SCOPE_KEY),
  setScope: (scope) =>
    scope
      ? localStorage.setItem(SCOPE_KEY, scope)
      : localStorage.removeItem(SCOPE_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SUB_KEY);
    localStorage.removeItem(SCOPE_KEY);
  },
};
