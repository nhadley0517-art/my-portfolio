/** Lets a post keep its metadata next to its prose — `export const meta`
 *  at the top of the .mdx file — instead of maintaining a parallel list in
 *  TypeScript. Replaces @types/mdx, which types the default export but not
 *  named ones. */
declare module "*.mdx" {
  import type { ComponentType } from "react";

  export interface PostMeta {
    slug: string;
    title: string;
    /** One-line hook shown on the card. */
    blurb: string;
    /** ISO date, e.g. "2026-07-28". */
    date: string;
    readingTime: string;
    tag: string;
  }

  export const meta: PostMeta;
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
