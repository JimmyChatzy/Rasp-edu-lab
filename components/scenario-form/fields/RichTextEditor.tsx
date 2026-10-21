"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
//import Placeholder from "@tiptap/extension-placeholder";
//import Link from "@tiptap/extension-link";
//import Underline from "@tiptap/extension-underline"; // remove both imports if you're on Tiptap v3 (see earlier note)
import { Placeholder } from "@tiptap/extensions";
import { useEffect, useRef, useState } from "react";
import { ScenarioFieldValue, ScenarioSchemaField } from "@/lib/types";
import { formatLabel } from "@/lib/utils";
import { blocksToDoc, docToBlocks, mediaUrl } from "@/lib/blocks";
import { uploadImageAction } from "@/features/upload/actions";
import { StrapiImage } from "./StrapiImage";

interface RichTextEditorProps extends ScenarioSchemaField {
  value?: ScenarioFieldValue;
  onChange?: (value: ScenarioFieldValue) => void;
}

// TOOLBAR_BUTTONS: your existing array, minus the "Εικόνα" entry.

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

const UPLOAD_ERRORS: Record<string, string> = {
  invalid_file: "Το αρχείο δεν είναι εικόνα.",
  too_large: "Η εικόνα ξεπερνά τα 5MB.",
  upload_failed: "Η μεταφόρτωση απέτυχε. Δοκιμάστε ξανά.",
};

export default function RichTextEditor({ name, required, value, onChange, view }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  const lastSynced = useRef(JSON.stringify(value ?? null));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
     StarterKit.configure({
       heading: { levels: [1, 2, 3] },
       horizontalRule: false,
       link: {
         openOnClick: false,
         autolink: true,
         defaultProtocol: "https",
         HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
       },
     }),
     StrapiImage,
     Placeholder.configure({ placeholder: view?.placeholder }),
   ],
    content: blocksToDoc(value),
    editorProps: {
      attributes: {
        class: "rich-text-editor focus:outline-none px-3 py-2 text-sm text-slate-700 dark:text-slate-200 min-h-[120px]",
      },
    },
    onUpdate: ({ editor }) => {
      const blocks = docToBlocks(editor.getJSON() as any);
      lastSynced.current = JSON.stringify(blocks);
      onChangeRef.current?.(blocks);
    },
  });

  // Editable state, reactive to the schema
  useEffect(() => {
    editor?.setEditable(view?.editable !== false);
  }, [editor, view?.editable]);

  // External changes only (edit mode, reset). Never while the user is typing.
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const incoming = JSON.stringify(value ?? null);
    if (incoming === lastSynced.current) return;
    editor.commands.setContent(blocksToDoc(value), { emitUpdate: false });
    lastSynced.current = incoming;
  }, [value, editor]);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again
    if (!file || !editor) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction(formData);

      if (!result.ok) {
        if (result.code === "unauthorized") {
          window.location.assign("/session-expired");
          return;
        }
        setUploadError(UPLOAD_ERRORS[result.code]);
        return;
      }

      editor.chain().focus().insertContent({
        type: "strapiImage",
        attrs: {
          file: result.file,
          src: mediaUrl(result.file.url),
          alt: result.file.alternativeText ?? result.file.name ?? "",
        },
      }).run();
    } catch {
      setUploadError(UPLOAD_ERRORS.upload_failed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {view?.label ?? formatLabel(name)}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {view?.description && <p className="mb-1 text-xs text-slate-500">{view.description}</p>}

      <div className="overflow-hidden rounded border border-slate-300 dark:border-slate-600">
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
                editor && button.isActive(editor) ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" : ""
              }`}
            >
              {button.icon}
            </button>
          ))}

          {/* Image upload */}
          <button
            type="button"
            title="Εικόνα"
            aria-label="Εικόνα"
            disabled={uploading || !editor}
            onClick={() => fileInputRef.current?.click()}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {uploading ? (
              <span className="text-xs">…</span>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <EditorContent editor={editor} />
      </div>

      {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
    </div>
  );
}