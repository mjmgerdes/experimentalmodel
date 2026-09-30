"use client";
import { STEPS, type TrialStep } from "@/lib/trialStates";
export default function TrialController({
  step,
  elapsed,
  playing,
  onStep,
  onPlay,
  onReset,
}: {
  step: TrialStep;
  elapsed: number;
  playing: boolean;
  onStep: (step: TrialStep) => void;
  onPlay: () => void;
  onReset: () => void;
}) {
  return (
    <section className="trial-controller" aria-label="Trial playback controls">
      <div className="transport">
        <button
          className="play-control"
          onClick={onPlay}
          aria-label={playing ? "Pause trial" : "Play trial"}
        >
          {playing ? (
            <svg viewBox="0 0 20 20">
              <path d="M6 4v12M14 4v12" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20">
              <path d="m7 4 9 6-9 6Z" />
            </svg>
          )}
          <span>{playing ? "Pause" : "Play trial"}</span>
        </button>
        <button
          className="icon-button"
          disabled={step === 0}
          onClick={() => onStep((step - 1) as TrialStep)}
          aria-label="Previous step"
        >
          <svg viewBox="0 0 20 20">
            <path d="m12 5-5 5 5 5" />
          </svg>
        </button>
        <button
          className="icon-button"
          disabled={step === 5}
          onClick={() => onStep((step + 1) as TrialStep)}
          aria-label="Next step"
        >
          <svg viewBox="0 0 20 20">
            <path d="m8 5 5 5-5 5" />
          </svg>
        </button>
        <button
          className="icon-button"
          onClick={onReset}
          aria-label="Reset trial"
        >
          <svg viewBox="0 0 20 20">
            <path d="M5 6a6 6 0 1 1-1 7M5 2v5H1" />
          </svg>
        </button>
      </div>
      <nav className="sequence" aria-label="Trial steps">
        {STEPS.map((s) => (
          <button
            key={s.id}
            className={`${s.id === step ? "current" : ""} ${s.id < step ? "complete" : ""}`}
            onClick={() => onStep(s.id)}
            aria-current={s.id === step ? "step" : undefined}
          >
            <span className="sequence-number">0{s.id}</span>
            <span className="sequence-name">{s.short}</span>
            <span className="sequence-line">
              <i
                style={{
                  width:
                    s.id < step
                      ? "100%"
                      : s.id === step
                        ? `${Math.max(3, (elapsed / s.duration) * 100)}%`
                        : "0%",
                }}
              />
            </span>
          </button>
        ))}
      </nav>
    </section>
  );
}
