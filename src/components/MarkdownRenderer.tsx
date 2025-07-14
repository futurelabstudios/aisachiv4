import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  return (
    <div
      className={cn(
        // Add the 'prose' class for beautiful typography defaults
        "prose prose-sm dark:prose-invert max-w-none",
        // Customizations to match your app's style
        "prose-headings:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
        "prose-strong:font-semibold prose-p:my-2",
        className
      )}
    >
      <ReactMarkdown
        // Add the GFM plugin to support tables, strikethrough, etc.
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
