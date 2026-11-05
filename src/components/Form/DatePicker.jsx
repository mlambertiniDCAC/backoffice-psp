import { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  addMonths,
  format,
  getDaysInMonth,
  isAfter,
  isBefore,
  isSameDay,
  isWeekend,
  parse,
  startOfDay,
  startOfMonth,
  startOfToday,
} from "date-fns";

const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 320px;
  min-width: 320px;
  background: #ffffff;
  box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  position: absolute;
  z-index: 2;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px;
  gap: 8px;
  height: 100%;
  align-self: stretch;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  gap: 20px;
  /* width: 368px; */
  width: 100%;
  height: 32px;
  align-self: stretch;
`;

const MonthTitle = styled.div`
  margin: 0 auto;
  width: 100%;
  height: 28px;
  font-family: "Lato", sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 23px;
  line-height: 28px;
  color: #888888;
`;

const NavContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 16px;
  margin: 0 auto;
  width: 80px;
  height: 32px;
`;

const IconBox = styled.button`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8.89px;
  gap: 8.89px;
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #c0c0c0;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`;

const Calendar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 8px;
  width: 100%;
`;

const CalendarRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 4px;
  width: 100%;
  align-self: stretch;
`;

const DayCell = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4px;
  gap: 10px;
  border-radius: 8px;
  flex-grow: 1;
  cursor: ${(props) =>
    props.$isCurrentMonth && !props.$isDisabled ? "pointer" : "default"};
  color: ${(props) =>
    props.$isHeader
      ? "#3179A7"
      : !props.$isCurrentMonth
        ? "#C0C0C0"
        : props.$isDisabled
          ? "#C0C0C0"
          : props.$isSelected
            ? "#FFFFFF"
            : "#666666"};
  background: ${(props) => (props.$isSelected ? "#3179A7" : "transparent")};
  border: ${(props) => (props.$isSelected ? "1px solid #3179A7" : "none")};
  font-weight: ${(props) => (props.$isSelected ? "700" : "400")};
  opacity: ${(props) => (props.$isDisabled ? "0.5" : "1")};

  &:hover {
    background: ${(props) =>
      !props.$isHeader &&
      props.$isCurrentMonth &&
      !props.$isSelected &&
      !props.$isDisabled
        ? "#f5f5f5"
        : ""};
  }
`;

const DayText = styled.span`
  font-family: "Lato", sans-serif;
  font-style: normal;
  font-weight: ${(props) => (props.$isHeader ? "700" : "400")};
  font-size: 16px;
  line-height: 16px;
  text-align: center;
`;

const DatePicker = ({
  onConfirm,
  initialDate,
  disableWeekends = false,
  disableHolidays = false,
  disablePastDates = false,
  maxDate,
  minDate,
  holidays = [],
}) => {
  const normalizeBound = (value) =>
    typeof value === "string"
      ? parse(value, "yyyy-MM-dd", new Date())
      : startOfDay(value);

  const isPastDate = (date) => isBefore(date, startOfToday());

  const isAfterMaxDate = (date) => {
    if (!maxDate) return false;
    return isAfter(date, normalizeBound(maxDate));
  };

  const isBeforeMinDate = (date) => {
    if (!minDate) return false;
    return isBefore(date, normalizeBound(minDate));
  };

  const isHoliday = (date) => {
    if (!holidays || holidays.length === 0) return false;
    const dateStr = format(date, "yyyy-MM-dd");
    return holidays.some((holiday) => holiday.fecha === dateStr);
  };

  const areAllDaysDisabled = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(monthDate);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isWeekendDay = isWeekend(date);
      const isHolidayDay = isHoliday(date);
      const isPastDay = isPastDate(date);

      const isDisabled =
        (disableWeekends && isWeekendDay) ||
        (disableHolidays && isHolidayDay) ||
        (disablePastDates && isPastDay) ||
        isAfterMaxDate(date) ||
        isBeforeMinDate(date);

      if (!isDisabled) {
        return false;
      }
    }
    return true;
  };

  const findNextAvailableMonth = (startMonth) => {
    let testMonth = startMonth;
    let attempts = 0;
    const maxAttempts = 12; // Evitar bucle infinito

    while (attempts < maxAttempts) {
      if (!areAllDaysDisabled(testMonth)) {
        return testMonth;
      }
      testMonth = startOfMonth(addMonths(testMonth, 1));
      attempts++;
    }

    return startMonth;
  };

  const getInitialMonth = () => {
    const baseMonth = initialDate || new Date();
    return findNextAvailableMonth(baseMonth);
  };

  const [selectedDate, setSelectedDate] = useState(initialDate || null);
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth);

  // Nombres de meses en español
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Nombres de días en español
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const isSelectedDate = (date) =>
    selectedDate ? isSameDay(date, selectedDate) : false;

  const handleChangeMonth = (e, next) => {
    e.stopPropagation();
    e.preventDefault();
    const newMonth = startOfMonth(addMonths(currentMonth, next ? 1 : -1));

    if (areAllDaysDisabled(newMonth)) {
      const nextAvailableMonth = findNextAvailableMonth(newMonth);
      setCurrentMonth(nextAvailableMonth);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  // Generar los días para el calendario
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Primer día del mes actual
    const firstDay = startOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const startingDayOfWeek = firstDay.getDay();

    const calendarDays = [];

    // Añadir espacio de días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push({
        day: "",
        isCurrentMonth: false,
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isWeekendDay = isWeekend(date);
      const isHolidayDay = isHoliday(date);
      const isPastDay = isPastDate(date);
      calendarDays.push({
        day: i,
        date,
        isCurrentMonth: true,
        isSelected: isSelectedDate(date),
        isDisabled:
          (disableWeekends && isWeekendDay) ||
          (disableHolidays && isHolidayDay) ||
          (disablePastDates && isPastDay) ||
          isAfterMaxDate(date) ||
          isBeforeMinDate(date),
        isHoliday: isHolidayDay,
      });
    }

    // Añadir espacios de días del mes siguiente para completar la última semana
    const remainingDays = 7 - (calendarDays.length % 7 || 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
          day: "",
          isCurrentMonth: false,
        });
      }
    }

    return calendarDays;
  };

  // Manejar clic en una fecha
  const handleDateClick = (e, date) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedDate(date);
    onConfirm(date);
  };

  // Generar filas del calendario
  const renderCalendarRows = () => {
    const days = generateCalendarDays();
    const rows = [];

    // Fila de encabezados (días de la semana)
    rows.push(
      <CalendarRow key="header">
        {dayNames.map((day, index) => (
          <DayCell key={index} $isHeader={true}>
            <DayText $isHeader={true}>{day}</DayText>
          </DayCell>
        ))}
      </CalendarRow>
    );
    // Filas de días
    let week = [];
    days.forEach((day, index) => {
      week.push(
        <DayCell
          key={index}
          $isCurrentMonth={day.isCurrentMonth}
          $isSelected={day.isSelected}
          $isDisabled={day.isDisabled}
          $isHoliday={day.isHoliday}
          onClick={(e) => {
            if (day.isCurrentMonth && !day.isDisabled) {
              handleDateClick(e, day.date);
            }
          }}
        >
          <DayText>{day.day}</DayText>
        </DayCell>
      );

      if (week.length === 7 || index === days.length - 1) {
        rows.push(
          <CalendarRow key={`week-${rows.length}`}>{week}</CalendarRow>
        );
        week = [];
      }
    });

    return rows;
  };

  return (
    <DatePickerContainer>
      <Container>
        <Header>
          <MonthTitle>
            {`${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
          </MonthTitle>
          <NavContainer>
            <IconBox onClick={(e) => handleChangeMonth(e, false)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 4L6 8L10 12"
                  stroke="#666666"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconBox>
            <IconBox onClick={(e) => handleChangeMonth(e, true)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="#666666"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconBox>
          </NavContainer>
        </Header>
        <Calendar>{renderCalendarRows()}</Calendar>
      </Container>
    </DatePickerContainer>
  );
};

DatePicker.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  initialDate: PropTypes.instanceOf(Date),
  disableWeekends: PropTypes.bool,
  disableHolidays: PropTypes.bool,
  disablePastDates: PropTypes.bool,
  maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  holidays: PropTypes.array,
};

export default DatePicker;
