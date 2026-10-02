"use client";
import { EPOCH, epochTime, type TrialStep } from "@/lib/trialStates";
export default function Timeline({
  step,
  elapsed,
  playing,
}: {
  step: TrialStep;
  elapsed: number;
  playing: boolean;
}) {
  const at = (time: number) =>
    ((time - EPOCH.start) / (EPOCH.end - EPOCH.start)) * 100;
  const current = epochTime(step, elapsed);
  return (
    <section
      className="epoch"
      aria-label="EEG analysis epoch"
      data-step={step}
      data-elapsed={elapsed}
      data-epoch-time={current}
    >
      <div className="epoch-heading">
        <span className="micro">EEG ANALYSIS EPOCH</span>
        <span className="epoch-status">
          {step === 4 ? (
            <>
              <b>OBJECT ONSET</b>
              <span className="mono"> t = 0 ms</span>
            </>
          ) : (
            <>Time-locked to the visual reveal</>
          )}
        </span>
      </div>
      <div className="epoch-plot">
        <div className="baseline-band" style={{ width: `${at(0)}%` }} />
        <div
          className="effect-band"
          style={{ left: `${at(206)}%`, width: `${at(606) - at(206)}%` }}
        />
        <div className="epoch-rule" />
        {[-100, 100, 300, 500, 700, 900].map((t) => (
          <div
            key={t}
            aria-hidden="true"
            className="epoch-tick minor"
            style={{ left: `${at(t)}%` }}
          />
        ))}
        {[-200, 0, 200, 400, 600, 800, 1000].map((t) => (
          <div
            key={t}
            className={`epoch-tick ${t === 0 ? "zero" : ""}`}
            style={{ left: `${at(t)}%` }}
          >
            <span>{t === 1000 ? "1000 ms" : t}</span>
          </div>
        ))}
        {step >= 3 && (
          <div
            className={`epoch-cursor ${playing ? "running" : ""}`}
            style={{ left: `${at(current)}%` }}
          />
        )}
        <div className="epoch-baseline-label">Baseline</div>
        <div className="epoch-effect-label" style={{ left: `${at(206)}%` }}>
          206–606 ms <span>observed mismatch effect</span>
        </div>
      </div>
      <p className="epoch-note">
        Baseline: only the final 200 ms before visual onset. The highlighted
        interval is an observed result, not a programmed stimulus period. The
        object remains visible for 2000 ms; the axis shows the first 1000 ms.
      </p>
    </section>
  );
}
