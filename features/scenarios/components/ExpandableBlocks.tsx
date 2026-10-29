"use client";

import { useEffect, useRef, useState } from "react";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import BlocksContentRenderer from "@/components/scenario-form/BlocksContentRenderer";

const COLLAPSED_HEIGHT = 96; // px, about four lines of text

// Rich text preview: shows the beginning, "show more" expands it in place
export function ExpandableBlocks({ content }: { content: BlocksContent }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // Measure the full content; it grows when pictures finish loading
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => setOverflows(inner.offsetHeight > COLLAPSED_HEIGHT));
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  const collapsed = overflows && !expanded;

  return (
    <div className="mb-4">
      <div
        className="relative overflow-hidden"
        style={collapsed ? { maxHeight: COLLAPSED_HEIGHT } : undefined}
      >
        <div
          ref={innerRef}
          // Card-sized headings and spacing; the renderer's defaults are sized for the full page
          className="text-sm leading-6 text-slate-600 dark:text-slate-400 [&_.space-y-4]:space-y-2 [&_h1]:mb-1 [&_h1]:mt-2 [&_h1]:text-base [&_h2]:mb-1 [&_h2]:mt-2 [&_h2]:text-base [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-sm [&_h4]:text-sm [&_p]:leading-6"
        >
          <BlocksContentRenderer content={content} />
        </div>
        {collapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-white dark:from-slate-900" />
        )}
      </div>

      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {expanded ? "Εμφάνιση λιγότερων" : "Εμφάνιση περισσότερων"}
        </button>
      )}
    </div>
  );
}
