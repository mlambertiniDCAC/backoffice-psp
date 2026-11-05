import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "src/lib/api/compliance";
import { listarCuentas } from "src/lib/api/cuentas";
import {
  adaptarFilaLegajo,
  adaptarCuenta,
  cruzarLegajosConCuentas,
} from "src/lib/adaptadores";
import { getApiErrorMessage } from "src/lib/apiError";

const MENSAJE_PARCIAL = "permisos pendientes";

export const esAceptacionParcial = (error) => {
  const mensaje =
    error?.response?.data?.error?.message ??
    error?.response?.data?.message ??
    "";
  return String(mensaje).includes(MENSAJE_PARCIAL);
};

export const cargarBandeja = createAsyncThunk(
  "compliance/cargarBandeja",
  async ({ estado, pagina = 1 } = {}, { rejectWithValue }) => {
    try {
      const paginado = await api.listarCompliances({ estado, pagina });
      const filas = (paginado?.data ?? paginado ?? []).map(adaptarFilaLegajo);
      const cuentas = (await listarCuentas()).map(adaptarCuenta);
      return {
        filas: cruzarLegajosConCuentas(filas, cuentas),
        total: paginado?.total ?? filas.length,
        pagina,
        estado: estado ?? null,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const cargarDetalle = createAsyncThunk(
  "compliance/cargarDetalle",
  async (sujetoVerificadoId, { rejectWithValue }) => {
    try {
      const [detalle, personas] = await Promise.all([
        api.obtenerCompliance(sujetoVerificadoId),
        api.listarPersonas(sujetoVerificadoId).catch(() => []),
      ]);
      return { detalle, personas };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const revisarDocumento = createAsyncThunk(
  "compliance/revisarDocumento",
  async (
    { sujetoVerificadoId, documentoId, estado, motivo },
    { rejectWithValue }
  ) => {
    try {
      await api.revisarDocumento(
        sujetoVerificadoId,
        documentoId,
        estado,
        motivo
      );
      return { documentoId, estado };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const aceptar = createAsyncThunk(
  "compliance/aceptar",
  async ({ refExterna, cuit, name }, { rejectWithValue }) => {
    try {
      const resultado = await api.aceptarCompliance(refExterna, cuit, name);
      return { estado: "aceptado", ...resultado };
    } catch (error) {
      if (esAceptacionParcial(error)) {
        return { estado: "permisos_pendientes", refExterna };
      }
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const rechazar = createAsyncThunk(
  "compliance/rechazar",
  async ({ sujetoVerificadoId, observaciones }, { rejectWithValue }) => {
    try {
      return await api.rechazarCompliance(sujetoVerificadoId, observaciones);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const bloquear = createAsyncThunk(
  "compliance/bloquear",
  async ({ refExterna, motivo }, { rejectWithValue }) => {
    try {
      return await api.bloquearCompliance(refExterna, motivo);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const desbloquear = createAsyncThunk(
  "compliance/desbloquear",
  async ({ refExterna }, { rejectWithValue }) => {
    try {
      return await api.desbloquearCompliance(refExterna);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const reiniciar = createAsyncThunk(
  "compliance/reiniciar",
  async ({ sujetoVerificadoId }, { rejectWithValue }) => {
    try {
      return await api.reiniciarCompliance(sujetoVerificadoId);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

const complianceSlice = createSlice({
  name: "compliance",
  initialState: {
    filas: [],
    total: 0,
    pagina: 1,
    estado: null,
    cargando: false,
    error: null,
    detalle: null,
    personas: [],
    cargandoDetalle: false,
    resultadoAccion: null,
  },
  reducers: {
    limpiarResultado: (state) => {
      state.resultadoAccion = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarBandeja.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarBandeja.fulfilled, (state, action) => {
        state.cargando = false;
        state.filas = action.payload.filas;
        state.total = action.payload.total;
        state.pagina = action.payload.pagina;
        state.estado = action.payload.estado;
      })
      .addCase(cargarBandeja.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      .addCase(cargarDetalle.pending, (state) => {
        state.cargandoDetalle = true;
        state.error = null;
        state.detalle = null;
      })
      .addCase(cargarDetalle.fulfilled, (state, action) => {
        state.cargandoDetalle = false;
        state.detalle = action.payload.detalle;
        state.personas = action.payload.personas ?? [];
      })
      .addCase(cargarDetalle.rejected, (state, action) => {
        state.cargandoDetalle = false;
        state.error = action.payload;
      })
      .addCase(aceptar.fulfilled, (state, action) => {
        state.resultadoAccion = action.payload;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("compliance/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.error = action.payload ?? state.error;
        }
      );
  },
});

export const { limpiarResultado } = complianceSlice.actions;
export default complianceSlice.reducer;
