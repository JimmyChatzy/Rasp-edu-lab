// lib/blocks.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mediaUrl } from "./media";
export { mediaUrl } from "./media";
type TNode = { type: string; attrs?: any; content?: TNode[]; text?: string; marks?: { type: string; attrs?: any }[] };
type Block = Record<string, any>;

//const MEDIA_BASE = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

// Local upload provider returns "/uploads/x.png"; cloud providers return absolute URLs.
/*
export function mediaUrl(url?: string | null): string {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${MEDIA_BASE}${url}`;
}*/

const MARK_TO_MODIFIER: Record<string, string> = {
  bold: "bold", italic: "italic", underline: "underline", strike: "strikethrough", code: "code",
};
const MODIFIER_TO_MARK = Object.fromEntries(Object.entries(MARK_TO_MODIFIER).map(([k, v]) => [v, k]));

/* ---------- Tiptap -> Strapi blocks ---------- */

function inlineToBlocks(nodes: TNode[] = []): Block[] {
  const out: Block[] = [];
  for (const n of nodes) {
    if (n.type === "hardBreak") { out.push({ type: "text", text: "\n" }); continue; }
    if (n.type !== "text") continue;

    const text: Block = { type: "text", text: n.text ?? "" };
    let linkUrl: string | undefined;
    for (const m of n.marks ?? []) {
      if (m.type === "link") linkUrl = m.attrs?.href;
      else if (MARK_TO_MODIFIER[m.type]) text[MARK_TO_MODIFIER[m.type]] = true;
    }
    out.push(linkUrl ? { type: "link", url: linkUrl, children: [text] } : text);
  }
  return out.length ? out : [{ type: "text", text: "" }];
}

function listToBlock(n: TNode): Block {
  return {
    type: "list",
    format: n.type === "orderedList" ? "ordered" : "unordered",
    children: (n.content ?? []).map((li) => {
      const children: Block[] = [];
      for (const child of li.content ?? []) {
        if (child.type === "paragraph") children.push(...inlineToBlocks(child.content));
        else if (child.type === "bulletList" || child.type === "orderedList") children.push(listToBlock(child));
      }
      return { type: "list-item", children: children.length ? children : [{ type: "text", text: "" }] };
    }),
  };
}

function nodeToBlocks(n: TNode): Block[] {
  switch (n.type) {
    case "paragraph": return [{ type: "paragraph", children: inlineToBlocks(n.content) }];
    case "heading":   return [{ type: "heading", level: n.attrs?.level ?? 1, children: inlineToBlocks(n.content) }];
    case "bulletList":
    case "orderedList": return [listToBlock(n)];
    case "blockquote": return (n.content ?? []).map((p) => ({ type: "quote", children: inlineToBlocks(p.content) }));
    case "codeBlock":  return [{ type: "code", children: [{ type: "text", text: n.content?.map((t) => t.text).join("") ?? "" }] }];
    case "strapiImage":
      return n.attrs?.file
        ? [{ type: "image", image: n.attrs.file, children: [{ type: "text", text: "" }] }]
        : [];
    default: return [];
  }
}

export function docToBlocks(doc: TNode): Block[] | null {
  const blocks = (doc.content ?? []).flatMap(nodeToBlocks);
  const isEmpty =
    blocks.length === 0 ||
    (blocks.length === 1 && blocks[0].type === "paragraph" &&
      blocks[0].children.every((c: Block) => c.type === "text" && !c.text));
  return isEmpty ? null : blocks;
}

/* ---------- Strapi blocks -> Tiptap ---------- */

function inlineToDoc(children: Block[] = [], extraMarks: any[] = []): TNode[] {
  const out: TNode[] = [];
  for (const c of children) {
    if (c.type === "link") { out.push(...inlineToDoc(c.children, [...extraMarks, { type: "link", attrs: { href: c.url } }])); continue; }
    if (c.type !== "text") continue;

    const marks = [...extraMarks];
    for (const key of Object.keys(MODIFIER_TO_MARK)) if (c[key]) marks.push({ type: MODIFIER_TO_MARK[key] });

    (c.text as string).split("\n").forEach((part, i) => {
      if (i > 0) out.push({ type: "hardBreak" });
      if (part) out.push({ type: "text", text: part, ...(marks.length && { marks }) });
    });
  }
  return out;
}

function blockToDoc(b: Block): TNode | null {
  switch (b.type) {
    case "paragraph": return { type: "paragraph", content: inlineToDoc(b.children) };
    case "heading":   return { type: "heading", attrs: { level: b.level }, content: inlineToDoc(b.children) };
    case "quote":     return { type: "blockquote", content: [{ type: "paragraph", content: inlineToDoc(b.children) }] };
    case "code": {
      const text = (b.children ?? []).map((c: Block) => c.text).join("");
      return { type: "codeBlock", ...(text && { content: [{ type: "text", text }] }) };
    }
    case "image":
      return b.image
        ? {
            type: "strapiImage",
            attrs: { file: b.image, src: mediaUrl(b.image.url), alt: b.image.alternativeText ?? b.image.name ?? "" },
          }
        : null;
    case "list":
      return {
        type: b.format === "ordered" ? "orderedList" : "bulletList",
        content: (b.children ?? []).map((li: Block) => {
          const inline = (li.children ?? []).filter((c: Block) => c.type !== "list");
          const nested = (li.children ?? []).filter((c: Block) => c.type === "list").map(blockToDoc).filter(Boolean) as TNode[];
          return { type: "listItem", content: [{ type: "paragraph", content: inlineToDoc(inline) }, ...nested] };
        }),
      };
    default: return null;
  }
}

export function blocksToDoc(value: unknown): TNode {
  const blocks = Array.isArray(value) ? (value as Block[]) : [];
  const content = blocks.map(blockToDoc).filter(Boolean) as TNode[];
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}