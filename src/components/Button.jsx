import styled, { useTheme } from "styled-components";
import PropTypes from "prop-types";
import { Typography } from "./Typography";
import { Spinner } from "./common/Spinner";

const StyledButton = styled.button`
  width: ${({ $width }) => ($width ? $width : "auto")};
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  outline: none;
  border: 1px solid transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.neutral[500]};
  padding: 16px;
  overflow: ${({ $slide }) => ($slide ? "hidden" : "visible")};

  //Sizes
  &.small {
    height: 32px;
  }

  &.medium {
    height: 40px;
  }

  &.large {
    height: 48px;
  }

  // Roles
  &.primary {
    background: ${({ $color }) => $color[500]};
    color: ${({ theme }) => theme.colors.neutral[0]};
    &:hover {
      background: ${({ $color }) => $color[600]};
    }
    &:active {
      background: ${({ $color }) => $color[700]};
    }
    &:disabled {
      cursor: not-allowed;
      background-color: ${({ theme }) => theme.colors.neutral[200]};
      color: ${({ theme }) => theme.colors.neutral[0]};
    }
  }

  &.secondary {
    background: ${({ $color }) => $color[50]};
    color: ${({ $color }) => $color[500]};
    &:hover {
      background: ${({ $color }) => $color[100]};
    }
    &:active {
      background: ${({ $color }) => $color[300]};
    }
    &:disabled {
      cursor: not-allowed;
      background-color: ${({ theme }) => theme.colors.neutral[200]};
      color: ${({ theme }) => theme.colors.neutral[0]};
    }
  }

  &.tertiary {
    background: transparent;
    color: ${({ $color }) => $color[500]};
    &:hover {
      border: 1px solid ${({ $color }) => $color[200]};
    }
    &:active {
      border: 1px solid ${({ $color }) => $color[300]};
      background: ${({ $color }) => $color[200]};
    }
    &:disabled {
      background: transparent;
    }
    &:disabled {
      cursor: not-allowed;
      color: ${({ theme }) => theme.colors.neutral[400]};
      border: none;
    }
  }

  &.upload {
    background: transparent;
    color: ${({ $color }) => $color[500]};
    border: 1px dashed ${({ $color }) => $color[500]};
    justify-content: space-between;
    &:hover {
      background: ${({ $color }) => $color[100]};
    }
    &:active {
      background: ${({ $color }) => $color[200]};
    }
    &:disabled {
      cursor: not-allowed;
      background-color: ${({ theme }) => theme.colors.neutral[200]};
      color: ${({ theme }) => theme.colors.neutral[400]};
      border: none;
    }
  }

  &.tiny {
    background-color: transparent;
    color: ${({ $color }) => $color[500]};
    height: auto;
    padding: 0px;
    min-height: 20px;
    gap: 4px;
    &:hover {
      text-decoration: underline;
    }
    &:active {
      color: ${({ $color }) => $color[600]};
    }
    &:disabled {
      cursor: not-allowed;
      color: ${({ theme }) => theme.colors.neutral[400]};
      background-color: ${({ theme }) => theme.colors.neutral[200]};
    }
  }

  &.close {
    background-color: transparent;
    color: ${({ $color }) => $color[500]};
    &:hover {
      background: ${({ $color }) => $color[100]};
      border: none;
      color: ${({ $color }) => $color[600]};
    }
    &:active {
      background: ${({ $color }) => $color[100]};
    }
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SlideTrack = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200%;
  display: flex;
  flex-direction: column;
  transform: translateY(${({ $active }) => ($active ? "-50%" : "0")});
  transition: transform 400ms ease-out;
`;

const SlideFace = styled.div`
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ $background }) => $background || "transparent"};
  color: ${({ $color }) => $color || "inherit"};
`;

const DefaultContent = ({
  icon,
  iconPosition,
  loading,
  subText,
  whiteSpace,
  variant,
  children,
}) => (
  <>
    {iconPosition === "left" && !loading && icon}
    {iconPosition === "left" && loading && <Spinner size={16} />}
    <TextContainer>
      <Typography variant={variant} fontWeight="bold" whiteSpace={whiteSpace}>
        {children}
      </Typography>
      {subText && <span>{subText}</span>}
    </TextContainer>
    {iconPosition === "right" && icon}
    {iconPosition === "right" && loading && <Spinner size={16} />}
  </>
);

DefaultContent.propTypes = {
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  loading: PropTypes.bool,
  subText: PropTypes.string,
  whiteSpace: PropTypes.string,
  variant: PropTypes.string,
  children: PropTypes.node,
};

const SlideContent = ({ altState, icon, whiteSpace, variant, children }) => (
  <SlideTrack $active={altState.active}>
    <SlideFace aria-hidden={altState.active}>
      {icon}
      <TextContainer>
        <Typography variant={variant} fontWeight="bold" whiteSpace={whiteSpace}>
          {children}
        </Typography>
      </TextContainer>
    </SlideFace>
    <SlideFace
      $background={altState.background}
      $color={altState.color}
      aria-hidden={!altState.active}
    >
      {altState.icon}
      <TextContainer>
        <Typography
          variant={variant}
          fontWeight="bold"
          whiteSpace={whiteSpace}
          color={altState.color}
        >
          {altState.label}
        </Typography>
      </TextContainer>
    </SlideFace>
  </SlideTrack>
);

SlideContent.propTypes = {
  altState: PropTypes.shape({
    active: PropTypes.bool,
    icon: PropTypes.node,
    label: PropTypes.node,
    background: PropTypes.string,
    color: PropTypes.string,
  }),
  icon: PropTypes.node,
  whiteSpace: PropTypes.string,
  variant: PropTypes.string,
  children: PropTypes.node,
};

/**
 * @typedef {"brand" | "success" | "destructive" | "danger" | "neutral"} Tones
 * @typedef {"primary" | "secondary" | "tertiary" | "upload" | "close" | "tiny"} Roles
 * @typedef {"large" | "medium" | "small"} Sizes
 *
 */

/**
 * Button component for various actions.
 * @param {Object} props - Component properties.
 * @param {Sizes} [props.size="M"] - Size of the button.
 * @param {Tones} [props.tone="brand"] - Tone of the button.
 * @param {Roles} [props.role="primary"] - Role of the button.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {boolean} [props.loading=false] - Whether the button is in loading state.
 * @param {Function} [props.onClick] - Click event handler.
 * @param {string} [props.className] - Additional CSS class names.
 * @param {React.ReactNode} [props.icon] - Icon to display in the button.
 * @param {string} [props.subText] - Subtext to display below the main text.
 * @param {string} [props.width] - Width of the button.
 * @param {string} [props.type="button"] - HTML button type.
 * @param {React.ReactNode} props.children - Button content.
 * @param {Object} [props.altState] - Config del estado alternativo con
 *   animación de slide. Cuando se pasa, el botón renderiza una segunda "cara"
 *   que se desliza sobre el estado base según `altState.active`.
 * @param {boolean} props.altState.active - Si la cara alternativa está visible.
 * @param {React.ReactNode} [props.altState.icon] - Ícono de la cara alternativa.
 * @param {React.ReactNode} [props.altState.label] - Texto de la cara alternativa.
 * @param {string} [props.altState.background] - Fondo de la cara alternativa.
 * @param {string} [props.altState.color] - Color de texto de la cara alternativa.
 *
 */

export const Button = ({
  tone,
  role = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  onClick,
  className,
  icon,
  iconPosition = "left",
  subText,
  width,
  type = "button",
  children,
  customTone,
  whiteSpace,
  altState,
}) => {
  const theme = useTheme();

  const getToneColor = () => {
    switch (tone) {
      case "brand":
        return theme.colors.lightBlue;
      case "success":
        return theme.colors.green;
      case "destructive":
        return theme.colors.red;
      case "danger":
        return theme.colors.yellow;
      case "neutral":
        return theme.colors.neutral;
      case "custom":
        return customTone || "";
      default:
        return theme.colors.lightBlue;
    }
  };

  const getTypographyVariant = () => {
    switch (size) {
      case "large":
        return "regular";
      default:
        return "small";
    }
  };

  const variant = getTypographyVariant();

  return (
    <StyledButton
      className={`${size} ${tone} ${role} ${className || ""}`}
      onClick={onClick}
      $width={width}
      disabled={disabled || loading}
      type={type}
      $color={getToneColor()}
      $slide={!!altState}
    >
      {altState ? (
        <SlideContent
          altState={altState}
          icon={icon}
          whiteSpace={whiteSpace}
          variant={variant}
        >
          {children}
        </SlideContent>
      ) : (
        <DefaultContent
          icon={icon}
          iconPosition={iconPosition}
          loading={loading}
          subText={subText}
          whiteSpace={whiteSpace}
          variant={variant}
        >
          {children}
        </DefaultContent>
      )}
    </StyledButton>
  );
};

Button.propTypes = {
  size: PropTypes.string,
  tone: PropTypes.string,
  role: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  subText: PropTypes.string,
  width: PropTypes.string,
  type: PropTypes.string,
  children: PropTypes.node,
  customTone: PropTypes.object,
  whiteSpace: PropTypes.string,
  altState: PropTypes.shape({
    active: PropTypes.bool,
    icon: PropTypes.node,
    label: PropTypes.node,
    background: PropTypes.string,
    color: PropTypes.string,
  }),
};
