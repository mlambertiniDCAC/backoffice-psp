import PropTypes from "prop-types";
import styled from "styled-components";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const TooltipWrapper = styled.span`
  position: relative;
  display: ${({ $block }) => ($block ? "block" : "inline-flex")};
  width: ${({ $block }) => ($block ? "100%" : "auto")};
  align-items: center;
`;

const TooltipBox = styled.div`
  position: fixed;
  background: ${({ $backgroundColor }) => $backgroundColor || "#444"};
  color: #fff;
  padding: ${({ $padding }) => $padding || "16px 24px"};
  border-radius: 14px;
  width: ${({ $width }) => $width || "auto"};
  min-width: ${({ $minWidth }) => $minWidth || "200px"};
  max-width: ${({ $maxWidth }) => $maxWidth || "none"};
  text-align: ${({ $textAlign }) => $textAlign || "center"};
  z-index: 230;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s;
`;

const Tooltip = ({
  children,
  tooltipContent,
  backgroundColor,
  placement,
  customTop,
  customLeft,
  width,
  minWidth,
  maxWidth,
  padding,
  textAlign,
  block = false,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  // En touch un tap dispara mouseenter + click; esta marca evita mezclar el
  // hover del mouse con el tap del mobile.
  const isTouchRef = useRef(false);

  useEffect(() => {
    if (!visible || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current?.offsetWidth || 200;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 50;
      const offset = 10;

      let top;
      let left;

      switch (placement) {
        case "custom":
          top = customTop
            ? customTop + rect.top + rect.height / 2 - tooltipHeight / 2
            : rect.top + rect.height / 2 - tooltipHeight / 2;
          left = customLeft
            ? customLeft + rect.left + rect.width / 2 - tooltipWidth / 2
            : rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - offset;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + offset;
          break;
        case "top":
          top = rect.top - tooltipHeight - offset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "bottom":
        default:
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
      }

      if (left < 0) left = 10;
      if (left + tooltipWidth > window.innerWidth)
        left = window.innerWidth - tooltipWidth - 10;
      if (top < 0) top = 10;
      if (top + tooltipHeight > window.innerHeight)
        top = window.innerHeight - tooltipHeight - 10;

      setPosition({ top, left });
    };

    updatePosition();
    const frameId = requestAnimationFrame(updatePosition);

    return () => cancelAnimationFrame(frameId);
  }, [visible, placement, customTop, customLeft, tooltipContent]);

  // En modo touch, cerrar el tooltip al tocar fuera del trigger.
  useEffect(() => {
    if (!visible) return undefined;

    const handlePointerDownOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDownOutside);
  }, [visible]);

  const handleMouseEnter = () => {
    if (!isTouchRef.current && !disabled) setVisible(true);
  };

  const handleMouseLeave = () => {
    if (!isTouchRef.current) setVisible(false);
  };

  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  // En mobile el tap alterna la visibilidad; en desktop no hace nada (gobierna el hover).
  const handleClick = () => {
    if (isTouchRef.current && !disabled) setVisible((prev) => !prev);
  };

  return (
    <TooltipWrapper
      ref={triggerRef}
      $block={block}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {children}
      {visible &&
        !disabled &&
        createPortal(
          <TooltipBox
            ref={tooltipRef}
            $backgroundColor={backgroundColor}
            $visible={visible}
            $width={width}
            $minWidth={minWidth}
            $maxWidth={maxWidth}
            $padding={padding}
            $textAlign={textAlign}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {tooltipContent}
          </TooltipBox>,
          document.body
        )}
    </TooltipWrapper>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  tooltipContent: PropTypes.node.isRequired,
  backgroundColor: PropTypes.string,
  placement: PropTypes.string,
  customTop: PropTypes.number,
  customLeft: PropTypes.number,
  width: PropTypes.string,
  minWidth: PropTypes.string,
  maxWidth: PropTypes.string,
  padding: PropTypes.string,
  textAlign: PropTypes.string,
  block: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Tooltip;
