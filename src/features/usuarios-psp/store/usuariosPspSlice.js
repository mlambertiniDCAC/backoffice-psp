import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "src/lib/api/usuarios";
import {
  AVISO_BUSQUEDA_CORTA,
  MINIMO_TEXTO_BUSQUEDA,
  adaptarConsultaProveedor,
  adaptarUsuarioPsp,
} from "src/lib/identidad";
import { getApiErrorMessage } from "src/lib/apiError";

export const TAMANIO_PAGINA = api.CANTIDAD_POR_DEFECTO;

export const cargarUsuarios = createAsyncThunk(
  "usuariosPsp/cargar",
  async ({ texto = "", desde = 0 } = {}, { rejectWithValue }) => {
    const buscado = String(texto ?? "").trim();
    if (buscado && buscado.length < MINIMO_TEXTO_BUSQUEDA) {
      return rejectWithValue(AVISO_BUSQUEDA_CORTA);
    }
    try {
      const pagina = await api.listarUsuarios({
        texto: buscado || undefined,
        desde,
        cantidad: TAMANIO_PAGINA,
      });
      const filas = pagina?.usuarios ?? [];
      return {
        lista: filas.map(adaptarUsuarioPsp),
        total: pagina?.total ?? filas.length,
        desde: pagina?.desde ?? desde,
        cantidad: pagina?.cantidad ?? TAMANIO_PAGINA,
        texto: buscado,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const cargarUsuario = createAsyncThunk(
  "usuariosPsp/cargarUno",
  async (usuarioSub, { rejectWithValue }) => {
    try {
      return adaptarUsuarioPsp(await api.obtenerUsuario(usuarioSub));
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const consultarProveedor = createAsyncThunk(
  "usuariosPsp/consultarProveedor",
  async ({ validacionId }, { rejectWithValue }) => {
    try {
      return adaptarConsultaProveedor(
        await api.consultarIdentidadEnProveedor(validacionId, {
          imagenes: false,
        })
      );
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

export const traerImagenesDelProveedor = createAsyncThunk(
  "usuariosPsp/traerImagenesDelProveedor",
  async ({ validacionId }, { rejectWithValue }) => {
    try {
      return adaptarConsultaProveedor(
        await api.consultarIdentidadEnProveedor(validacionId, {
          imagenes: true,
        })
      );
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  }
);

const proveedorVacio = () => ({
  cargando: false,
  cargandoImagenes: false,
  error: null,
  datos: null,
  imagenes: null,
});

const usuariosPspSlice = createSlice({
  name: "usuariosPsp",
  initialState: {
    lista: [],
    total: 0,
    desde: 0,
    cantidad: TAMANIO_PAGINA,
    texto: "",
    cargando: false,
    error: null,
    usuario: null,
    cargandoUsuario: false,
    proveedor: proveedorVacio(),
  },
  reducers: {
    limpiarError: (state) => {
      state.error = null;
    },
    limpiarProveedor: (state) => {
      state.proveedor = proveedorVacio();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarUsuarios.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarUsuarios.fulfilled, (state, action) => {
        state.cargando = false;
        state.lista = action.payload.lista;
        state.total = action.payload.total;
        state.desde = action.payload.desde;
        state.cantidad = action.payload.cantidad;
        state.texto = action.payload.texto;
      })
      .addCase(cargarUsuario.pending, (state) => {
        state.cargandoUsuario = true;
        state.error = null;
        state.usuario = null;
        state.proveedor = proveedorVacio();
      })
      .addCase(cargarUsuario.fulfilled, (state, action) => {
        state.cargandoUsuario = false;
        state.usuario = action.payload;
      })
      .addCase(cargarUsuarios.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload ?? state.error;
      })
      .addCase(cargarUsuario.rejected, (state, action) => {
        state.cargandoUsuario = false;
        state.error = action.payload ?? state.error;
      })
      .addCase(consultarProveedor.pending, (state) => {
        state.proveedor.cargando = true;
        state.proveedor.error = null;
      })
      .addCase(consultarProveedor.fulfilled, (state, action) => {
        state.proveedor.cargando = false;
        state.proveedor.datos = action.payload;
        state.proveedor.imagenes = null;
      })
      .addCase(consultarProveedor.rejected, (state, action) => {
        state.proveedor.cargando = false;
        state.proveedor.error = action.payload ?? null;
      })
      .addCase(traerImagenesDelProveedor.pending, (state) => {
        state.proveedor.cargandoImagenes = true;
        state.proveedor.error = null;
      })
      .addCase(traerImagenesDelProveedor.fulfilled, (state, action) => {
        state.proveedor.cargandoImagenes = false;
        state.proveedor.datos = action.payload;
        state.proveedor.imagenes = action.payload?.imagenes ?? null;
      })
      .addCase(traerImagenesDelProveedor.rejected, (state, action) => {
        state.proveedor.cargandoImagenes = false;
        state.proveedor.error = action.payload ?? null;
      });
  },
});

export const { limpiarError, limpiarProveedor } = usuariosPspSlice.actions;

const tamanioDe = (estado) => estado?.cantidad || TAMANIO_PAGINA;

export const selectTotalPaginas = (state) =>
  Math.max(
    1,
    Math.ceil((state.usuariosPsp.total ?? 0) / tamanioDe(state.usuariosPsp))
  );

export const selectPagina = (state) =>
  Math.floor((state.usuariosPsp.desde ?? 0) / tamanioDe(state.usuariosPsp)) + 1;

export default usuariosPspSlice.reducer;
