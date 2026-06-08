import { useState, type KeyboardEvent } from "react";

import { useGetTags } from "@/services/tags/tags-list";

interface ITagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

/**
 * Controlled tag editor: renders the chosen tags as removable chips plus a text
 * input. Enter or comma commits a tag; Backspace on an empty input removes the
 * last one. Existing tags are offered as `<datalist>` suggestions.
 */
const TagInput: React.FC<ITagInputProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [draft, setDraft] = useState("");
  const { tags: existingTags } = useGetTags();

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    const alreadyAdded = value.some(
      (item) => item.toLowerCase() === tag.toLowerCase()
    );
    if (!alreadyAdded) onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      removeTag(value.length - 1);
    }
  };

  const suggestions = (existingTags ?? [])
    .map((tag) => tag.name)
    .filter(
      (name) => !value.some((item) => item.toLowerCase() === name.toLowerCase())
    );

  return (
    <div className="border-divider bg-bg-main w-full rounded-lg border px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="bg-success-darker inline-flex items-center gap-x-1 rounded-full px-3 py-1 text-xs text-white"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              aria-label={`Remove ${tag}`}
              className="cursor-pointer text-sm leading-none"
            >
              ×
            </button>
          </span>
        ))}

        <input
          list="tag-suggestions"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={
            value.length ? "" : placeholder ?? "Add a tag and press Enter"
          }
          className="text-d-body2 min-w-[8rem] flex-1 bg-transparent outline-none"
        />
        <datalist id="tag-suggestions">
          {suggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

export default TagInput;
