"use client";

import ReactMarkdown from 'react-markdown';

export function StreamingMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown className="prose prose-invert max-w-none">
      {content}
    </ReactMarkdown>
  );
} 