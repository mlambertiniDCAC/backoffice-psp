import PropTypes from "prop-types";
import styled, { useTheme } from "styled-components";
import { CheckSVG } from "src/assets/SVGLibrarie";
import { Typography } from "src/components/Typography";

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.neutral[300]};
`;

export const Checker = ({ value, regex, label }) => {
  const theme = useTheme();
  const isValid = typeof value === "string" && regex.test(value);

  return (
    <Row>
      {isValid ? (
        <CheckSVG width="16" height="16" fill={theme.colors.green[500]} />
      ) : (
        <Dot />
      )}
      <Typography
        variant="small"
        color={isValid ? theme.colors.green[700] : theme.colors.neutral[500]}
      >
        {label}
      </Typography>
    </Row>
  );
};

Checker.propTypes = {
  value: PropTypes.string,
  regex: PropTypes.instanceOf(RegExp).isRequired,
  label: PropTypes.string.isRequired,
};

export default Checker;
