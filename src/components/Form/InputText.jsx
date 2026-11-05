import { useLayoutEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { color } from "src/assets/themes";
import styled from "styled-components";

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 8px;
  border: ${({ $customBorder, $enabledBorder, $borderColor, theme }) =>
    $customBorder ||
    ($enabledBorder
      ? `1px solid ${$borderColor || theme.colors.neutral[300]}`
      : "none")};
`;

const StyledInput = styled.input`
  display: flex;
  width: 100%;
  padding: 10px 16px;
  padding-right: ${(props) => (props.$hasSuffix ? "40px" : "16px")};
  padding-left: ${(props) => (props.$hasPrefix ? "40px" : "16px")};
  align-items: flex-start;
  gap: 24px;
  border-radius: 8px;
  border: 0px solid rgba(102, 102, 102, 0.5);
  background: #ffffff;
  color: ${color.inputText};
  outline: none;
  box-sizing: border-box;
  ${({ $maxHeight }) => $maxHeight && `max-height: ${$maxHeight};`}

  font-family: Lato;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;

  &::placeholder {
    opacity: 0.7;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral[200]};
    border-radius: 8px;
    border: 1px solid #d2d2d2;
    color: #888888;
  }
`;

const SuffixContainer = styled.div`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: ${({ theme }) => theme.colors.neutral[300]};
  font-size: 14px;
  opacity: 0.7;
`;

const PrefixContainer = styled.div`
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
  font-size: 14px;
`;

export const InputText = ({
  value,
  onChange,
  placeholder,
  disabled,
  enabledBorder,
  borderColor,
  customBorder,
  maxHeight,
  className,
  type = "text",
  autocomplete = "off",
  name,
  suffix,
  prefix,
  maxCharacters,
  formatter,
  keepCursor = false,
  ...props
}) => {
  const inputRef = useRef(null);
  const [cursor, setCursor] = useState(null);

  const handleChange = (e) => {
    if (maxCharacters && e.target.value.length > maxCharacters) {
      return;
    }

    if (keepCursor) {
      const element = e.target;
      const caretPos = element.selectionStart;
      const rawVal = element.value;
      const digitsBeforeCursor = rawVal
        .substring(0, caretPos)
        .replace(/[^0-9,]/g, "").length;
      setCursor(digitsBeforeCursor);
    }

    let inputValue = e.target.value;
    if (formatter) {
      inputValue = formatter(inputValue);
    }
    onChange(name, inputValue);
  };

  useLayoutEffect(() => {
    if (
      keepCursor &&
      cursor !== null &&
      inputRef.current &&
      document.activeElement === inputRef.current
    ) {
      const element = inputRef.current;
      const currentVal = element.value;
      let newPos = 0;
      let matchCount = 0;

      for (let i = 0; i < currentVal.length; i++) {
        if (/[0-9,]/.test(currentVal[i])) {
          matchCount++;
        }
        if (matchCount > cursor) {
          break;
        }
        newPos = i + 1;
      }

      element.setSelectionRange(newPos, newPos);
      setCursor(null);
    }
  }, [value, cursor, keepCursor]);

  return (
    <InputContainer
      $enabledBorder={enabledBorder}
      $borderColor={borderColor}
      $customBorder={customBorder}
    >
      {prefix && <PrefixContainer>{prefix}</PrefixContainer>}
      <StyledInput
        ref={inputRef}
        type={type}
        value={value}
        className={className}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autocomplete}
        name={name}
        $hasSuffix={!!suffix}
        $hasPrefix={!!prefix}
        $maxHeight={maxHeight}
        {...props}
      />
      {suffix && <SuffixContainer>{suffix}</SuffixContainer>}
    </InputContainer>
  );
};

InputText.propTypes = {
  value: PropTypes.any,
  enabledBorder: PropTypes.bool,
  borderColor: PropTypes.string,
  customBorder: PropTypes.string,
  maxHeight: PropTypes.string,
  maxCharacters: PropTypes.number,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  autocomplete: PropTypes.string,
  name: PropTypes.string,
  formatter: PropTypes.func,
  suffix: PropTypes.node,
  prefix: PropTypes.node,
  keepCursor: PropTypes.bool,
};
