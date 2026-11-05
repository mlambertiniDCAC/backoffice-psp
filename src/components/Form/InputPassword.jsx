import PropTypes from "prop-types";
import { useState } from "react";
import { InputText } from "./InputText";
import styled from "styled-components";
import { EyeClosed, EyeOpen } from "src/assets/SVGLibrarie";

const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const EyeIcon = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-45%);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #666;
  z-index: 2;

  &:focus {
    outline: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const InputPassword = ({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  onClick,
  autocomplete = "off",
  name,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e) => {
    if (disabled) return;
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <PasswordWrapper className={className}>
      <InputText
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="input-password"
        onClick={onClick}
        autocomplete={autocomplete}
        {...props}
      />
      <EyeIcon
        type="button"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? (
          <EyeClosed width="20" height="20" fill="white" />
        ) : (
          <EyeOpen width="20" height="20" fill="white" />
        )}
      </EyeIcon>
    </PasswordWrapper>
  );
};

InputPassword.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  autocomplete: PropTypes.string,
  name: PropTypes.string,
};
