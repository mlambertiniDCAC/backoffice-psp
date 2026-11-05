import { styled } from "styled-components";
import { color } from "../../assets/themes";
import PropTypes from "prop-types";

const Container = styled.div`
  color: ${color.redDetails};
  font-size: 12px;
  margin-top: 4px;
  min-height: 18px; /* Adjust as needed */
  visibility: ${(props) => (props.$show ? "visible" : "hidden")};
`;

function ErrorMessage({ children, show }) {
  return <Container $show={show}>{children}</Container>;
}

ErrorMessage.propTypes = {
  children: PropTypes.node,
  show: PropTypes.bool.isRequired,
};

export default ErrorMessage;
