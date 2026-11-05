import PropTypes from "prop-types";
import styled from "styled-components";
import { Boton, Peligro } from "./Panel";

const TEXTOS = {
  aceptar: {
    titulo: "Aceptar el legajo",
    cuerpo:
      "Esto acepta el compliance y después crea la cuenta CVU contra BIND. La cuenta queda escrita en el banco y no se deshace desde acá.",
  },
  rechazar: {
    titulo: "Rechazar el legajo",
    cuerpo: "El cliente va a ver las observaciones que escribiste.",
  },
  bloquear: {
    titulo: "Bloquear el legajo",
    cuerpo:
      "El cliente deja de operar. Es reversible: se vuelve a aceptado con Desbloquear.",
  },
  desbloquear: {
    titulo: "Desbloquear el legajo",
    cuerpo: "El legajo vuelve a aceptado y el cliente puede operar.",
  },
  reiniciar: {
    titulo: "Reiniciar el legajo",
    cuerpo:
      "El legajo actual se da de baja y el sujeto queda libre para empezar uno nuevo. No se puede volver atrás.",
  },
  crearCuenta: {
    titulo: "Crear la cuenta CVU",
    cuerpo:
      "Esto le pega a BIND y la cuenta queda escrita en el banco. No se deshace desde acá.",
  },
  eliminarCuenta: {
    titulo: "Eliminar la cuenta CVU",
    cuerpo:
      "Esto ejecuta la baja del CVU en el banco. Es irreversible y la cuenta no se puede recuperar.",
  },
  reintentarAlta: {
    titulo: "Reintentar el alta en BIND",
    cuerpo:
      "Esto crea la cuenta CVU en el banco con el CUIT y el titular que cargaste. La cuenta queda escrita allá y no se deshace desde acá.",
  },
  informarCvu: {
    titulo: "Informar el CVU",
    cuerpo:
      "El CVU se valida contra BIND antes de guardarse. Si no es del titular, el backend lo rechaza.",
  },
};

const Fondo = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 33, 0.55);
  display: grid;
  place-items: center;
  z-index: 10;
`;

const Caja = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 22px;
  width: 420px;

  h2 {
    margin: 0 0 8px;
    font-size: 16px;
  }
  p {
    margin: 0 0 18px;
    font-size: 13px;
    color: #4b5563;
  }
`;

const Acciones = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Confirmacion = ({ accion, onCancelar, onConfirmar }) => {
  const texto = TEXTOS[accion] ?? {
    titulo: "Confirmar",
    cuerpo: "Esta acción no se puede deshacer desde acá.",
  };
  const destructiva = accion === "reiniciar" || accion === "eliminarCuenta";

  return (
    <Fondo role="dialog" aria-modal="true" aria-label={texto.titulo}>
      <Caja>
        <h2>{texto.titulo}</h2>
        <p>{texto.cuerpo}</p>
        <Acciones>
          <Boton type="button" onClick={onCancelar}>
            Cancelar
          </Boton>
          {destructiva ? (
            <Peligro type="button" onClick={onConfirmar}>
              Sí, continuar
            </Peligro>
          ) : (
            <Boton $primario type="button" onClick={onConfirmar}>
              Sí, continuar
            </Boton>
          )}
        </Acciones>
      </Caja>
    </Fondo>
  );
};

Confirmacion.propTypes = {
  accion: PropTypes.string.isRequired,
  onCancelar: PropTypes.func.isRequired,
  onConfirmar: PropTypes.func.isRequired,
};

export default Confirmacion;
