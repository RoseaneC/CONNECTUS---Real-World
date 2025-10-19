import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownMessage({ text }) {
  if (!text) return null;
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props) => <h1 className="mt-0 mb-3 text-xl font-semibold" {...props} />,
          h2: (props) => <h2 className="mt-2 mb-2 text-lg font-semibold" {...props} />,
          h3: (props) => <h3 className="mt-2 mb-2 font-semibold" {...props} />,
          p:  (props) => <p className="mb-3 leading-relaxed" {...props} />,
          ul: (props) => <ul className="list-disc pl-5 space-y-1 mb-3" {...props} />,
          ol: (props) => <ol className="list-decimal pl-5 space-y-1 mb-3" {...props} />,
          li: (props) => <li className="mb-1" {...props} />,
          strong: (props) => <strong className="font-semibold" {...props} />,
          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline" />,
          code: ({inline, ...props}) =>
            inline
              ? <code className="px-1 py-0.5 rounded bg-slate-800" {...props} />
              : <code className="block p-3 rounded bg-slate-800 overflow-x-auto" {...props} />,
          hr: () => <hr className="my-4 border-slate-600" />
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
