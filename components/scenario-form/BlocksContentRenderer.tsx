"use client";

import { BlocksRenderer, type BlocksContent, } from "@strapi/blocks-react-renderer";
import { toImageWidth } from "@/lib/blocks";
import { mediaUrl } from "@/lib/media";

interface BlocksContentRendererProps {
  content: BlocksContent | null | undefined;
}

export default function BlocksContentRenderer( {content}: BlocksContentRendererProps) {
  if (!content?.length) return null;

    return (
        <div className="space-y-4">     
            <BlocksRenderer
                content={content}
                blocks={{
                    paragraph: ({ children }) => (<p className="leading-7">{children}</p>
                    ),
                    heading: ({ children, level }) => {
                        const className = "font-semibold mt-6 mb-3";


                        switch (level) {
                            case 1:
                                return <h1 className={`text-3xl ${className}`}>{children}</h1>;
                            case 2:
                                return <h2 className={`text-2xl ${className}`}>{children}</h2>;
                            case 3:
                                return <h3 className={`text-xl ${className}`}>{children}</h3>;
                            default:
                                return <h4 className={`text-lg ${className}`}>{children}</h4>;
                        }
                    },
                    list: ({ children, format }) =>
                        format === "ordered" ? (
                            <ol className="list-decimal pl-6 space-y-1">{children}</ol>
                        ) : (
                            <ul className="list-disc pl-6 space-y-1">{children}</ul>
                        ),
                    quote: ({ children }) => (
                        <blockquote className="border-l-4 pl-4 italic">
                            {children}
                        </blockquote>
                    ),
                    // `displayWidth` is our extra key on the block; the renderer passes it through
                    image: ({ image, ...rest }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={mediaUrl(image.url)}
                            alt={image.alternativeText ?? ""}
                            width={image.width}
                            height={image.height}
                            style={{ width: `${toImageWidth((rest as { displayWidth?: unknown }).displayWidth)}%` }}
                            className="mx-auto block h-auto max-w-full rounded"
                        />
                    ),
                    link: ({ children, url }) => (
                        <a
                            href={url}
                            target={url.startsWith("http") ? "_blank" : undefined}
                            rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="underline"
                        >
                            {children}
                        </a>
                    ),
                }}
            />
        </div>


    );
}
