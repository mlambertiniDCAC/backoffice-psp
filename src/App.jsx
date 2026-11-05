import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "components/Layout/Shell";
import LoginPage from "./features/auth/LoginPage";
import { selectAutenticado } from "./features/auth/authSlice";
import BandejaCompliance from "./features/compliance/pages/BandejaCompliance";
import DetalleLegajo from "./features/compliance/pages/DetalleLegajo";
import AltasTrabadas from "./features/altas/pages/AltasTrabadas";
import ListadoCuentas from "./features/cuentas/pages/ListadoCuentas";
import DetalleCuenta from "./features/cuentas/pages/DetalleCuenta";
import UsuariosYPermisos from "./features/usuarios/pages/UsuariosYPermisos";

const App = () => {
  const autenticado = useSelector(selectAutenticado);

  if (!autenticado) return <LoginPage />;

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Navigate to="/compliance" replace />} />
        <Route path="/compliance" element={<BandejaCompliance />} />
        <Route
          path="/compliance/:sujetoVerificadoId"
          element={<DetalleLegajo />}
        />
        <Route path="/altas" element={<AltasTrabadas />} />
        <Route path="/cuentas" element={<ListadoCuentas />} />
        <Route path="/cuentas/:cuentaIdExterno" element={<DetalleCuenta />} />
        <Route path="/usuarios" element={<UsuariosYPermisos />} />
        <Route path="*" element={<Navigate to="/compliance" replace />} />
      </Routes>
    </Shell>
  );
};

export default App;
