import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useDebounce from "src/hooks/useDebounce";
import { useOutsideClick } from "src/hooks/useOutsideClick";
import styled from "styled-components";
import { Typography } from "../Typography";

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
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
  background: ${({ theme }) => theme.colors.neutral[0]};
  color: ${({ theme }) => theme.colors.inputText};
  outline: none;
  box-sizing: border-box;

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
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
    color: ${({ theme }) => theme.colors.neutral[500]};
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
  opacity: ${(props) => (props.$isImage ? 1 : 0.7)};
`;

const PrefixContainer = styled.div`
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  pointer-events: none;
  font-size: 14px;
`;

const ListContainer = styled.div`
  position: fixed;
  max-height: 200px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.neutral[0]};
  border: 1px solid ${({ theme }) => theme.colors.neutral[100]};
  border-radius: 8px;
  z-index: 1000;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
`;

const SubtitleContainer = styled.div`
  padding: 8px 12px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.neutral[500]};
`;

const ItemContainer = styled.div`
  div {
    padding: 8px 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[50]};
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f5f5;
    }

    &:last-child {
      border-bottom: none;
    }
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const ContainerImage = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background-color: ${(props) => props.$bgcolor || "transparent"};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const InputSearch = ({
  onSelect,
  subtitle,
  delay = 500,
  placeholder,
  disabled,
  className,
  type,
  name,
  formatter,
  suffix,
  typeSuffix,
  keySearch,
  keyImage,
  keyBgColor,
  prefix,
  template,
  callback,
  minCharacters,
  defaultInputValue = "",
  ...props
}) => {
  const [items, setItems] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localSuffix, setLocalSuffix] = useState(suffix);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const debouncedValue = useDebounce(inputValue, delay);
  const containerRef = useRef();
  const inputContainerRef = useRef();
  const dropdownRef = useRef();
  const inputValueRef = useRef(inputValue);

  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  useEffect(() => {
    if (
      callback &&
      debouncedValue &&
      debouncedValue.length > 0 &&
      hasUserInteracted
    ) {
      if (selectedItem && selectedItem?.[keySearch] === inputValueRef.current) {
        return;
      }

      const getData = async () => {
        if (debouncedValue.length < minCharacters) {
          return;
        }
        try {
          setLoading(true);
          setShowList(true);
          const result = await callback(debouncedValue);
          setItems(result);
        } catch (error) {
          setShowList(false);
        } finally {
          setLoading(false);
        }
      };
      getData();
    } else if (!debouncedValue || debouncedValue.length === 0) {
      setItems(null);
      setShowList(false);
    }
  }, [
    debouncedValue,
    callback,
    selectedItem,
    keySearch,
    minCharacters,
    hasUserInteracted,
  ]);

  const updateDropdownPosition = useCallback(() => {
    if (inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (!showList) return;
    updateDropdownPosition();
    window.addEventListener("scroll", updateDropdownPosition, true);
    window.addEventListener("resize", updateDropdownPosition);
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [showList, updateDropdownPosition]);

  useOutsideClick([containerRef, dropdownRef], () => setShowList(false));

  const handlerChange = useCallback(
    (e) => {
      let value = e.target.value;
      if (formatter) {
        value = formatter(value);
      }
      setInputValue(value);
      setHasUserInteracted(true);

      if (typeSuffix === "image") {
        setLocalSuffix(null);
      }

      if (!value || value.trim() === "") {
        setSelectedItem(null);
        if (onSelect) {
          onSelect(name, null);
        }
      }
    },
    [formatter, onSelect, name, typeSuffix]
  );

  const handlerSelect = useCallback(
    (item) => {
      onSelect(name, item);
      setSelectedItem(item);
      setLocalSuffix(item[keyImage]);
      setInputValue(item[keySearch]);
      setShowList(false);
    },
    [onSelect, name, keyImage, keySearch]
  );

  const renderTemplate = () => {
    if (items && Array.isArray(items)) {
      return (
        <>
          {subtitle && <SubtitleContainer>{subtitle}</SubtitleContainer>}
          {items.length > 0 &&
            !loading &&
            items.map((item, index) => (
              <ItemContainer key={index} onClick={() => handlerSelect(item)}>
                {template ? template(item) : item.toString()}
              </ItemContainer>
            ))}
          {(items.length === 0 || !items) && !loading && (
            <ItemContainer>
              <div>
                <Typography variant="">No se encontraron resultados</Typography>
              </div>
            </ItemContainer>
          )}
        </>
      );
    }

    return <div></div>;
  };

  const loadingTemplate = () => (
    <>
      {subtitle && <SubtitleContainer>{subtitle}</SubtitleContainer>}
      <ItemContainer>
        <div>
          <Typography variant="">Buscando...</Typography>
        </div>
      </ItemContainer>
    </>
  );

  const suffixTemplate = () => {
    if (typeSuffix === "image") {
      return (
        <ContainerImage $bgcolor={selectedItem[keyBgColor]}>
          <Image src={localSuffix} alt="" />
        </ContainerImage>
      );
    }
    return localSuffix;
  };

  const { ...domProps } = props;

  return (
    <SearchContainer ref={containerRef}>
      <InputContainer ref={inputContainerRef}>
        {prefix && <PrefixContainer>{prefix}</PrefixContainer>}
        <StyledInput
          type={type}
          value={inputValue}
          className={className}
          onChange={handlerChange}
          placeholder={placeholder}
          disabled={disabled}
          name={name}
          $hasSuffix={!!localSuffix}
          $hasPrefix={!!prefix}
          {...domProps}
        />
        {localSuffix && (
          <SuffixContainer $isImage={typeSuffix === "image"}>
            {suffixTemplate()}
          </SuffixContainer>
        )}
      </InputContainer>
      {showList &&
        createPortal(
          <ListContainer ref={dropdownRef} style={dropdownStyle}>
            {loading ? loadingTemplate() : renderTemplate()}
          </ListContainer>,
          document.body
        )}
    </SearchContainer>
  );
};

InputSearch.propTypes = {
  onSelect: PropTypes.func,
  subtitle: PropTypes.string,
  delay: PropTypes.number,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  formatter: PropTypes.func,
  suffix: PropTypes.node,
  typeSuffix: PropTypes.oneOf(["image", "string"]),
  keySearch: PropTypes.string,
  keyImage: PropTypes.string,
  keyBgColor: PropTypes.string,
  prefix: PropTypes.node,
  template: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  callback: PropTypes.func,
  minCharacters: PropTypes.number,
  defaultInputValue: PropTypes.string,
};

export default InputSearch;
