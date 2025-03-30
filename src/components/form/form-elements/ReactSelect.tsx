import React from "react";
import ReactSelect, { StylesConfig, MultiValue, SingleValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  isSearchable?: boolean;
  isMulti?: boolean;
}

const SelectUsingReactSelect: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue,
  isSearchable = true,
  isMulti = false,
}) => {
  const defaultOption = isMulti
    ? options.filter((opt) => defaultValue?.includes(opt.value))
    : options.find((opt) => opt.value === defaultValue) || null;

  const handleChange = (
    selectedOption: SingleValue<Option> | MultiValue<Option>
  ) => {
    if (Array.isArray(selectedOption)) {
      onChange(selectedOption.map((opt) => opt.value).join(","));
    } else {
      onChange(!Array.isArray(selectedOption) && selectedOption !== null ? (selectedOption as Option).value : "");
    }
  };

  const customStyles: StylesConfig<Option> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "transparent",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      minHeight: "44px",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "white",
      zIndex: 20,
    }),
    singleValue: (base) => ({
      ...base,
      color: "black",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#e5e7eb" : "white",
      color: "black",
      "&:active": {
        backgroundColor: "#dbeafe",
      },
    }),
  };

  const darkStyles: StylesConfig<Option> = {
    ...customStyles,
    control: (base, state) => ({
      ...customStyles.control?.(base, state),
      backgroundColor: "#111827",
      borderColor: state.isFocused ? "#2563eb" : "#374151",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#1f2937",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#f9fafb",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#374151" : "#1f2937",
      color: "#f9fafb",
    }),
  };

  // Detect dark mode from document (using Tailwind's dark class)
  const isDarkMode = typeof window !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <ReactSelect
      options={options}
      placeholder={placeholder}
      defaultValue={defaultOption}
      onChange={handleChange}
      isSearchable={isSearchable}
      isMulti={isMulti}
      styles={isDarkMode ? darkStyles : customStyles}
      className={className}
      theme={(theme) => ({
        ...theme,
        borderRadius: 8,
        colors: {
          ...theme.colors,
          primary25: isDarkMode ? "#374151" : "#e5e7eb",
          primary: "#3b82f6",
        },
      })}
    />
  );
};

export default SelectUsingReactSelect;
