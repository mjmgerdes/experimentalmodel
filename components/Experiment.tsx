"use client";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Component,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import type { CameraPreset, Condition, ElementId } from "@/lib/experimentData";
import { COPY, OBJECTS, CAMERAS } from "@/lib/experimentData";
import {
  STEPS,
  nextStep,
  previousStep,
  type TrialStep,
} from "@/lib/trialStates";
import {
  AUTHOR_VALIDATED,
  AUTHOR_VALIDATION_NOTE,
  PAPER_URL,
} from "@/lib/constants";
import TrialController from "./TrialController";
import Timeline from "./Timeline";
import InfoPanel, { ResearchNotes } from "./InfoPanel";
const ExperimentScene = dynamic(() => import("./ExperimentScene"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <span />
      Preparing the experimental model
    </div>
  ),
});
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-loading">
        <h2>The 3D model could not load.</h2>
        <p>
          Please enable hardware acceleration or open this page in a
          WebGL-capable browser. The trial controls and scientific notes remain
          available.
        </p>
        <button onClick={() => window.location.reload()}>Reload model</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function Experiment() {
  const [mode, setMode] = useState<"explore" | "trial">("explore");
  const [condition, setCondition] = useState<Condition>("match");
  const [step, setStep] = useState<TrialStep>(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<ElementId | null>(null);
  const [preset, setPreset] = useState<CameraPreset>("Overview");
  const [resetKey, setResetKey] = useState(0);
  const [presentation, setPresentation] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inspectWindow, setInspectWindow] = useState(false);
  const [labels, setLabels] = useState(true);
  const elapsedRef = useRef(0);
  const lastFrame = useRef<number | null>(null);
  const goStep = useCallback((next: TrialStep) => {
    setPlaying(false);
    setStep(next);
    setElapsed(0);
    elapsedRef.current = 0;
  }, []);
  const reset = useCallback(() => goStep(0), [goStep]);
  const selectElement = useCallback((id: ElementId | null) => {
    setSelected(id);
  }, []);
  const play = useCallback(() => {
    if (step === 5) {
      setStep(0);
      setElapsed(0);
      elapsedRef.current = 0;
    }
    setPlaying((v) => !v);
  }, [step]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let frame: number;
    lastFrame.current = null;
    const tick = (now: number) => {
      if (lastFrame.current !== null)
        elapsedRef.current += Math.min(now - lastFrame.current, 100);
      lastFrame.current = now;
      if (elapsedRef.current >= STEPS[step].duration) {
        elapsedRef.current = 0;
        setElapsed(0);
        if (step === 5) {
          setPlaying(false);
          return;
        }
        setStep(nextStep(step));
        return;
      }
      setElapsed(elapsedRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      lastFrame.current = null;
    };
  }, [playing, step]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.target instanceof HTMLElement &&
          (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName) ||
            e.target.isContentEditable)) ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      )
        return;
      if (e.key.toLowerCase() === "p") {
        setPresentation((v) => !v);
        setMode("trial");
      }
      if (mode === "trial" && e.key === "ArrowRight") {
        e.preventDefault();
        goStep(nextStep(step));
      }
      if (mode === "trial" && e.key === "ArrowLeft") {
        e.preventDefault();
        goStep(previousStep(step));
      }
      if (
        mode === "trial" &&
        e.code === "Space" &&
        !(e.target instanceof HTMLElement && e.target.closest("button"))
      ) {
        e.preventDefault();
        play();
      }
      if (e.key === "Escape") setPresentation(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [mode, step, goStep, play]);
  const changeMode = (next: "explore" | "trial") => {
    setMode(next);
    setPlaying(false);
    setSelected(null);
  };
  const changeCondition = (next: Condition) => {
    setCondition(next);
    reset();
  };
  const current = STEPS[step];
  const clear = mode === "trial" ? step === 2 || step === 4 : inspectWindow;
  return (
    <main
      className={`experiment ${presentation ? "presentation" : ""} ${mode === "trial" ? "trial-mode" : ""}`}
    >
      <a className="skip-link" href="#main-controls">
        Skip to controls
      </a>
      <header className="topbar">
        <div className="identity">
          <span className="identity-mark">
            <svg viewBox="0 0 28 28">
              <path d="M2 14h5l3-8 5 17 4-13 3 4h4" />
            </svg>
          </span>
          <div>
            <h1>
              Word <span>→</span> Object
            </h1>
            <p>REFERENTIAL OBJECT-WORD UNDERSTANDING</p>
          </div>
        </div>
        {!presentation && (
          <nav className="mode-switch" aria-label="Application mode">
            <button
              className={mode === "explore" ? "active" : ""}
              onClick={() => changeMode("explore")}
            >
              Explore setup
            </button>
            <button
              className={mode === "trial" ? "active" : ""}
              onClick={() => changeMode("trial")}
            >
              Run trial
            </button>
          </nav>
        )}
        <button
          className="presentation-button"
          aria-pressed={presentation}
          onClick={() => {
            setPresentation((v) => !v);
            setMode("trial");
          }}
        >
          <svg viewBox="0 0 20 20">
            <path d="M3 7V3h4m6 0h4v4M3 13v4h4m6 0h4v-4" />
          </svg>
          {presentation ? "Exit presentation" : "Present"}
          <kbd>P</kbd>
        </button>
      </header>
      <div className="workspace">
        <section className="scene-stage" aria-label="Experimental model">
          <div className="scene-topline">
            <span className="micro">
              BOROS ET AL. <span className="muted">/</span> 2024
            </span>
            <span className="recording">
              <i /> EEG RECORDING <span>non-invasive</span>
            </span>
          </div>
          <div className="canvas-wrap">
            <SceneBoundary>
              <ExperimentScene
                step={step}
                trial={mode === "trial"}
                condition={condition}
                selected={selected}
                onSelect={selectElement}
                preset={preset}
                resetKey={resetKey}
                reducedMotion={reducedMotion}
                inspectWindow={inspectWindow}
                labels={labels}
                timeRef={elapsedRef}
              />
            </SceneBoundary>
          </div>
          <div className={`window-status ${clear ? "clear" : ""}`}>
            <i />
            <span>
              WINDOW <strong>{clear ? "TRANSPARENT" : "OPAQUE"}</strong>
            </span>
          </div>
          {!presentation && (
            <div className="scene-bottomline">
              <span>
                <svg viewBox="0 0 20 20">
                  <path d="M5 8a6 6 0 1 1 0 5M5 4v4H1" />
                </svg>
                Drag to orbit <span>·</span> Scroll to zoom
              </span>
              <button
                onClick={() => {
                  setPreset("Overview");
                  setResetKey((v) => v + 1);
                }}
              >
                Reset camera ↗
              </button>
            </div>
          )}
          {mode === "trial" && step === 4 && (
            <div className="onset-marker" role="status">
              <span className="micro">OBJECT ONSET / EEG EVENT TRIGGER</span>
              <strong>
                t = 0 <span>ms</span>
              </strong>
              <small>Timestamp synchronized with visual reveal</small>
            </div>
          )}
        </section>
        {mode === "explore" && !presentation ? (
          <InfoPanel
            selected={selected}
            onSelect={selectElement}
            preset={preset}
            onPreset={setPreset}
            inspectWindow={inspectWindow}
            onWindow={() => setInspectWindow((v) => !v)}
            labels={labels}
            onLabels={() => setLabels((v) => !v)}
          />
        ) : (
          <aside className="trial-panel" id="main-controls">
            <div className="panel-heading">
              <span className="micro">THE TRIAL PROCEDURE</span>
              <span className="panel-index">02 / 02</span>
            </div>
            <div className="condition-switch" aria-label="Trial condition">
              <button
                aria-pressed={condition === "match"}
                onClick={() => changeCondition("match")}
              >
                Match
              </button>
              <button
                aria-pressed={condition === "mismatch"}
                onClick={() => changeCondition("mismatch")}
              >
                Mismatch
              </button>
            </div>
            <div className="step-copy" aria-live="polite">
              <span className="step-eyebrow">
                STEP 0{step} <span>/ 05</span>
                <b>{current.timing}</b>
              </span>
              <h2>{current.title}</h2>
              <p>{current.caption}</p>
            </div>
            <div
              className={`relationship ${step >= 4 ? condition : "pending"}`}
              aria-live="polite"
              aria-label="Word and object information"
            >
              {step < 2 ? (
                <>
                  <span className="micro">BEFORE THE WORD PRIME</span>
                  <p>
                    {step === 0
                      ? "Trial not yet begun."
                      : "Owner preparing the object. The dog has not yet heard the word."}
                  </p>
                </>
              ) : (
                <>
                  <span className="micro">
                    HEARD WORD{" "}
                    <span>{step >= 4 ? "REVEALED OBJECT" : "OBJECT"}</span>
                  </span>
                  <div>
                    <strong>Ball</strong>
                    <span className="relation-arrow">→</span>
                    <strong>
                      {step < 4
                        ? "Hidden"
                        : condition === "match"
                          ? "Ball"
                          : "Frisbee"}
                    </strong>
                  </div>
                  <p>
                    {step < 4
                      ? "The object has not yet been revealed."
                      : condition === "match"
                        ? "The word corresponds to the object."
                        : "The word does not correspond to the object."}
                  </p>
                </>
              )}
            </div>
            {step === 2 ? (
              <div className="prime-quote">
                <span className="micro">PRERECORDED OWNER VOICE · EXAMPLE</span>
                <blockquote>
                  “Kun-kun, look,
                  <br />
                  the <em>ball!</em>”
                </blockquote>
                <span className="small-muted">
                  Sentence shown as text; no audio recording.
                </span>
              </div>
            ) : step === 3 ? (
              <div className="delay-note">
                <span className="micro">THE CRITICAL INTERVAL</span>
                <p>
                  Word already heard.
                  <br />
                  Object still hidden.
                </p>
                <span>Any expectation precedes the visual reveal.</span>
              </div>
            ) : (
              <div className="pool-note">
                <span className="micro">ONE SHARED STIMULUS POOL</span>
                <p>
                  Same words. Same objects.
                  <br />
                  Different semantic relationship.
                </p>
                <div className="object-pool">
                  {OBJECTS.map((o) => (
                    <span key={o.kind}>{o.label}</span>
                  ))}
                </div>
                <span className="small-muted">
                  Illustrative objects; individualized for each dog.
                </span>
              </div>
            )}
            {!presentation && (
              <div className="trial-camera">
                <label htmlFor="trial-camera" className="field-label">
                  CAMERA VIEW
                </label>
                <div className="select-wrap">
                  <select
                    id="trial-camera"
                    value={preset}
                    onChange={(e) => setPreset(e.target.value as CameraPreset)}
                  >
                    {CAMERAS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <span>⌄</span>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
      <div
        className="lower-deck"
        id={mode === "explore" ? "main-controls" : undefined}
      >
        {mode === "trial" ? (
          <>
            <TrialController
              step={step}
              elapsed={elapsed}
              playing={playing}
              onStep={goStep}
              onPlay={play}
              onReset={reset}
            />
            <Timeline step={step} elapsed={elapsed} playing={playing} />
          </>
        ) : (
          <div className="explore-footer">
            <div>
              <span className="micro">THE QUESTION</span>
              <p>Does hearing a word evoke a representation of its object?</p>
            </div>
            <button className="begin-trial" onClick={() => changeMode("trial")}>
              Walk through a trial <span>→</span>
            </button>
          </div>
        )}
      </div>
      {!presentation && (
        <>
          <ResearchNotes />
          <footer className="citation">
            <p>
              {COPY.schematic}
              <span>
                {AUTHOR_VALIDATED
                  ? "Experimental arrangement confirmed with the study authors."
                  : "Based on published methods — not author-validated."}
                {AUTHOR_VALIDATION_NOTE && ` ${AUTHOR_VALIDATION_NOTE}`}
              </span>
            </p>
            <a href={PAPER_URL} target="_blank" rel="noreferrer">
              Current Biology <span>↗</span>
            </a>
          </footer>
        </>
      )}
      {presentation && (
        <div className="presentation-footnote">
          {COPY.schematic} {!AUTHOR_VALIDATED && "Not author-validated."}
        </div>
      )}
    </main>
  );
}
