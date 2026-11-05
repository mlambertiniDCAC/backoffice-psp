import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "src/lib/api/cuentas";
import { sincronizarPermisos } from "src/lib/api/compliance";
import { getApiErrorMessage } from "src/lib/apiError";

export const cargarVinculos = createAsyncThunk(
  "usuarios/cargarVinculos",
  async (cuentaIdExterno, { rejectWithValue }) => {
    try {
      return await api.listarUsuariosDeCuenta(cuentaIdExterno);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const revocar = createAsyncThunk(
  "usuarios/revocar",
  async ({ cuentaIdExterno, usuarioId }, { rejectWithValue, dispatch }) => {
    try {
      const r = await api.revocarUsuario(cuentaIdExterno, usuarioId);
      dispatch(cargarVinculos(cuentaIdExterno));
      return r;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const resincronizar = createAsyncThunk(
  "usuarios/resincronizar",
  async ({ refExterna, cuentaIdExterno }, { rejectWithValue, dispatch }) => {
    try {
      const r = await sincronizarPermisos(refExterna);
      if (cuentaIdExterno) dispatch(cargarVinculos(cuentaIdExterno));
      return r;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const cargarPermisosView = createAsyncThunk(
  "usuarios/cargarPermisosView",
  async (sujetoId, { rejectWithValue }) => {
    try {
      return await api.obtenerPermisosView(sujetoId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

const usuariosSlice = createSlice({
  name: "usuarios",
  initialState: { vinculos: [], permisos: {}, cargando: false, error: null },
  reducers: {
    limpiarError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarVinculos.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarVinculos.fulfilled, (state, action) => {
        state.cargando = false;
        state.vinculos = action.payload ?? [];
      })
      .addCase(cargarPermisosView.fulfilled, (state, action) => {
        state.permisos = action.payload ?? {};
      })
      .addMatcher(
        (a) => a.type.startsWith("usuarios/") && a.type.endsWith("/rejected"),
        (state, action) => {
          state.cargando = false;
          state.error = action.payload ?? state.error;
        }
      );
  },
});

export const { limpiarError } = usuariosSlice.actions;
export default usuariosSlice.reducer;
