import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="mb-3 text-2xl font-bold text-slate-900" {...props} />,
    h2: (props) => <h2 className="mb-2 mt-4 text-xl font-semibold text-slate-800" {...props} />,
    h3: (props) => <h3 className="mb-2 mt-3 text-lg font-semibold text-slate-800" {...props} />,
    p: (props) => <p className="mb-2 leading-7 text-slate-700" {...props} />,
    ul: (props) => <ul className="mb-3 list-disc space-y-1 pl-5 text-slate-700" {...props} />,
    ol: (props) => <ol className="mb-3 list-decimal space-y-1 pl-5 text-slate-700" {...props} />,
    code: (props) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm" {...props} />,
    ...components,
  };
}
