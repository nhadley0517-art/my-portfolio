import ForFunTile from "@/components/ForFunTile";

export default function Sandbox() {
  return (
    <section id="sandbox" className="site-section">
      <div className="site-container">
        <div className="sandbox-stage">
          <ForFunTile />
        </div>
      </div>

      <style>{`
        /* Overrides .site-section's shared padding — this section specifically
           was reading as way too much dead space above/below the dome. */
        #sandbox {
          padding-top: clamp(24px, 3vw, 44px);
          padding-bottom: clamp(56px, 7vw, 96px);
        }
        .sandbox-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 640px;
        }
        @media (max-width: 860px) {
          .sandbox-stage { height: 460px; }
        }
      `}</style>
    </section>
  );
}
