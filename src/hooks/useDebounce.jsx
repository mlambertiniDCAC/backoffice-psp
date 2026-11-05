import { useState, useEffect } from "react";

/**
 * Custom hook that delays updating a value for a specified time
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay time in milliseconds
 * @returns {any} - The debounced value
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes or component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
