import ForFunTile from "@/components/ForFunTile";

export default function Sandbox() {
  return (
    <section id="sandbox" className="site-section">
      <div className="site-container">
        <p className="sandbox-label">For fun</p>
        <p className="sandbox-caption">
          A dome of posters and layouts made outside any brief. Click one to look closer.
        </p>
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
        .sandbox-label {
          font-size: 16px;
          font-weight: 300;
          color: #13181B;
          margin: 0 0 12px;
        }
        .sandbox-caption {
          font-size: 14px;
          font-weight: 300;
          color: #A8ABB2;
          max-width: 460px;
          line-height: 1.6;
          margin: 0;
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
