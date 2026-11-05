import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  border: ${(props) => props.size / 8}px solid
    ${({ theme, $backgroundColor }) =>
      $backgroundColor || theme.colors.neutral[100]};
  border-top: ${(props) => props.size / 8}px solid
    ${({ theme, $color }) => $color || theme.colors.blue[500]};
  border-radius: 50%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  animation: ${spin} 2s linear infinite;
`;

export const Spinner = ({ size, color, backgroundColor }) => {
  return (
    <SpinnerContainer
      size={size}
      $color={color}
      $backgroundColor={backgroundColor}
    />
  );
};

Spinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  backgroundColor: PropTypes.string,
};
