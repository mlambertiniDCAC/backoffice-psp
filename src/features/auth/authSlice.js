import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authStorage } from "src/lib/authStorage";
import { loginAdmin, cerrarSesion } from "src/lib/api/auth";
import { getApiErrorMessage } from "src/lib/apiError";

export const login = createAsyncThunk(
  "auth/login",
  async ({ mail, password }, { rejectWithValue }) => {
    try {
      const sesion = await loginAdmin(mail, password);
      return sesion;
    } catch (error) {
      if (error?.response?.status === 429) {
        return rejectWithValue(
          "Demasiados intentos de login en este ambiente. El límite es global, esperá un minuto."
        );
      }
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await cerrarSesion();
  } finally {
    authStorage.clear();
  }
});

const estadoInicial = {
  token: authStorage.getToken(),
  cargando: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: estadoInicial,
  reducers: {
    limpiarError: (state) => {
      state.error = null;
    },
    sesionVencida: (state) => {
      authStorage.clear();
      state.token = null;
      state.error = "La sesión venció. Volvé a entrar.";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const token = action.payload?.token ?? null;
        state.cargando = false;
        state.token = token;
        if (token) authStorage.setToken(token);
      })
      .addCase(login.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload ?? "No se pudo iniciar sesión.";
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.error = null;
      });
  },
});

export const { limpiarError, sesionVencida } = authSlice.actions;

export const selectAutenticado = (state) => Boolean(state.auth.token);

export default authSlice.reducer;
