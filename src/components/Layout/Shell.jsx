import PropTypes from "prop-types";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "src/features/auth/authSlice";

const SECCIONES = [
  { to: "/compliance", label: "Compliance" },
  { to: "/altas", label: "Altas trabadas" },
  { to: "/cuentas", label: "Cuentas" },
  { to: "/usuarios", label: "Usuarios y permisos" },
];

const Marco = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  font-family: "Inter", system-ui, sans-serif;
`;

const Lateral = styled.nav`
  background: #1f2430;
  color: #e6e8ee;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
`;

const Marca = styled.div`
  padding: 0 20px 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
  span {
    display: block;
    font-weight: 400;
    font-size: 11px;
    color: #8b93a7;
    text-transform: uppercase;
    margin-top: 4px;
  }
`;

const Link = styled(NavLink)`
  padding: 10px 20px;
  color: #c3c9d8;
  text-decoration: none;
  font-size: 14px;
  border-left: 3px solid transparent;

  &.active {
    color: #fff;
    background: #2a3140;
    border-left-color: #6c8cff;
  }
`;

const Salir = styled.button`
  margin: auto 20px 0;
  background: none;
  border: 1px solid #3c4457;
  color: #c3c9d8;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  font-size: 13px;
`;

const Contenido = styled.main`
  background: #f5f6f9;
  padding: 24px 28px;
  overflow-x: auto;
`;

const Shell = ({ children }) => {
  const dispatch = useDispatch();
  return (
    <Marco>
      <Lateral>
        <Marca>
          Backoffice PSP
          <span>Herramienta interna</span>
        </Marca>
        {SECCIONES.map((s) => (
          <Link key={s.to} to={s.to}>
            {s.label}
          </Link>
        ))}
        <Salir type="button" onClick={() => dispatch(logout())}>
          Salir
        </Salir>
      </Lateral>
      <Contenido>{children}</Contenido>
    </Marco>
  );
};

Shell.propTypes = {
  children: PropTypes.node,
};

export default Shell;
