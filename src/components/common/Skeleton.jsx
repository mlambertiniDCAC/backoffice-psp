import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";

const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
`;

const SkeletonWrapper = styled.div`
  display: block;
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "100%"};
  border-radius: ${(props) => props.$borderRadius || "8px"};
  background-color: #e0e0e0;
  position: relative;
  overflow: hidden;
  animation: ${pulse} 1.2s ease-in-out infinite;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.9) 50%,
      transparent 100%
    );
    animation: ${shimmer} 1.5s ease-in-out infinite;
  }
`;

const Skeleton = ({ width, height, borderRadius, className }) => {
  return (
    <SkeletonWrapper
      width={width}
      height={height}
      $borderRadius={borderRadius}
      className={className}
    />
  );
};

Skeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  borderRadius: PropTypes.string,
  className: PropTypes.string,
};

export default Skeleton;
