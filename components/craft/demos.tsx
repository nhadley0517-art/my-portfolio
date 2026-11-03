"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { SearchBar } from "@/components/hadley/search-bar";
import { CharacterLimit } from "@/components/hadley/character-limit";
import { ProfileCard } from "@/components/hadley/profile-card";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const SEARCH_ITEMS = [
  "Still",
  "No. 2",
  "Driveway Auto Spa",
  "Cove",
  "Loop",
  "Profile Card",
  "Character Limit",
].map((label, i) => ({ label, hint: String(i + 1).padStart(3, "0") }));

/** What autoplay types; "" means backspace to empty. */
const SEARCH_SCRIPT = ["s", "st", "sti", "", "c", "co", "cov", "", "l", "lo", "loo", ""];

/** The real search bar. Types and sifts by itself while it's on screen, until
 *  someone clicks in and it's theirs. */
export function SearchDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [query, setQuery] = useState("");
  const [hands, setHands] = useState(false);

  useEffect(() => {
    if (hands || !inView) return;
    let live = true;
    (async () => {
      await sleep(900);
      while (live) {
        let prev = "";
        for (const next of SEARCH_SCRIPT) {
          if (!live) return;
          if (next === "") {
            await sleep(1000);
            for (let i = prev.length - 1; i >= 0 && live; i--) {
              setQuery(prev.slice(0, i));
              await sleep(170);
            }
            await sleep(1100);
          } else {
            setQuery(next);
            await sleep(420);
          }
          prev = next;
        }
      }
    })();
    return () => {
      live = false;
    };
  }, [hands, inView]);

  return (
    <div ref={ref} className="w-full" onPointerDownCapture={() => setHands(true)}>
      <SearchBar
        items={SEARCH_ITEMS}
        value={query}
        onValueChange={setQuery}
        open={hands ? undefined : true}
        placeholder="Search my work"
        stroke
      />
    </div>
  );
}

const FITS = "Small things, done with care.";
const LIMIT = 40;
/** Enough whole words to land clearly past the limit, so the orange shows. */
const OVER = "Every detail is a decision you get to make on purpose.";

/** The real composer. Writes a line that fits, then one that runs over so the
 *  orange sand spills, until someone clicks in. */
export function CharacterDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [text, setText] = useState("");
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || !inView) return;
    let live = true;
    const type = async (line: string) => {
      for (let i = 1; i <= line.length && live; i++) {
        setText(line.slice(0, i));
        await sleep(40 + Math.random() * 80 + (/[.,]/.test(line[i - 1]) ? 260 : 0));
      }
    };
    const post = () => ref.current?.querySelector<HTMLButtonElement>("[data-post]")?.click();
    (async () => {
      await sleep(600);
      while (live) {
        await type(FITS);
        await sleep(1000);
        if (!live) break;
        post();
        await sleep(2300);
        await type(OVER);
        await sleep(1400);
        const to = OVER.lastIndexOf(" ", LIMIT - 4);
        for (let n = OVER.length - 1; n >= to && live; n--) {
          setText(OVER.slice(0, n));
          await sleep(55);
        }
        await sleep(800);
        if (!live) break;
        post();
        await sleep(2400);
      }
    })();
    return () => {
      live = false;
    };
  }, [auto, inView]);

  return (
    <div ref={ref} className="w-full" onPointerDownCapture={() => setAuto(false)}>
      {/* Controlled, so posting has to hand the box back empty itself. */}
      <CharacterLimit limit={LIMIT} value={text} onValueChange={setText} onAction={() => setText("")} placeholder="Say something" stroke />
    </div>
  );
}

/** The real profile card, stretching between its phone and desktop layouts on
 *  its own until someone grabs it. */
export function ProfileDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [view, setView] = useState<"phone" | "desktop">("phone");
  const [hands, setHands] = useState(false);

  useEffect(() => {
    if (hands || !inView) return;
    const id = setInterval(() => setView((x) => (x === "phone" ? "desktop" : "phone")), 3200);
    return () => clearInterval(id);
  }, [hands, inView]);

  return (
    <div ref={ref} className="flex w-full justify-center" onPointerDownCapture={() => setHands(true)}>
      <ProfileCard
        name="Noah Hadley"
        handle="noahhadley"
        bio="Product designer. Small interactions, decided carefully."
        avatar="/noahheadshot.jpg"
        cover="/craft/banner.jpg"
        followers={1284}
        following={312}
        view={view}
        onViewChange={setView}
        stroke
      />
    </div>
  );
}
