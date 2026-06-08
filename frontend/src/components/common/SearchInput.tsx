import { useEffect, useState } from "react";

interface ISearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  delay?: number;
}

/**
 * Debounced search box. Holds its own input state and fires `onSearch` with the
 * trimmed value after `delay` ms of inactivity. `onSearch` must be stable
 * (e.g. wrapped in useCallback) so the debounce timer isn't reset every render.
 */
const SearchInput: React.FC<ISearchInputProps> = ({
  onSearch,
  placeholder = "Search…",
  delay = 350,
}) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value.trim()), delay);
    return () => clearTimeout(timer);
  }, [value, delay, onSearch]);

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      className="border-divider bg-bg-main w-full max-w-md rounded-lg border px-3 py-2 outline-none"
    />
  );
};

export default SearchInput;
