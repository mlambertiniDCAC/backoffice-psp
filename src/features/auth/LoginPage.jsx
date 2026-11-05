import { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./authSlice";

const Centro = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #1f2430;
  font-family: "Inter", system-ui, sans-serif;
`;

const Caja = styled.form`
  background: #fff;
  padding: 28px;
  border-radius: 10px;
  width: 340px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Titulo = styled.h1`
  margin: 0;
  font-size: 18px;
  small {
    display: block;
    font-weight: 400;
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }
`;

const Campo = styled.input`
  padding: 10px;
  border: 1px solid #d3d7e0;
  border-radius: 6px;
  font-size: 14px;
`;

const Boton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #3b5bdb;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  &:disabled {
    background: #9aa8d8;
    cursor: default;
  }
`;

const Error = styled.p`
  margin: 0;
  color: #c92a2a;
  font-size: 13px;
`;

const LoginPage = () => {
  const dispatch = useDispatch();
  const { cargando, error } = useSelector((s) => s.auth);
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const enviar = (e) => {
    e.preventDefault();
    dispatch(login({ mail, password }));
  };

  return (
    <Centro>
      <Caja onSubmit={enviar}>
        <Titulo>
          Backoffice PSP
          <small>Requiere un usuario con rol admin del realm psp</small>
        </Titulo>
        <label htmlFor="mail">Mail</label>
        <Campo
          id="mail"
          type="email"
          autoComplete="username"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
        />
        <label htmlFor="password">Contraseña</label>
        <Campo
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <Error role="alert">{error}</Error> : null}
        <Boton type="submit" disabled={cargando || !mail || !password}>
          {cargando ? "Entrando…" : "Entrar"}
        </Boton>
      </Caja>
    </Centro>
  );
};

export default LoginPage;
