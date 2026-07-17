"use client";

import DomeGallery from "@/components/DomeGallery";

// Reuses the exact poster assets from the For Fun page, in full color.
const POSTERS = [
  { src: "/jesse-poster.jpg", alt: "Jesse poster" },
  { src: "/bryan-poster.jpg", alt: "Bryan poster" },
  { src: "/payton-poster.jpg", alt: "Payton poster" },
  { src: "/bauhaus-poster.jpg", alt: "Bauhaus poster" },
  { src: "/cgi-poster.jpg", alt: "CGI poster" },
  { src: "/email-blast.png", alt: "Email blast" },
];

export default function ForFunTile() {
  return (
    // Transparent, contained — just the dome sitting on the page background.
    <div className="ff-panel">
      <DomeGallery
        images={POSTERS}
        grayscale={false}
        segments={18}
        fit={0.7}
        fitBasis="min"
        minRadius={160}
        maxRadius={380}
        padFactor={0.09}
        maxVerticalRotationDeg={4}
        spinDegPerSec={3}
        imageBorderRadius="14px"
        openedImageBorderRadius="18px"
      />

      <style>{`
        .ff-panel {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;      /* clip the dome to the grid cell */
          background: transparent;
          display: flex;
          align-items: center;   /* center the dome vertically in the cell */
          justify-content: center;
        }
        /* The dome sizes itself off min(width,height) — when the cell is much
           taller than it is wide (as here), that leaves the sphere's own box
           shorter than the cell, with slack split evenly above/below it.

           The box is also deliberately smaller than 100% of the cell width:
           at fit<1 the visible dome doesn't fill its whole bounding box, and
           since the hover-to-pause-spin listener covers the WHOLE box (not
           just the visible tiles), an oversized box meant the spin would
           pause even with the cursor nowhere near the dome. Shrinking the
           box to hug the dome (and bumping the fit factor up to compensate
           so the dome's own on-screen size stays about the same) fixes both the
           dead-space look and the oversized hover zone together. */
        .ff-panel .sphere-root {
          width: 82%;
          height: auto;      /* override DomeGallery's own height:100% so aspect-ratio can apply */
          aspect-ratio: 1;
          max-height: 100%;
        }
        .ff-panel .sphere-main { width: 100%; height: 100%; }
      `}</style>
    </div>
  );
}
