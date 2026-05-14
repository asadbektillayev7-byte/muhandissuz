import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function exec(cmd: string, val: string | null = null) {
  // deprecated API; required for contenteditable toolbar per product spec
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  if (val === null) {
    document.execCommand(cmd, false);
  } else {
    document.execCommand(cmd, false, val);
  }
  document.getElementById("ed-body")?.focus();
}

const MenuButton = ({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="h-8 w-8"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault();
    }}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
  >
    {children}
  </Button>
);

const RichTextEditor = ({
  content,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) => {
  const syncingRef = useRef(false);

  const emitHtml = useCallback(() => {
    const el = document.getElementById("ed-body");
    if (!el) return;
    onChange(el.innerHTML);
  }, [onChange]);

  useEffect(() => {
    const el = document.getElementById("ed-body");
    if (!el) return;
    if (content === el.innerHTML) return;
    syncingRef.current = true;
    el.innerHTML = content || "";
    syncingRef.current = false;
  }, [content]);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/50 sticky top-0 z-10">
        <MenuButton onClick={() => exec("formatBlock", "H1")} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("formatBlock", "H2")} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("formatBlock", "H3")} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => exec("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("underline")} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => exec("insertUnorderedList")} title="Bullet List">
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("insertOrderedList")} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </MenuButton>

        <div className="w-px h-6 bg-border mx-1" />

        <MenuButton onClick={() => exec("undo")} title="Undo">
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("redo")} title="Redo">
          <Redo className="h-4 w-4" />
        </MenuButton>
      </div>

      <div className="p-4 min-h-[300px] bg-background">
        <div
          id="ed-body"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline
          data-placeholder={placeholder}
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none min-h-[280px] outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md",
            "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&:empty]:before:pointer-events-none",
          )}
          onInput={() => {
            if (!syncingRef.current) emitHtml();
          }}
          onBlur={() => {
            emitHtml();
          }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
