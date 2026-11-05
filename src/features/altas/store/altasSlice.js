import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as cuentasApi from "src/lib/api/cuentas";
import { sincronizarPermisos, listarCompliances } from "src/lib/api/compliance";
import {
  adaptarCuenta,
  estaTrabada,
  adaptarFilaLegajo,
  refExternaDe,
} from "src/lib/adaptadores";
import { getApiErrorMessage } from "src/lib/apiError";

export const cargarTrabadas = createAsyncThunk(
  "altas/cargarTrabadas",
  async (_, { rejectWithValue }) => {
    try {
      const cuentas = (await cuentasApi.listarCuentas()).map(adaptarCuenta);
      const trabadas = cuentas.filter(estaTrabada);
      const legajos = [];
      for (const estado of ["en_revision", "aceptado", "aceptado_sin_firma"]) {
        const paginado = await listarCompliances({ estado }).catch(() => null);
        const filas = (paginado?.data ?? paginado ?? []).map(adaptarFilaLegajo);
        legajos.push(...filas);
      }
      const porSujeto = new Map(
        legajos.map((l) => [Number(l.sujetoVerificadoId), l])
      );
      return trabadas.map((c) => ({
        ...c,
        legajo: porSujeto.get(Number(c.sujetoVerificadoId)) ?? null,
        refExterna: refExternaDe(c),
      }));
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const sincronizar = createAsyncThunk(
  "altas/sincronizar",
  async ({ refExterna, cuentaIdExterno }, { rejectWithValue, dispatch }) => {
    try {
      const resultado = await sincronizarPermisos(refExterna);
      dispatch(cargarTrabadas());
      return resultado;
    } catch (error) {
      return rejectWithValue({
        cuentaIdExterno,
        mensaje: getApiErrorMessage(error),
        status: error?.response?.status ?? null,
      });
    }
  }
);

export const informarCvu = createAsyncThunk(
  "altas/informarCvu",
  async ({ cuentaIdExterno, cvu }, { rejectWithValue, dispatch }) => {
    try {
      const resultado = await cuentasApi.informarCvu(cuentaIdExterno, cvu);
      dispatch(cargarTrabadas());
      return resultado;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const corregirTitular = createAsyncThunk(
  "altas/corregirTitular",
  async ({ cuentaIdExterno, cuit, name }, { rejectWithValue, dispatch }) => {
    try {
      const resultado = await cuentasApi.corregirTitular(
        cuentaIdExterno,
        cuit,
        name
      );
      dispatch(cargarTrabadas());
      return resultado;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

const altasSlice = createSlice({
  name: "altas",
  initialState: {
    trabadas: [],
    cargando: false,
    error: null,
    ultimoResultado: null,
    fallosPorCuenta: {},
  },
  reducers: {
    limpiar: (state) => {
      state.error = null;
      state.ultimoResultado = null;
    },
    limpiarFallo: (state, action) => {
      delete state.fallosPorCuenta[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarTrabadas.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarTrabadas.fulfilled, (state, action) => {
        state.cargando = false;
        state.trabadas = action.payload;
      })
      .addCase(cargarTrabadas.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      .addMatcher(
        (a) => a.type.startsWith("altas/") && a.type.endsWith("/rejected"),
        (state, action) => {
          const p = action.payload;
          if (p && typeof p === "object" && p.cuentaIdExterno) {
            state.fallosPorCuenta[p.cuentaIdExterno] = p;
            state.error = p.mensaje;
          } else {
            state.error = p ?? state.error;
          }
        }
      )
      .addMatcher(
        (a) =>
          a.type.startsWith("altas/") &&
          a.type.endsWith("/fulfilled") &&
          a.type !== cargarTrabadas.fulfilled.type,
        (state) => {
          state.ultimoResultado = "ok";
        }
      );
  },
});

export const { limpiar, limpiarFallo } = altasSlice.actions;
export default altasSlice.reducer;
