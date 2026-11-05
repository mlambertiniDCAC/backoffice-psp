import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { registrarSesionVencida } from "./lib/axiosInstance";
import { sesionVencida } from "./features/auth/authSlice";
import App from "./App.jsx";
import "./index.css";

registrarSesionVencida(() => store.dispatch(sesionVencida()));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
