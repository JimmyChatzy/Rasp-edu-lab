"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { IMAGE_WIDTHS, type ImageWidth } from "@/lib/blocks";

const WIDTH_LABEL: Record<ImageWidth, string> = {
  25: "Μικρό",
  50: "Μεσαίο",
  75: "Μεγάλο",
  100: "Πλήρες",
};

// Editor view of an image block: click it to pick a display size
export function StrapiImageView({ node, selected, editor, updateAttributes }: ReactNodeViewProps) {
  const width: ImageWidth = node.attrs.displayWidth ?? 100;

  return (
    <NodeViewWrapper className="my-3" data-drag-handle>
      <div className="relative mx-auto" style={{ width: `${width}%` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          draggable={false}
          className={`block h-auto w-full rounded ${selected ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
        />

        {selected && editor.isEditable && (
          <div
            contentEditable={false}
            className="absolute left-1/2 top-2 flex -translate-x-1/2 gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 text-xs shadow dark:border-slate-600 dark:bg-slate-800/95"
          >
            {IMAGE_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                title={`${w}%`}
                // mousedown + preventDefault keeps the image selected
                onMouseDown={(event) => {
                  event.preventDefault();
                  updateAttributes({ displayWidth: w });
                }}
                className={`rounded px-2 py-1 ${
                  w === width
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {WIDTH_LABEL[w]}
              </button>
            ))}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
