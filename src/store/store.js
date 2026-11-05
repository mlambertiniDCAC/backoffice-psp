import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer, { login, logout } from "../features/auth/authSlice";
import complianceReducer from "../features/compliance/store/complianceSlice";
import altasReducer from "../features/altas/store/altasSlice";
import cuentasReducer from "../features/cuentas/store/cuentasSlice";
import usuariosReducer from "../features/usuarios/store/usuariosSlice";

const appReducer = combineReducers({
  auth: authReducer,
  compliance: complianceReducer,
  altas: altasReducer,
  cuentas: cuentasReducer,
  usuarios: usuariosReducer,
});

export const rootReducer = (state, action) => {
  const reset =
    action.type === logout.fulfilled.type ||
    action.type === login.fulfilled.type;
  return appReducer(reset ? { auth: state?.auth } : state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
