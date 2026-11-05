import styled from "styled-components";
import PropTypes from "prop-types";
import { INPUT_SWITCH_VARIANT } from "./constants";

const TOGGLE_TRACK_WIDTH = 40;
const TOGGLE_TRACK_HEIGHT = 24;
const TOGGLE_THUMB_SIZE = 20;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  height: 42px;
`;

const SwitchButton = styled.button`
  height: 100%;
  width: 105px;
  padding: 8px 16px;
  border: none;
  background-color: ${(props) =>
    props.selected
      ? props.theme.colors.lightBlue[500]
      : props.theme.colors.neutral[0]};
  color: ${(props) =>
    props.selected
      ? props.theme.colors.neutral[0]
      : props.theme.colors.neutral[500]};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background-color: ${(props) =>
      props.selected
        ? props.theme.colors.primary[600]
        : props.theme.colors.neutral[100]};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:first-child {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }

  &:last-child {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;

const ToggleTrack = styled.button`
  display: flex;
  align-items: center;
  justify-content: ${({ $checked }) => ($checked ? "flex-end" : "flex-start")};
  width: ${TOGGLE_TRACK_WIDTH}px;
  height: ${TOGGLE_TRACK_HEIGHT}px;
  padding: 2px;
  box-sizing: border-box;
  border: none;
  border-radius: ${TOGGLE_TRACK_HEIGHT}px;
  cursor: pointer;
  background-color: ${({ $checked, theme }) =>
    $checked ? theme.colors.lightBlue[500] : theme.colors.neutral[300]};
  transition: background-color 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ToggleThumb = styled.span`
  width: ${TOGGLE_THUMB_SIZE}px;
  height: ${TOGGLE_THUMB_SIZE}px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.neutral[0]};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
`;

const InputSwitch = ({
  options = [],
  value,
  onChange,
  name,
  label,
  disabled = false,
  variant = INPUT_SWITCH_VARIANT.SEGMENTED,
}) => {
  const handleChange = (newValue) => {
    if (!disabled && onChange) {
      onChange(name, newValue);
    }
  };

  if (variant === INPUT_SWITCH_VARIANT.TOGGLE) {
    const isChecked = Boolean(value);

    return (
      <ToggleTrack
        type="button"
        role="switch"
        id={name}
        aria-checked={isChecked}
        aria-label={label || name}
        disabled={disabled}
        $checked={isChecked}
        onClick={() => handleChange(!isChecked)}
      >
        <ToggleThumb />
      </ToggleTrack>
    );
  }

  return (
    <SwitchContainer name={name} id={name}>
      {options.map((option, index) => (
        <SwitchButton
          key={index}
          type="button"
          selected={value === option.value}
          onClick={() => handleChange(option.value)}
          disabled={disabled}
        >
          {option.label}
        </SwitchButton>
      ))}
    </SwitchContainer>
  );
};

InputSwitch.propTypes = {
  /** Requerido en la variante `segmented`; se ignora en `toggle`. */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
      ]).isRequired,
    })
  ),
  /** Booleano en la variante `toggle`. */
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  /** Texto accesible de la variante `toggle` (por defecto usa `name`). */
  label: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(Object.values(INPUT_SWITCH_VARIANT)),
};

export default InputSwitch;
