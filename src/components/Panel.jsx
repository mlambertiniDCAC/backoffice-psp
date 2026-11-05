import styled from "styled-components";

export const Titulo = styled.h1`
  font-size: 20px;
  margin: 0 0 4px;
`;

export const Bajada = styled.p`
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 13px;
`;

export const Panel = styled.section`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 18px;
`;

export const Fila = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

export const Tabla = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid #eef0f4;
    vertical-align: top;
  }

  th {
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.03em;
  }
`;

export const Boton = styled.button`
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid #cbd2e0;
  background: ${(p) => (p.$primario ? "#3b5bdb" : "#fff")};
  color: ${(p) => (p.$primario ? "#fff" : "#1f2430")};
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export const Peligro = styled(Boton)`
  border-color: #f0a6a6;
  color: #c92a2a;
`;

export const Chip = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: #eef1f8;
  color: #3b4252;
`;

export const Aviso = styled.p`
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  background: ${(p) => (p.$tono === "error" ? "#fff0f0" : "#fff9e6")};
  color: ${(p) => (p.$tono === "error" ? "#c92a2a" : "#8a6d00")};
`;
