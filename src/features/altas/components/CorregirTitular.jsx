import { useState } from "react";
import PropTypes from "prop-types";
import { Boton, Fila } from "components/Panel";

const CorregirTitular = ({ cuenta, onGuardar }) => {
  const [cuit, setCuit] = useState(cuenta.cuit ?? "");
  const [name, setName] = useState(cuenta.titular ?? "");
  const sinCambios =
    cuit === (cuenta.cuit ?? "") && name === (cuenta.titular ?? "");

  return (
    <Fila style={{ marginTop: 6 }}>
      <input
        aria-label={`CUIT de ${cuenta.cuentaIdExterno}`}
        value={cuit}
        onChange={(e) => setCuit(e.target.value)}
      />
      <input
        aria-label={`Titular de ${cuenta.cuentaIdExterno}`}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Boton
        type="button"
        disabled={sinCambios || !cuit || !name}
        onClick={() => onGuardar(cuit, name)}
      >
        Corregir titular
      </Boton>
    </Fila>
  );
};

CorregirTitular.propTypes = {
  cuenta: PropTypes.shape({
    cuentaIdExterno: PropTypes.string.isRequired,
    cuit: PropTypes.string,
    titular: PropTypes.string,
  }).isRequired,
  onGuardar: PropTypes.func.isRequired,
};

export default CorregirTitular;
