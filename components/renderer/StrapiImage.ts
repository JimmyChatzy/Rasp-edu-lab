import { Node, mergeAttributes } from "@tiptap/core";

export const StrapiImage = Node.create({
  name: "strapiImage",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      file: { default: null, rendered: false }, // full Strapi media object, kept in the doc, not in the DOM
      src: { default: null },
      alt: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "img[data-strapi-image]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes({ "data-strapi-image": "", class: "max-w-full rounded" }, HTMLAttributes)];
  },
});