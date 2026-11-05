import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { Typography } from "../Typography";

export const FormSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 40 }) => $gap}px;
  width: 100%;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap}px;
  width: 100%;
`;

/**
 * FormSection — bloque de formulario con título y contenido.
 *
 * @param {Object} props
 * @param {string} props.title - Etiqueta de la sección.
 * @param {React.ReactNode} props.children - Campos o controles del bloque.
 * @param {number} [props.gap=16] - Espacio entre título y contenido.
 */
export const FormSection = ({ title, children, gap = 16, titleColor }) => {
  const theme = useTheme();

  return (
    <Section $gap={gap}>
      <Typography
        variant="small"
        fontWeight="bold"
        color={titleColor ?? theme.colors.neutral[700]}
      >
        {title}
      </Typography>
      {children}
    </Section>
  );
};

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  gap: PropTypes.number,
  titleColor: PropTypes.string,
};

export default FormSection;
