import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { toImageWidth } from "@/lib/blocks";
import { StrapiImageView } from "./StrapiImageView";

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
      displayWidth: {
        default: 100, // % of the text column
        parseHTML: (element) => toImageWidth(Number(element.getAttribute("data-width"))),
        renderHTML: (attributes) => ({ "data-width": attributes.displayWidth }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[data-strapi-image]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes({ "data-strapi-image": "", class: "max-w-full rounded" }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(StrapiImageView);
  },
});
