import Document from "@tiptap/extension-document";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { Toolbar } from "../tiptap-ui-primitive/toolbar";
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";
import MainToolbarContent from "./MainToolbarContent";
import MobileToolbarContent from "./MobileToolbarContent";
import StarterKit from "@tiptap/starter-kit";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import Superscript from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { ImageUploadNode } from "../tiptap-node/image-upload-node";
import { handleImageUpload } from "@/lib/tiptap-utils";

import "highlight.js/styles/atom-one-dark.css";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Shared lowlight instance (common ~35 languages) powering highlighted code blocks.
const lowlight = createLowlight(common);

interface IBlogTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const BlogTextEditor: React.FC<IBlogTextEditorProps> = ({
  content,
  onChange,
}) => {
  const isMobile = useIsMobile();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      Document.extend({
        content: "block+",
      }),
      StarterKit.configure({
        horizontalRule: false,
        // Replaced by CodeBlockLowlight below for syntax highlighting + language.
        codeBlock: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      CodeBlockLowlight.configure({ lowlight }),
      HorizontalRule,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 10,
        upload: handleImageUpload,
        onError: (error) => console.log("upload failed:", error),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className="h-full w-full border border-divider rounded-lg">
      <div className="simple-editor-wrapper !my-4">
        <EditorContext.Provider value={{ editor }}>
          <Toolbar
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>

          <EditorContent
            editor={editor}
            role="presentation"
            placeholder="Start typing ...."
            className="simple-editor-content !p-4 focus:!outline-none"
          />
        </EditorContext.Provider>
      </div>
    </div>
  );
};

export default BlogTextEditor;
