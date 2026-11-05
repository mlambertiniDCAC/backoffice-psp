import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import styled from "styled-components";
import { CloseCrossSVG } from "src/assets/SVGLibrarie";
import { Typography } from "../Typography";
import { color } from "src/assets/themes";
import { useLockBodyScroll } from "src/hooks/useLockBodyScroll";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: -1;
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.$backgroundColor || "white"};
  border-radius: 16px;
  overflow: hidden;
  min-width: ${(props) => props.$minWidth || "auto"};
  height: ${(props) => props.$height || "auto"};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 40px;
  position: relative;
  gap: 10px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: ${({ $hoverBackground }) =>
      $hoverBackground || "#f0f0f0"};
  }
`;

const Modal = ({
  children,
  open,
  onClose,
  title,
  subtitle,
  minWidth,
  height,
  backgroundColor,
  closeIconColor,
  closeHoverBackground,
}) => {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, open]);

  useLockBodyScroll(open);

  if (!open) return null;

  return createPortal(
    <Container onClick={handleOverlayClick}>
      <Panel
        $minWidth={minWidth}
        $height={height}
        $backgroundColor={backgroundColor}
      >
        <Header>
          <Typography
            variant="medium"
            color={color.neutral[500]}
            fontWeight="black"
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="small" color={color.neutral[500]}>
              {subtitle}
            </Typography>
          )}
          <CloseButton
            onClick={onClose}
            $hoverBackground={closeHoverBackground}
          >
            <CloseCrossSVG
              width="24"
              height="24"
              fill={closeIconColor || color.neutral[500]}
            />
          </CloseButton>
        </Header>
        {children}
      </Panel>
    </Container>,
    document.body
  );
};
Modal.propTypes = {
  children: PropTypes.node,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  minWidth: PropTypes.string,
  height: PropTypes.string,
  backgroundColor: PropTypes.string,
  closeIconColor: PropTypes.string,
  closeHoverBackground: PropTypes.string,
};

export default Modal;
