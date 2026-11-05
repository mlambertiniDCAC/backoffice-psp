import { useState } from "react";
import PropTypes from "prop-types";
import { Boton, Fila } from "components/Panel";

const AccionesAlta = ({
  cuenta,
  refExterna,
  onReintentarAlta,
  onSincronizarPermisos,
  onInformarCvu,
  onCorregirTitular,
}) => {
  const [cuit, setCuit] = useState(cuenta.cuit ?? "");
  const [titular, setTitular] = useState(cuenta.titular ?? "");
  const [cvu, setCvu] = useState("");

  const sinRef = !refExterna;
  const faltanDatos = !cuit || !titular;

  return (
    <>
      <Fila>
        <Boton
          $primario
          type="button"
          disabled={sinRef || faltanDatos}
          title={
            sinRef
              ? "Sin client_id no se puede reintentar"
              : faltanDatos
                ? "Completá CUIT y titular: el gateway no llama al banco sin ellos"
                : "Crea la cuenta en BIND con este CUIT y titular, y rehace vínculos y permisos"
          }
          onClick={() => onReintentarAlta(cuit, titular)}
        >
          Reintentar el alta
        </Boton>
        <Boton
          type="button"
          disabled={sinRef}
          title="Solo rehace vínculos y permisos. No toca el banco."
          onClick={onSincronizarPermisos}
        >
          Sincronizar permisos
        </Boton>
      </Fila>

      <Fila style={{ marginTop: 6 }}>
        <input
          aria-label={`CUIT de ${cuenta.cuentaIdExterno}`}
          placeholder="CUIT"
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
        />
        <input
          aria-label={`Titular de ${cuenta.cuentaIdExterno}`}
          placeholder="Titular (sin comas ni < >)"
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
        />
        <Boton
          type="button"
          disabled={faltanDatos}
          title="Guarda el CUIT y el titular en la cuenta, sin tocar el banco"
          onClick={() => onCorregirTitular(cuit, titular)}
        >
          Guardar datos
        </Boton>
      </Fila>

      <Fila style={{ marginTop: 6 }}>
        <input
          aria-label={`CVU para ${cuenta.cuentaIdExterno}`}
          placeholder="CVU de 22 dígitos"
          value={cvu}
          onChange={(e) => setCvu(e.target.value)}
        />
        <Boton
          type="button"
          disabled={!/^\d{22}$/.test(cvu)}
          title="Para cuando BIND ya creó el CVU y no quedó guardado acá"
          onClick={() => onInformarCvu(cvu)}
        >
          Informar CVU
        </Boton>
      </Fila>
    </>
  );
};

AccionesAlta.propTypes = {
  cuenta: PropTypes.shape({
    cuentaIdExterno: PropTypes.string.isRequired,
    cuit: PropTypes.string,
    titular: PropTypes.string,
  }).isRequired,
  refExterna: PropTypes.string,
  onReintentarAlta: PropTypes.func.isRequired,
  onSincronizarPermisos: PropTypes.func.isRequired,
  onInformarCvu: PropTypes.func.isRequired,
  onCorregirTitular: PropTypes.func.isRequired,
};

export default AccionesAlta;
