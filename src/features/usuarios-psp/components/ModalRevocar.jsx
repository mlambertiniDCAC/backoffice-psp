import { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Modal from "components/Modal/Modal";
import { Boton, Peligro } from "components/Panel";

const LARGO_MAXIMO_MOTIVO = 500;

const Cuerpo = styled.div`
  padding: 0 28px 24px;
  width: 420px;
  font-size: 13px;
  color: #4b5563;

  p {
    margin: 0 0 14px;
  }

  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: #1f2430;
  }
`;

const Motivo = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;
  border: 1px solid #cbd2e0;
  border-radius: 6px;
  font: inherit;
  resize: vertical;
  box-sizing: border-box;
`;

const Acciones = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 18px;
`;

const ModalRevocar = ({ mail, revocando, onCancelar, onConfirmar }) => {
  const [motivo, setMotivo] = useState("");
  const sinMotivo = motivo.trim().length === 0;

  return (
    <Modal
      open
      onClose={onCancelar}
      title="Revocar la identidad"
      minWidth="420px"
    >
      <Cuerpo>
        <p>
          Vas a revocar la identidad de <strong>{mail}</strong>. Desde la
          llamada siguiente deja de operar, aunque no cierre sesión.
        </p>
        <p>
          Una identidad revocada no se vuelve a encender desde acá: si fue un
          error, la persona tiene que validarse de nuevo.
        </p>
        <label htmlFor="motivo-revocacion">Motivo de la revocación</label>
        <Motivo
          id="motivo-revocacion"
          aria-label="Motivo de la revocación"
          maxLength={LARGO_MAXIMO_MOTIVO}
          placeholder="Por qué se revoca. Es lo único que va a quedar escrito."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <Acciones>
          <Boton type="button" onClick={onCancelar}>
            Cancelar
          </Boton>
          <Peligro
            type="button"
            disabled={sinMotivo || revocando}
            onClick={() => onConfirmar(motivo)}
          >
            Sí, revocar
          </Peligro>
        </Acciones>
      </Cuerpo>
    </Modal>
  );
};

ModalRevocar.propTypes = {
  mail: PropTypes.string,
  revocando: PropTypes.bool,
  onCancelar: PropTypes.func.isRequired,
  onConfirmar: PropTypes.func.isRequired,
};

export default ModalRevocar;
