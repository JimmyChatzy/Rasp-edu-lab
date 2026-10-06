import DOMPurify from "isomorphic-dompurify";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

function isPlainText(html: string): boolean {
  // If there are no HTML tags, treat as plain text
  return !/<[a-z][\s\S]*>/i.test(html);
}

export default function RichTextDisplay({
  content,
  className = "",
}: RichTextDisplayProps) {
  if (!content) return null;

  // Fallback for legacy plain-text content (existing DB/seed data)
  if (isPlainText(content)) {
    return (
      <p className={`whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400 ${className}`}>
        {content}
      </p>
    );
  }

  const sanitized = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["img"],
    ADD_ATTR: ["target", "rel"],
  });

  return (
    <div
      className={`rich-text text-sm text-slate-600 dark:text-slate-400 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}