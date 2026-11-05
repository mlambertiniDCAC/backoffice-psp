import styled, { useTheme } from "styled-components";
import { Typography } from "../Typography";
import PropTypes from "prop-types";

const DefaultOptionsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex: 1 0 0;
  width: 100%;
  padding: 2px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  background: ${({ theme }) => theme.colors.neutral[0]};
  & > :first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
  & > :last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const Option = styled.button`
  display: flex;
  height: 32px;
  padding: 10px;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  ${(props) =>
    props.$active ? props.$borderColor : props.theme.colors.neutral[100]};
  background: ${(props) =>
    props.$active ? props.$background : props.theme.colors.neutral[0]};
  outline: none;
  color: ${(props) =>
    props.$active ? props.$color : props.theme.colors.neutral[500]};

  &:last-child {
    border-right: none;
  }
`;

export const InputOptions = ({
  options,
  value,
  onChange,
  className,
  name,
  disabled,
  tone,
}) => {
  const theme = useTheme();

  const getStylesByTone = () => {
    switch (tone) {
      case "brand":
        return {
          fontWeight: "normal",
          borderColor: theme.colors.lightBlue[50],
          background: theme.colors.lightBlue[50],
          color: theme.colors.lightBlue[600],
        };
      case "success":
        return {
          fontWeight: "normal",

          borderColor: theme.colors.green[50],
          background: theme.colors.green[50],
          color: theme.colors.green[600],
        };
      case "destructive":
        return {
          fontWeight: "normal",
          borderColor: theme.colors.red[50],
          background: theme.colors.red[50],
          color: theme.colors.red[600],
        };
      case "danger":
        return {
          fontWeight: "normal",
          borderColor: theme.colors.yellow[50],
          background: theme.colors.yellow[50],
          color: theme.colors.yellow[600],
        };
      case "neutral":
        return {
          fontWeight: "normal",
          borderColor: theme.colors.neutral[50],
          background: theme.colors.neutral[50],
          color: theme.colors.neutral[600],
        };
      case "filter":
        return {
          fontWeight: "bold",
          borderColor: theme.colors.blue[50],
          background: theme.colors.lightBlue[50],
          color: theme.colors.lightBlue[500],
        };
      default:
        return {
          fontWeight: "normal",
          borderColor: theme.colors.lightBlue[600],
          background: theme.colors.lightBlue[500],
          color: theme.colors.neutral[50],
        };
    }
  };

  const { borderColor, background, color, fontWeight } = getStylesByTone();

  return (
    <DefaultOptionsContainer className={className}>
      {options?.map((option) => (
        <Option
          type="button"
          key={option.value}
          $active={option.value === value}
          $borderColor={borderColor}
          $background={background}
          $color={color}
          onClick={() => {
            if (!disabled && onChange) {
              onChange(name, option.value);
            }
          }}
        >
          <Typography
            variant="tiny"
            fontWeight={fontWeight}
            whiteSpace="nowrap"
          >
            {option.label}
          </Typography>
        </Option>
      ))}
    </DefaultOptionsContainer>
  );
};

InputOptions.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
        PropTypes.oneOf([null]),
      ]),
    })
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
    PropTypes.oneOf([null]),
  ]),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  tone: PropTypes.string,
};
