import styled from "styled-components";
import { Typography } from "../Typography";
import { color } from "src/assets/themes";
import InputSelect from "./InputSelect";
import PropTypes from "prop-types";
import { InputPassword } from "./InputPassword";
import { InputText } from "./InputText";
import {
  formatCUIT,
  formatCurrencyARG,
  formatDecimalValue,
  formatIntegerInput,
} from "src/lib/formatters";
import { handleMoneyInputKeyDown } from "src/lib/helpers";
import { InputDate } from "./InputDate";
import { useField } from "formik";
import { Toggle } from "./Toggle";
import InputSwitch from "./InputSwitch";
import { InfoSVG } from "src/assets/SVGLibrarie";
import InputSearch from "./InputSearch";
import { InputOptions } from "./InputOptions";
import Tooltip from "src/components/common/Tooltip";

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
  min-width: 0;
  ${({ $minWidth }) =>
    $minWidth &&
    `
    min-width: ${$minWidth};
    flex: 0 0 ${$minWidth};
  `}

  input {
    border: ${(props) =>
      props.$error ? `1px solid ${props.theme.colors.red[800]}` : "none"};
  }
`;

const LabelContainer = styled.div`
  display: flex;
  height: 24px;
  align-items: center;
  justify-content: space-between;
  align-self: stretch;
`;

const LabelGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LabelTooltipTrigger = styled.span`
  display: inline-flex;
  align-items: center;
  line-height: 0;
`;

const ErrorIcon = styled(InfoSVG)`
  color: ${({ theme }) => theme.colors.red[800]};
`;

/**
 * @typedef { "text" | "number" | "money" | "cuit" | "password" | "select" | "date" | "search" | "options"} Types
 *
 */

/**
 * InputForm component
 * @param {Object} props - Component properties
 * @param {Types} props.type - Type of input (text, number, money, cuit, password, select)
 * @param {string} [props.label] - Label for the input
 * @param {function} [props.formatter] - Function to format the input value
 * @param {any} [props.value] - Value of the input
 * @param {function} props.onChange - Function to handle input changes
 * @param {string} [props.name] - Name of the input
 * @param {string} [props.placeholder] - Placeholder text for the input
 * @param {boolean} [props.disabled] - Whether the input is disabled
 * @param {Array} [props.options] - Options for select input
 * @param {Object} props.props - Additional properties to pass to the input component
 * @returns {JSX.Element} Rendered InputForm component
 *  */

export const InputForm = ({
  type,
  label,
  labelTooltip,
  delay,
  formatter,
  callback,
  value,
  defaultInputValue,
  onChange,
  name,
  placeholder,
  disabled,
  className,
  options = [],
  paginable = false,
  hasMore,
  onPaginate,
  disabledPastDates,
  disabledHolidays,
  disabledWeekends,
  maxDate,
  minDate,
  maxHeight,
  minWidth,
  subtitle,
  showIcon,
  typeSuffix,
  keySearch,
  keyImage,
  tone,
  minCharacters,
  maxCharacters,
  enabledBorder = false,
  description,
  holidays = [],
  enabledSearch = false,
  ...props
}) => {
  const useSafeField = (name) => {
    try {
      return useField(name);
    } catch (e) {
      return [null, {}];
    }
  };
  const [, meta] = useSafeField(name);

  const getInputType = () => {
    switch (type) {
      case "text":
        return (
          <InputText
            maxCharacters={maxCharacters}
            name={name}
            onChange={onChange}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            {...props}
          />
        );
      case "number":
        return (
          <InputText
            value={value}
            maxCharacters={maxCharacters}
            formatter={formatIntegerInput}
            placeholder={placeholder || "0"}
            onChange={onChange}
            name={name}
            disabled={disabled}
            {...props}
          />
        );
      case "money":
        return (
          <InputText
            maxCharacters={maxCharacters}
            enabledBorder={enabledBorder}
            maxHeight={maxHeight}
            value={value ? formatCurrencyARG(value) : ""}
            formatter={formatDecimalValue}
            placeholder={placeholder || "$ 0,00"}
            onChange={onChange}
            name={name}
            disabled={disabled}
            keepCursor={true}
            onKeyDown={(e) => handleMoneyInputKeyDown(e, value, onChange, name)}
            {...props}
          />
        );
      case "cuit":
        return (
          <InputText
            value={value ? formatCUIT(value) : ""}
            maxCharacters={maxCharacters}
            placeholder={placeholder}
            onChange={onChange}
            name={name}
            disabled={disabled}
            {...props}
          />
        );
      case "password":
        return (
          <InputPassword
            value={value}
            onChange={onChange}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            {...props}
          />
        );
      case "select":
        return (
          <InputSelect
            enabledSearch={enabledSearch}
            enabledBorder={enabledBorder}
            maxHeight={maxHeight}
            value={value}
            setValue={onChange}
            name={name}
            options={options}
            paginable={paginable}
            hasMore={hasMore}
            onPaginate={onPaginate}
            placeholder={placeholder}
            disabled={disabled}
            {...props}
          />
        );
      case "date":
        return (
          <InputDate
            name={name}
            enabledBorder={enabledBorder}
            maxHeight={maxHeight}
            holidays={holidays}
            onChange={onChange}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            disabledPastDates={disabledPastDates}
            disabledHolidays={disabledHolidays}
            disabledWeekends={disabledWeekends}
            maxDate={maxDate}
            minDate={minDate}
            showIcon={showIcon}
            {...props}
          />
        );
      case "toggle":
        return (
          <Toggle
            value={value}
            name={name}
            onChange={(name, newValue) => onChange(name, newValue)}
            {...props}
          />
        );
      case "switch":
        return (
          <InputSwitch
            value={value}
            options={options}
            name={name}
            onChange={(name, newValue) => onChange(name, newValue)}
            {...props}
          />
        );
      case "search":
        return (
          <InputSearch
            minCharacters={minCharacters}
            callback={callback}
            onSelect={onChange}
            name={name}
            delay={delay}
            subtitle={subtitle}
            placeholder={placeholder}
            disabled={disabled}
            keySearch={keySearch}
            keyImage={keyImage}
            typeSuffix={typeSuffix}
            defaultInputValue={defaultInputValue}
            {...props}
          />
        );
      case "options":
        return (
          <InputOptions
            options={options}
            value={value}
            onChange={(name, newValue) => onChange(name, newValue)}
            name={name}
            disabled={disabled}
            tone={tone}
            {...props}
          />
        );
      default:
        return (
          <InputText
            maxCharacters={maxCharacters}
            type={type}
            value={value}
            onChange={onChange}
            {...props}
            formatter={formatter}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <InputContainer
      className={className}
      $minWidth={minWidth}
      $error={
        (meta.error && meta.touched) ||
        (props.error !== null && props.error !== undefined)
      }
    >
      {label && (
        <LabelContainer>
          <LabelGroup>
            <Typography variant="small" color={color.text}>
              {label}
            </Typography>
            {labelTooltip && (
              <Tooltip
                placement="bottom"
                backgroundColor={color.neutral[0]}
                padding="12px 16px"
                textAlign="left"
                tooltipContent={labelTooltip}
              >
                <LabelTooltipTrigger>
                  <InfoSVG
                    width="16px"
                    height="16px"
                    fill={color.lightBlue[400]}
                  />
                </LabelTooltipTrigger>
              </Tooltip>
            )}
          </LabelGroup>
          {props.error !== null && props.error !== undefined && (
            <ErrorIcon width="20px" height="20px" />
          )}
        </LabelContainer>
      )}
      {getInputType()}
      {description && (
        <Typography variant="small" color={color.neutral[500]}>
          {description}
        </Typography>
      )}
      {meta.touched && meta.error && (
        <div style={{ color: "red", fontSize: "12px" }}>{meta.error}</div>
      )}
    </InputContainer>
  );
};

InputForm.propTypes = {
  type: PropTypes.string,
  delay: PropTypes.number,
  label: PropTypes.string,
  labelTooltip: PropTypes.node,
  callback: PropTypes.func,
  formatter: PropTypes.func,
  value: PropTypes.any,
  defaultInputValue: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.array,
  paginable: PropTypes.bool,
  hasMore: PropTypes.bool,
  onPaginate: PropTypes.func,
  disabledPastDates: PropTypes.bool,
  disabledHolidays: PropTypes.bool,
  disabledWeekends: PropTypes.bool,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  maxHeight: PropTypes.string,
  minWidth: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  showIcon: PropTypes.bool,
  subtitle: PropTypes.string,
  typeSuffix: PropTypes.oneOf(["image", "string"]),
  keySearch: PropTypes.string,
  keyImage: PropTypes.string,
  minCharacters: PropTypes.number,
  maxCharacters: PropTypes.number,
  description: PropTypes.string,
  holidays: PropTypes.array,
  enabledSearch: PropTypes.bool,
  enabledBorder: PropTypes.bool,
  tone: PropTypes.oneOf([
    "brand",
    "success",
    "destructive",
    "danger",
    "neutral",
    "filter",
  ]),
};
