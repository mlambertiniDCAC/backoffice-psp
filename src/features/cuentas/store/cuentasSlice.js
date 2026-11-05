import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "src/lib/api/cuentas";
import { adaptarCuenta } from "src/lib/adaptadores";
import { getApiErrorMessage } from "src/lib/apiError";

export const cargarCuentas = createAsyncThunk(
  "cuentas/cargar",
  async (filtros = {}, { rejectWithValue }) => {
    try {
      return (await api.listarCuentas(filtros)).map(adaptarCuenta);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const cargarCuenta = createAsyncThunk(
  "cuentas/cargarUna",
  async (cuentaIdExterno, { rejectWithValue }) => {
    try {
      const [cuenta, movimientos] = await Promise.all([
        api.obtenerCuenta(cuentaIdExterno),
        Promise.resolve([]),
      ]);
      return { cuenta: adaptarCuenta(cuenta), movimientos };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const corregir = createAsyncThunk(
  "cuentas/corregir",
  async (
    { cuentaIdExterno, cambiosCuenta, cambiosSnapshot, alias },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const r = await api.corregirCuenta(cuentaIdExterno, {
        cambiosCuenta,
        cambiosSnapshot,
        alias,
      });
      dispatch(cargarCuenta(cuentaIdExterno));
      return r;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const eliminar = createAsyncThunk(
  "cuentas/eliminar",
  async ({ cuentaIdExterno }, { rejectWithValue, dispatch }) => {
    try {
      await api.eliminarCuenta(cuentaIdExterno);
      dispatch(cargarCuentas());
      return cuentaIdExterno;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

const PAGINA = 25;

const cuentasSlice = createSlice({
  name: "cuentas",
  initialState: {
    lista: [],
    pagina: 1,
    cargando: false,
    error: null,
    cuenta: null,
    movimientos: [],
  },
  reducers: {
    irAPagina: (state, action) => {
      state.pagina = action.payload;
    },
    limpiarError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarCuentas.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarCuentas.fulfilled, (state, action) => {
        state.cargando = false;
        state.lista = action.payload;
        state.pagina = 1;
      })
      .addCase(cargarCuenta.fulfilled, (state, action) => {
        state.cuenta = action.payload.cuenta;
        state.movimientos = action.payload.movimientos;
      })
      .addMatcher(
        (a) => a.type.startsWith("cuentas/") && a.type.endsWith("/rejected"),
        (state, action) => {
          state.cargando = false;
          state.error = action.payload ?? state.error;
        }
      );
  },
});

export const { irAPagina, limpiarError } = cuentasSlice.actions;
export const TAMANIO_PAGINA = PAGINA;
export const selectPagina = (state) => {
  const desde = (state.cuentas.pagina - 1) * PAGINA;
  return state.cuentas.lista.slice(desde, desde + PAGINA);
};
export const selectTotalPaginas = (state) =>
  Math.max(1, Math.ceil(state.cuentas.lista.length / PAGINA));
export default cuentasSlice.reducer;
