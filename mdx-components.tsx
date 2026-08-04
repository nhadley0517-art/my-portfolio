import type { MDXComponents } from "mdx/types";

/** Styling for everything written in MDX. Deliberately mirrors the case
 *  studies' quiet type scale — neutral greys, generous line height, no
 *  accent colors — so a written post and a case study read as the same
 *  publication rather than two different sites. */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2
        style={{
          fontSize: "clamp(19px, 2.1vw, 23px)",
          fontWeight: 500,
          color: "#13181B",
          letterSpacing: "-0.02em",
          lineHeight: 1.38,
          margin: "56px 0 18px",
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{
          fontSize: "17px",
          fontWeight: 600,
          color: "#13181B",
          letterSpacing: "-0.01em",
          margin: "40px 0 14px",
        }}
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.85, margin: "0 0 22px", maxWidth: "640px" }}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul style={{ margin: "0 0 22px", paddingLeft: 0, listStyle: "none", maxWidth: "640px" }}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol style={{ margin: "0 0 22px", paddingLeft: "20px", maxWidth: "640px" }}>{children}</ol>
    ),
    li: ({ children }) => (
      <li
        style={{
          fontSize: "15px",
          color: "#6B7280",
          lineHeight: 1.8,
          marginBottom: "10px",
          position: "relative",
          paddingLeft: "20px",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: "0.62em",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "#C4C4C4",
          }}
        />
        {children}
      </li>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        style={{ color: "#13181B", textDecoration: "underline", textUnderlineOffset: "3px" }}
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{ borderLeft: "2px solid #E4E4E7", paddingLeft: "24px", margin: "0 0 24px" }}>
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontSize: "13.5px",
          background: "#F4F4F5",
          padding: "2px 6px",
          borderRadius: "5px",
          color: "#13181B",
        }}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre
        style={{
          background: "#FAFAFA",
          border: "1px solid #EAEAED",
          borderRadius: "4px",
          padding: "18px 20px",
          overflowX: "auto",
          margin: "0 0 24px",
          fontSize: "13.5px",
          lineHeight: 1.7,
        }}
      >
        {children}
      </pre>
    ),
    hr: () => <hr style={{ border: "none", borderTop: "1px solid #EAEAED", margin: "48px 0" }} />,
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    img: (props) => <img {...props} style={{ width: "100%", borderRadius: "4px", display: "block", margin: "0 0 24px" }} />,
    ...components,
  };
}
