"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useEffect, useRef } from "react";
import { ScenarioSchemaField } from "@/lib/types";
import { ScenarioFieldValue } from "../types";
import { formatLabel } from "@/lib/utils";

interface RichTextEditorProps extends ScenarioSchemaField {
    value?: string | null;
    onChange?: (value: ScenarioFieldValue) => void;
}

interface ToolbarButton {
  label: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  {
    label: "Έντονα",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
      </svg>
    ),
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive("bold"),
  },
  {
    label: "Πλάγια",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h10M8 20h10M14 4L10 20" />
      </svg>
    ),
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive("italic"),
  },
  {
    label: "Διαγραφή",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
      </svg>
    ),
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive("strike"),
  },
  {
    label: "Επικεφαλίδα 1",
    icon: <span className="text-sm font-bold">H1</span>,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    label: "Επικεφαλίδα 2",
    icon: <span className="text-sm font-bold">H2</span>,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    label: "Επικεφαλίδα 3",
    icon: <span className="text-sm font-bold">H3</span>,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    label: "Λίστα με κουκκίδες",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    label: "Αριθμημένη λίστα",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1" />
      </svg>
    ),
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    label: "Σύνδεσμος",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-4 4a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l4-4a4 4 0 015.656 5.656l-1.5 1.5" />
      </svg>
    ),
    action: (editor) => {
      const previousUrl = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("Εισάγετε τη διεύθυνση URL:", previousUrl ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    },
    isActive: (editor) => editor.isActive("link"),
  },
  {
    label: "Εικόνα",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    action: (editor) => {
      const url = window.prompt("Εισάγετε τη διεύθυνση εικόνας (URL):", "https://");
      if (!url) return;
      editor.chain().focus().setImage({ src: url }).run();
    },
    isActive: (editor) => editor.isActive("image"),
  },
  {
    label: "Αναίρεση",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v1M3 10l4-4m-4 4l4 4" />
      </svg>
    ),
    action: (editor) => editor.chain().focus().undo().run(),
    isActive: () => false,
  },
  {
    label: "Επανάληψη",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a5 5 0 00-5 5v1M21 10l-4-4m4 4l-4 4" />
      </svg>
    ),
    action: (editor) => editor.chain().focus().redo().run(),
    isActive: () => false,
  },
];

export default function RichTextEditor({
  name,
  placeholder,
  value,
  onChange,
  view
}: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
    ],
    content: value ?? "",
    editorProps: {
      attributes: {
        class:
          "rich-text-editor focus:outline-none px-3 py-2 text-sm text-slate-700 dark:text-slate-200 min-h-[120px]"
      },
    },
  });

  // Sync editor HTML to the hidden input on every update

  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      
      const html = editor.getHTML();

      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = html;
      }

      onChange?.(html);
    };

   // sync();

    editor.on("update", sync);
    
    return () => {
      editor.off("update", sync);
    };
  }, [editor, onChange]);


  return (
    <div className="overflow-hidden rounded border border-slate-300 dark:border-slate-600">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {view?.label  ?? formatLabel(name)}
      </label>
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800">
        {TOOLBAR_BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            title={button.label}
            aria-label={button.label}
            onMouseDown={(event) => {
              event.preventDefault();
              if (editor) button.action(editor);
            }}
            className={`rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 ${
              editor && button.isActive(editor)
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : ""
            }`}
          >
            {button.icon}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}