import { useEffect, useRef, useState, useCallback } from "react";
import styled, { useTheme } from "styled-components";
import { createPortal } from "react-dom";
import { size } from "../../assets/size";
import { color } from "../../assets/themes";
import PropTypes from "prop-types";
import { Typography } from "../Typography";
import { SearchSVG, ChevronDown } from "src/assets/SVGLibrarie";
import { InputText } from "./InputText";
import { ScrollPaginator } from "../common/ScrollPaginator/ScrollPaginator";
import useDebounce from "src/hooks/useDebounce";
import { Spinner } from "../common/Spinner";
import { useLockBodyScroll } from "src/hooks/useLockBodyScroll";
import { useOutsideClick } from "src/hooks/useOutsideClick";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (width > ${size.mobile}) {
    width: 100%;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectStyled = styled.div`
  cursor: pointer;
  border-radius: 8px;
  color: #c0c0c0;
  width: 100%;
  border: ${({ $enabledBorder, theme }) =>
    $enabledBorder ? `1px solid ${theme.colors.neutral[300]}` : "none"};

  &.focus {
    border-color: ${color.primary};
  }

  &.error {
    border-color: ${color.redDetails};
  }

  &.disabled {
    cursor: default;
  }
`;

const SelectValue = styled.div`
  font-size: 16px;
  padding: 10px 30px 10px 10px;
  background: #ffffff;
  border-radius: 8px;
  text-align: left;

  display: flex;
  align-items: center;
  width: 100%;
  ${({ $maxHeight }) =>
    $maxHeight &&
    `
    max-height: ${$maxHeight};
    box-sizing: border-box;
  `}

  & > span {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &.selected {
    color: #777777;
  }

  &.disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const OptionsList = styled.div`
  position: fixed;
  background: #ffffff;
  border: 0 solid #ccc;
  border-radius: 5px;
  z-index: 9999;
  box-shadow: 0 2px 8px 0 #ccc;
  max-width: 340px;
  padding: 8px;
`;

const OptionStyled = styled.div`
  padding: 10px;
  cursor: pointer;
  transition: background 0.2s;
  color: #777777;
  white-space: nowrap;

  &:hover {
    background-color: #daedf7;
    border-left: 2px solid #1c4e79;
    color: #1c4e79;
    padding-left: 8px;
  }

  &.hover {
    background-color: #daedf7;
    border-left: 2px solid #1c4e79;
    color: #1c4e79;
    padding-left: 8px;
  }

  &.add {
    color: #518551;
  }
`;

const EmptyMessageContainer = styled.div`
  padding: 10px;
  width: 100%;
`;

const Arrow = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;

  &.focus {
    top: 30%;
    transform: scaleY(-1);
  }
`;

const ScrollableOptions = styled.div`
  max-height: 250px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  border: 1px solid #8888;
  border-radius: 8px;
  padding: 0px 8px;
  margin-bottom: 5px;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
`;

const InputSelect = ({
  placeholder = "Seleccionar",
  enabledSearch = false,
  onSearch,
  paginable = false,
  hasMore,
  onPaginate,
  enabledBorder = false,
  maxHeight,
  emptyMessage = "No se encontraron resultados",
  name,
  setValue,
  value,
  options: optionsParam = [],
  error,
  disabled = false,
  touched,
  customStyle,
  customStyleInput,
  messageOnAdd,
  onAdd,
  onBlur,
  keyboardSeach = false,
  className,
  optionTemplate,
  selectedValueTemplate,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(optionsParam);
  const [loadedOptions, setLoadedOptions] = useState(optionsParam);
  const [searchValue, setSearchValue] = useState("");
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const wrapperRef = useRef(null);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleSelect = useCallback(
    (option) => {
      if (option.add) {
        onAdd(name);
      } else {
        setValue(name, option);
      }
      setIsOpen(false);
    },
    [onAdd, setValue, name]
  );

  const handleOpen = () => {
    if (!disabled) {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    setLoadedOptions(optionsParam);
    if (!searchValue) {
      setOptions(optionsParam);
    }
  }, [optionsParam]);

  useEffect(() => {
    if (!isOpen) {
      setSearchValue("");
      setOptions(loadedOptions);
    }
  }, [isOpen, loadedOptions]);

  const initialMount = useRef(true);

  const fetchOptions = useCallback(async () => {
    if (enabledSearch && onSearch) {
      try {
        setIsLoadingSearch(true);
        const searchOptions = await onSearch(debouncedSearchValue || "");
        setOptions(searchOptions || []);
      } catch (error) {
        console.error("Error searching options:", error);
        setOptions([]);
      } finally {
        setIsLoadingSearch(false);
      }
    }
  }, [debouncedSearchValue, enabledSearch, onSearch]);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    fetchOptions();
  }, [fetchOptions]);

  const handleSearch = (_, searchValue) => {
    if (enabledSearch) {
      const val = searchValue || "";
      setSearchValue(val);
      if (!onSearch) {
        if (!val) {
          setOptions(loadedOptions);
          return;
        }
        const search = val.toLowerCase();
        const filteredOptions = loadedOptions.filter((option) =>
          option.label?.toLowerCase().includes(search)
        );
        setOptions(filteredOptions);
      }
    }
  };

  const stringSearchRef = useRef("");
  const preIndexRef = useRef(null);

  const updateDropdownPosition = useCallback(() => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();
    window.addEventListener("scroll", updateDropdownPosition, true);
    window.addEventListener("resize", updateDropdownPosition);
    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [isOpen, updateDropdownPosition]);

  useOutsideClick([wrapperRef, dropdownRef], () => setIsOpen(false));

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (keyboardSeach) {
        if (event.key === "Enter") {
          if (preIndexRef.current !== null) {
            document
              .getElementsByName(name)
              [preIndexRef.current].classList.remove("hover");
            handleSelect(options[preIndexRef.current]);
          }
        }
        if (isOpen) {
          stringSearchRef.current += event.key.toLowerCase();
          stringSearchRef.current =
            String(stringSearchRef.current[0]).toUpperCase() +
            String(stringSearchRef.current).slice(1);
          let index = options.findIndex((element) =>
            element.label?.includes(stringSearchRef.current)
          );
          if (index === -1) {
            stringSearchRef.current = event.key.toUpperCase();
            index = options.findIndex((element) =>
              element.label?.includes(stringSearchRef.current)
            );
          }
          if (index !== -1) {
            document.getElementsByName(name)[index].scrollIntoView(false);
            if (preIndexRef.current !== null) {
              document
                .getElementsByName(name)
                [preIndexRef.current].classList.remove("hover");
            }
            preIndexRef.current = index;
            document.getElementsByName(name)[index].classList.add("hover");
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, options, name, handleSelect, keyboardSeach]);

  useLockBodyScroll(isOpen);

  const labelSelectedValue = value?.label ? value.label : placeholder;

  const dropdownContent =
    isOpen &&
    createPortal(
      <OptionsList
        onClick={(e) => e.stopPropagation()}
        ref={dropdownRef}
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
          width: dropdownPosition.width,
          minWidth: dropdownPosition.width,
        }}
      >
        {enabledSearch && (
          <SearchContainer>
            <InputText
              prefix={<SearchSVG fill={theme.colors.neutral[400]} />}
              placeholder="Buscar"
              name="search"
              value={searchValue}
              onChange={handleSearch}
            />
          </SearchContainer>
        )}
        <ScrollableOptions>
          {messageOnAdd && (
            <OptionStyled className="add" onClick={onAdd}>
              {messageOnAdd}
            </OptionStyled>
          )}
          {isLoadingSearch ? (
            <SpinnerContainer>
              <Spinner size={24} />
            </SpinnerContainer>
          ) : paginable &&
            onPaginate &&
            searchValue === "" &&
            options.length > 0 ? (
            <ScrollPaginator
              initialItems={options}
              hasMore={hasMore}
              spinnerSize={14}
              height={options.length > 3 ? "250px" : "auto"}
              onPaginate={onPaginate}
              onItemsChange={(items) => {
                setLoadedOptions(items);
                if (searchValue === "") {
                  setOptions(items);
                }
              }}
              getItemKey={(option, index) =>
                option?.id ?? option?.value ?? index
              }
              renderItem={(option, index) =>
                optionTemplate ? (
                  optionTemplate({
                    option,
                    index,
                    onSelect: handleSelect,
                  })
                ) : (
                  <OptionStyled
                    name={name}
                    className={option?.add === true ? "add" : ""}
                    key={option?.id || option?.value || index}
                    onClick={() => handleSelect(option)}
                  >
                    <Typography
                      variant="regular"
                      fontWeight="500"
                      color={color.text}
                      style={{ padding: "8px 0" }}
                    >
                      {option.label}
                    </Typography>
                  </OptionStyled>
                )
              }
            />
          ) : (
            <>
              {options.length === 0 ? (
                <EmptyMessageContainer>
                  <Typography
                    variant="regular"
                    fontWeight="500"
                    color={theme.colors.neutral[400]}
                    style={{ padding: "8px 0" }}
                  >
                    {emptyMessage}
                  </Typography>
                </EmptyMessageContainer>
              ) : (
                options.map((option, key) =>
                  optionTemplate ? (
                    <div key={option?.id ?? option?.value ?? key}>
                      {optionTemplate({
                        option,
                        index: key,
                        onSelect: handleSelect,
                      })}
                    </div>
                  ) : (
                    <OptionStyled
                      name={name}
                      className={option?.add === true ? "add" : ""}
                      key={option?.id || key}
                      onClick={() => handleSelect(option)}
                    >
                      <Typography
                        variant="regular"
                        fontWeight="500"
                        color={color.text}
                        style={{ padding: "8px 0" }}
                      >
                        {option.label}
                      </Typography>
                    </OptionStyled>
                  )
                )
              )}
            </>
          )}
        </ScrollableOptions>
      </OptionsList>,
      document.body
    );

  return (
    <Container style={customStyle} className={className}>
      {disabled ? (
        <SelectWrapper>
          <SelectStyled id={name} className={"disabled"}>
            <SelectValue
              className={"disabled"}
              style={customStyleInput}
              $maxHeight={maxHeight}
            >
              {selectedValueTemplate && value ? (
                selectedValueTemplate(value)
              ) : (
                <span>{labelSelectedValue}</span>
              )}
              <Arrow>
                <ChevronDown fill="currentColor" />
              </Arrow>
            </SelectValue>
          </SelectStyled>
        </SelectWrapper>
      ) : (
        <SelectWrapper ref={wrapperRef}>
          <SelectStyled
            $enabledBorder={enabledBorder}
            ref={selectRef}
            id={name}
            className={isOpen ? "focus" : touched && error ? "error" : ""}
            onBlur={onBlur}
            onClick={() => handleOpen()}
          >
            <SelectValue
              className={value ? "selected" : ""}
              style={customStyleInput}
              $maxHeight={maxHeight}
            >
              {selectedValueTemplate && value ? (
                selectedValueTemplate(value)
              ) : (
                <span>{labelSelectedValue}</span>
              )}
              <Arrow className={isOpen ? "focus" : ""}>
                <ChevronDown fill="currentColor" />
              </Arrow>
            </SelectValue>
          </SelectStyled>
          {dropdownContent}
        </SelectWrapper>
      )}
    </Container>
  );
};

InputSelect.propTypes = {
  placeholder: PropTypes.string,
  enabledSearch: PropTypes.bool,
  paginable: PropTypes.bool,
  hasMore: PropTypes.bool,
  onPaginate: PropTypes.func,
  emptyMessage: PropTypes.string,
  enabledBorder: PropTypes.bool,
  maxHeight: PropTypes.string,
  name: PropTypes.string,
  setValue: PropTypes.func,
  value: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.any,
  }),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
        PropTypes.oneOf([null]),
      ]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      add: PropTypes.bool,
    })
  ),
  error: PropTypes.any,
  disabled: PropTypes.bool,
  touched: PropTypes.any,
  customStyle: PropTypes.object,
  customStyleInput: PropTypes.object,
  messageOnAdd: PropTypes.string,
  onAdd: PropTypes.func,
  onBlur: PropTypes.func,
  hideErrorSection: PropTypes.bool,
  keyboardSeach: PropTypes.bool,
  onSearch: PropTypes.func,
  className: PropTypes.string,
  optionTemplate: PropTypes.func,
  selectedValueTemplate: PropTypes.func,
};

export default InputSelect;
