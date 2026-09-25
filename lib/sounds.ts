import { play, type SoundName } from "cuelume";

const cue = (name: SoundName, volume: number) => () => play(name, { volume });

function throttle(fn: () => void, ms: number) {
  let last = 0;
  return () => {
    const now = performance.now();
    if (now - last < ms) return;
    last = now;
    fn();
  };
}

/** The site's whole sound vocabulary. One sound per *meaning*, not per
 *  component, so the same kind of action sounds the same everywhere.
 *  Open/close are mirror images (rising arrival, falling hush), and
 *  everything else stays quieter than those two, so the only sounds you
 *  really notice are the ones that mean something changed. Nothing fires
 *  on scroll or passive movement; hover is reserved for the few big
 *  targets and kept barely audible. Every cue respects the Sound toggle
 *  via cuelume's own setEnabled. */
export const sfx = {
  /** Opening a case study or project. */
  open: cue("arrival", 0.5),
  /** Closing any overlay — the mirror of open. */
  close: cue("whisper", 0.7),
  /** Picking something up to look at it: the business card, a dome poster. */
  lift: cue("bloom", 0.6),
  /** Turning something over or paging: card flip, carousels, reading. */
  flip: cue("page", 0.6),
  /** Jumping to a section from a nav. */
  navigate: cue("scan", 0.35),
  /** Anything with two states. */
  toggle: cue("toggle", 0.6),
  /** Primary controls — play/pause. */
  control: cue("pulse", 0.45),
  /** Choosing one option from a set: swatches, tabs, tools. */
  select: cue("tick", 0.4),
  /** Wiping something out. */
  clear: cue("droplet", 0.5),
  /** Pointer arriving on a big target. Throttled so a fast sweep across the
   *  grid reads as one soft tick instead of a rattle. */
  hover: throttle(cue("tick", 0.16), 120),
};

export type SfxName = keyof typeof sfx;
