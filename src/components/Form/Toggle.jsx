import { CheckSVG, CrossSVG } from "src/assets/SVGLibrarie";
import styled from "styled-components";
import { Typography } from "../Typography";
import PropTypes from "prop-types";

const ToggleContainer = styled.div`
  display: flex;
  height: 42px;
  align-items: flex-start;
  align-self: stretch;
`;

const Option = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex: 1 0 0;
  cursor: pointer;
  color: ${(props) =>
    props.$active
      ? props.theme.colors.neutral[0]
      : props.theme.colors.neutral[500]};
  align-self: stretch;
  border-radius: ${(props) =>
    props.$yes ? "6px 0px 0px 6px" : "0px 6px 6px 0px"};
  background: ${(props) =>
    props.$active
      ? props.theme.colors.lightBlue[500]
      : props.theme.colors.neutral[0]};
`;

export const Toggle = ({ value, name, onChange, className }) => {
  const handleToggle = (newValue) => {
    if (onChange) {
      onChange(name, newValue);
    }
  };

  return (
    <ToggleContainer className={className}>
      <Option $yes={true} $active={value} onClick={() => handleToggle(true)}>
        <CheckSVG />
        <Typography variant="small" color="currentColor">
          Si
        </Typography>
      </Option>
      <Option $yes={false} $active={!value} onClick={() => handleToggle(false)}>
        <CrossSVG />
        <Typography variant="small" color="currentColor">
          No
        </Typography>
      </Option>
    </ToggleContainer>
  );
};

Toggle.propTypes = {
  value: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
