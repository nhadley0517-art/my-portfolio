import type { ComponentType } from "react";
import type { PostMeta } from "*.mdx";

import DesigningWithSound, { meta as designingWithSound } from "./designing-with-sound.mdx";
import ShippingInTwoWeeks, { meta as shippingInTwoWeeks } from "./shipping-an-app-in-two-weeks.mdx";

export interface Post extends PostMeta {
  Component: ComponentType<Record<string, unknown>>;
}

/** Adding a post: drop a .mdx file in this folder with an `export const meta`
 *  block, then add one line here. Bundlers can't glob a directory at build
 *  time in a way that survives static export, so the list stays explicit. */
export const POSTS: Post[] = [
  { ...designingWithSound, Component: DesigningWithSound },
  { ...shippingInTwoWeeks, Component: ShippingInTwoWeeks },
].sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
