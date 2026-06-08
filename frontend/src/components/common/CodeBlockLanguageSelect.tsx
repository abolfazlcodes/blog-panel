import { useEditorState } from "@tiptap/react";

import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// Common languages the author can tag a code block with. The value is stored as
// the code block's `language` attribute and emitted as `class="language-…"`,
// which the consuming site uses for syntax highlighting.
const LANGUAGES = [
  "bash",
  "css",
  "diff",
  "go",
  "html",
  "java",
  "javascript",
  "json",
  "jsx",
  "markdown",
  "php",
  "python",
  "rust",
  "scss",
  "sql",
  "tsx",
  "typescript",
  "yaml",
];

/** Language picker shown only while the selection is inside a code block. */
export function CodeBlockLanguageSelect() {
  const { editor } = useTiptapEditor();
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      active: ctx.editor?.isActive("codeBlock") ?? false,
      language: (ctx.editor?.getAttributes("codeBlock").language as string) ?? "",
    }),
  });

  if (!editor || !state?.active) return null;

  return (
    <select
      aria-label="Code block language"
      value={state.language || ""}
      onChange={(event) =>
        editor
          .chain()
          .focus()
          .updateAttributes("codeBlock", { language: event.target.value || null })
          .run()
      }
      className="h-8 rounded-md border border-divider bg-transparent px-2 text-xs outline-none"
    >
      <option value="">auto</option>
      {LANGUAGES.map((language) => (
        <option key={language} value={language}>
          {language}
        </option>
      ))}
    </select>
  );
}
