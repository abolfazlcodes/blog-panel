import { ArrowLeftIcon } from "./tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "./tiptap-icons/highlighter-icon";
import { LinkIcon } from "./tiptap-icons/link-icon";
import { Button } from "./tiptap-ui-primitive/button";
import { ToolbarGroup, ToolbarSeparator } from "./tiptap-ui-primitive/toolbar";
import { ColorHighlightPopoverContent } from "./tiptap-ui/color-highlight-popover";
import { LinkContent } from "./tiptap-ui/link-popover";

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export default MobileToolbarContent;
