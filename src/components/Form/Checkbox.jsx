import styled, { useTheme } from "styled-components";
import PropTypes from "prop-types";
import { Typography } from "../Typography";

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  user-select: none;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  &:hover {
    background-color: ${({ theme, $disabled }) =>
      $disabled ? "transparent" : theme.colors.neutral[100]};
  }
`;

const StyledCheckbox = styled.span`
  display: inline-block;
  box-sizing: border-box;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  align-self: flex-start;
  background: ${({ checked, theme }) =>
    checked ? theme.colors.lightBlue[500] : "#fff"};
  border: 1px solid
    ${({ checked, theme }) =>
      checked ? theme.colors.lightBlue[500] : theme.colors.neutral[500]};
  border-radius: 4px;
  transition: all 150ms;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 7px;
    width: 4px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: ${({ checked }) => (checked ? 1 : 0)};
    transition: opacity 0.15s ease;
  }
`;

const StyledTypography = styled(Typography)`
  margin-bottom: 2px;
`;

export const Checkbox = ({
  label,
  checked,
  onChange,
  name,
  disabled = false,
}) => {
  const theme = useTheme();

  const handleClick = () => {
    if (disabled) return;
    onChange(name, !checked);
  };

  return (
    <CheckboxContainer
      $isChecked={checked}
      $disabled={disabled}
      onClick={handleClick}
    >
      <StyledCheckbox checked={checked} />
      {label && (
        <StyledTypography variant="small" color={theme.colors.neutral[500]}>
          {label}
        </StyledTypography>
      )}
    </CheckboxContainer>
  );
};

Checkbox.propTypes = {
  label: PropTypes.node,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};
