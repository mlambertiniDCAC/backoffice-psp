import PropTypes from "prop-types";
import styled from "styled-components";
import { InfoSVG3 } from "src/assets/SVGLibrarie";
import { Typography } from "../Typography";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  align-self: stretch;

  &.danger {
    border: 1px solid ${({ theme }) => theme.colors.red[200]};
    background: ${({ theme }) => theme.colors.red[50]};
    color: ${({ theme }) => theme.colors.red[900]};
    svg {
      color: ${({ theme }) => theme.colors.red[700]};
    }
  }
  &.warning {
    border: 1px solid ${({ theme }) => theme.colors.yellow[200]};
    background: ${({ theme }) => theme.colors.yellow[50]};
    color: ${({ theme }) => theme.colors.yellow[900]};
    svg {
      color: ${({ theme }) => theme.colors.yellow[700]};
    }
  }
  &.info {
    border: 1px solid ${({ theme }) => theme.colors.lightBlue[100]};
    background: ${({ theme }) => theme.colors.lightBlue[50]};
    color: ${({ theme }) => theme.colors.lightBlue[900]};
    svg {
      color: ${({ theme }) => theme.colors.lightBlue[500]};
    }
  }
  &.success {
    border: 1px solid ${({ theme }) => theme.colors.green[200]};
    background: ${({ theme }) => theme.colors.green[50]};
    color: ${({ theme }) => theme.colors.green[900]};
    svg {
      color: ${({ theme }) => theme.colors.green[700]};
    }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

/**
 * InfoMessage — mensaje informativo de una sola línea.
 * Misma paleta de variantes que `Alert`, sin título ni lista.
 *
 * @param {Object} props
 * @param {string} props.message - Texto a mostrar.
 * @param {"danger" | "warning" | "info" | "success"} [props.variant="info"]
 * @param {React.ReactNode} [props.icon] - Icono opcional para reemplazar el default.
 */
export const InfoMessage = ({
  message,
  variant = "info",
  icon,
  iconColor = "currentColor",
}) => {
  return (
    <Container className={variant}>
      <IconWrapper>{icon ?? <InfoSVG3 fill={iconColor} />}</IconWrapper>
      <Typography variant="tiny" fontWeight="bold" fontStyle="italic">
        {message}
      </Typography>
    </Container>
  );
};

InfoMessage.propTypes = {
  message: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["danger", "warning", "info", "success"]),
  icon: PropTypes.node,
  iconColor: PropTypes.string,
};

export default InfoMessage;
