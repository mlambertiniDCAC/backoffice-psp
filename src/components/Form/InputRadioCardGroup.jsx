import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { Typography } from "../Typography";

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const OptionCard = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  height: 65px;
  padding: 16px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.neutral[0]};
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.lightBlue[500] : theme.colors.neutral[200]};
  cursor: pointer;
  text-align: left;
  outline: none;
  transition: border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme, $selected }) =>
      $selected ? theme.colors.lightBlue[500] : theme.colors.neutral[300]};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const OptionTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RadioCircle = styled.span`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.lightBlue[500] : theme.colors.neutral[300]};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.neutral[0]};

  &::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.lightBlue[500]};
    opacity: ${({ $selected }) => ($selected ? 1 : 0)};
    transition: opacity 0.15s ease;
  }
`;

/**
 * InputRadioCardGroup — selector vertical de opciones tipo "card" con radio.
 * Cada opción tiene un título y descripción. Solo una activa por vez.
 *
 * @param {Object} props
 * @param {Array<{ value: string, label: string, description?: string }>} props.options
 * @param {string} [props.value] - valor seleccionado.
 * @param {Function} props.onChange - (name, value) => void
 * @param {string} props.name
 * @param {boolean} [props.disabled]
 */
export const InputRadioCardGroup = ({
  options,
  value,
  onChange,
  name,
  disabled,
}) => {
  const theme = useTheme();

  const handleSelect = (optionValue) => {
    if (!disabled && onChange) {
      onChange(name, optionValue);
    }
  };

  return (
    <Group role="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <OptionCard
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            $selected={selected}
            disabled={disabled}
            onClick={() => handleSelect(option.value)}
          >
            <OptionTexts>
              <Typography
                variant="small"
                fontWeight="bold"
                color={theme.colors.neutral[500]}
              >
                {option.label}
              </Typography>
              {option.description && (
                <Typography variant="tiny" color={theme.colors.neutral[500]}>
                  {option.description}
                </Typography>
              )}
            </OptionTexts>
            <RadioCircle $selected={selected} />
          </OptionCard>
        );
      })}
    </Group>
  );
};

InputRadioCardGroup.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

export default InputRadioCardGroup;
