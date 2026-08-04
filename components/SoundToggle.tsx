"use client";

import { useEffect, useState } from "react";
import { play, setEnabled } from "cuelume";

const STORAGE_KEY = "nh-sound-enabled";

/** Sound is on by default — cues only ever fire after a real user gesture,
 *  so nothing plays unprompted — but anyone browsing somewhere quiet gets a
 *  visible way out that survives reloads. Sits inline in the side nav, right
 *  below the email address, as a plain label + switch. */
export default function SoundToggle() {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = stored === null ? true : stored === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(initial);
    setReady(true);
    setEnabled(initial);
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    setEnabled(next);
    window.localStorage.setItem(STORAGE_KEY, String(next));
    // Only confirm audibly when turning it back on; playing a cue on the way
    // out would be the exact thing the user just asked to stop.
    if (next) play("toggle");
  };

  return (
    <>
    <button
      type="button"
      onClick={toggle}
      className="sound-toggle"
      aria-pressed={on}
      aria-label={on ? "Turn interface sound off" : "Turn interface sound on"}
      style={{ opacity: ready ? 1 : 0 }}
    >
      <span className="sound-toggle-label">{on ? "Sound on" : "Sound off"}</span>
      <span className="sound-toggle-track" data-on={on}>
        <span className="sound-toggle-thumb" />
      </span>
    </button>

      <style>{`
        .sound-toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: #E9E9EB;
          font: inherit;
          font-size: 12px;
          color: #6B7280;
          cursor: pointer;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .sound-toggle:hover { color: #13181B; background: #E0E0E3; }
        .sound-toggle-track {
          position: relative;
          width: 30px;
          height: 17px;
          border-radius: 999px;
          background: #E4E5E8;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }
        .sound-toggle-track[data-on="true"] { background: #13181B; }
        .sound-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .sound-toggle-track[data-on="true"] .sound-toggle-thumb { transform: translateX(13px); }
      `}</style>
    </>
  );
}
