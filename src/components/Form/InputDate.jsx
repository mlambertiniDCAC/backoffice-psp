import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { InputText } from "./InputText";
import styled, { useTheme } from "styled-components";
import DatePicker from "./DatePicker";
import PropTypes from "prop-types";
import { CalendarSVG } from "../../assets/SVGLibrarie";
import { useOutsideClick } from "src/hooks/useOutsideClick";

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  border: ${({ $enabledBorder, theme }) =>
    $enabledBorder ? `1px solid ${theme.colors.neutral[300]}` : "none"};
`;

const DatePickerContainer = styled.div`
  position: fixed;
  ${(props) =>
    props.$position
      ? `
    top: ${props.$position.top}px;
    left: ${props.$position.left}px;
  `
      : `
    top: 100%;
    left: 0;
  `}
  z-index: 1000;
`;

export const InputDate = ({
  value,
  name,
  enabledBorder,
  maxHeight,
  placeholder = "Seleccione una fecha",
  disabled,
  onChange,
  showIcon = true,
  disableWeekends = false,
  disableHolidays = false,
  disablePastDates = false,
  maxDate,
  minDate,
  holidays,
  ...props
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState(null);
  const datePickerRef = useRef(null);
  const inputContainerRef = useRef(null);
  const theme = useTheme();

  const calculateDatePickerPosition = () => {
    if (!inputContainerRef.current) return;

    const inputRect = inputContainerRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const datePickerWidth = 400;
    const datePickerHeight = 275;

    let top = inputRect.bottom;
    let left = inputRect.left;

    if (left + datePickerWidth > windowWidth) {
      left = Math.max(0, windowWidth - datePickerWidth);
    }

    if (top + datePickerHeight > windowHeight) {
      top = Math.max(0, inputRect.top - datePickerHeight);
    }

    setDatePickerPosition({
      top: top,
      left: left,
    });
  };

  useOutsideClick(
    [datePickerRef, inputContainerRef],
    () => setShowDatePicker(false),
    showDatePicker
  );

  useEffect(() => {
    const handleResize = () => {
      if (showDatePicker) {
        calculateDatePickerPosition();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showDatePicker]);

  const handleDatePickerToggle = () => {
    const newState = !showDatePicker;
    setShowDatePicker(newState);

    if (newState) {
      calculateDatePickerPosition();
    }
  };

  const onConfirm = (date) => {
    setShowDatePicker(false);
    onChange(name, date);
  };

  return (
    <InputContainer ref={inputContainerRef} $enabledBorder={enabledBorder}>
      <InputText
        onClick={handleDatePickerToggle}
        disabled={disabled}
        value={
          value instanceof Date
            ? value.toLocaleDateString({ month: "2-digit" })
            : ""
        }
        name={name}
        placeholder={placeholder}
        maxHeight={maxHeight}
        readOnly
        prefix={
          showIcon ? (
            <CalendarSVG
              width="24"
              height="24"
              fill={theme.colors.neutral[500]}
            />
          ) : undefined
        }
        {...props}
      />
      {showDatePicker &&
        createPortal(
          <DatePickerContainer
            ref={datePickerRef}
            $position={datePickerPosition}
          >
            <DatePicker
              holidays={holidays}
              disableWeekends={disableWeekends}
              disableHolidays={disableHolidays}
              disablePastDates={disablePastDates}
              maxDate={maxDate}
              minDate={minDate}
              initialDate={value || new Date()}
              onConfirm={onConfirm}
            />
          </DatePickerContainer>,
          document.body
        )}
    </InputContainer>
  );
};

InputDate.propTypes = {
  value: PropTypes.instanceOf(Date),
  enabledBorder: PropTypes.bool,
  maxHeight: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  showIcon: PropTypes.bool,
  disableWeekends: PropTypes.bool,
  disableHolidays: PropTypes.bool,
  disablePastDates: PropTypes.bool,
  maxDate: PropTypes.string,
  minDate: PropTypes.string,
  holidays: PropTypes.array,
};
