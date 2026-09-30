"use client";
import {
  CAMERAS,
  ELEMENTS,
  type CameraPreset,
  type ElementId,
  COPY,
} from "@/lib/experimentData";
import {
  AUTHOR_VALIDATED,
  AUTHOR_VALIDATION_NOTE,
  PAPER_URL,
} from "@/lib/constants";
export default function InfoPanel({
  selected,
  onSelect,
  preset,
  onPreset,
  inspectWindow,
  onWindow,
  labels,
  onLabels,
}: {
  selected: ElementId | null;
  onSelect: (id: ElementId | null) => void;
  preset: CameraPreset;
  onPreset: (p: CameraPreset) => void;
  inspectWindow: boolean;
  onWindow: () => void;
  labels: boolean;
  onLabels: () => void;
}) {
  const item = selected ? ELEMENTS[selected] : null;
  return (
    <aside className="info-panel" aria-label="Explore setup">
      <div className="panel-heading">
        <span className="micro">THE EXPERIMENTAL SETUP</span>
        <span className="panel-index">01 / 02</span>
      </div>
      <div className="intro">
        <h2>
          A word.
          <br />
          An expectation.
        </h2>
        <p>
          Explore the space where a familiar word meets an unexpected object.
        </p>
      </div>
      <label className="field-label" htmlFor="camera">
        CAMERA VIEW
      </label>
      <div className="select-wrap">
        <select
          id="camera"
          value={preset}
          onChange={(e) => onPreset(e.target.value as CameraPreset)}
        >
          {CAMERAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <span>⌄</span>
      </div>
      <div className="view-options">
        <button aria-pressed={labels} onClick={onLabels}>
          {labels ? "Hide" : "Show"} labels
        </button>
        <button aria-pressed={inspectWindow} onClick={onWindow}>
          {inspectWindow ? "Close" : "Open"} window
        </button>
      </div>
      {item ? (
        <div className="selection-detail" key={selected} aria-live="polite">
          <div className="selection-heading">
            <span className="micro">{item.tag}</span>
            <button
              className="close-button"
              onClick={() => onSelect(null)}
              aria-label="Close element details"
            >
              ×
            </button>
          </div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          {selected === "eeg" && (
            <button
              className="text-button"
              onClick={() => onPreset("EEG focus")}
            >
              Focus on electrodes ↗
            </button>
          )}
        </div>
      ) : (
        <div className="setup-summary">
          <span className="micro">A CONTROLLED LINE OF SIGHT</span>
          <p>
            Two zones. Three occluders.
            <br />
            One electronically controlled window.
          </p>
          <span className="small-muted">
            Select a part of the model to learn more.
          </span>
        </div>
      )}
      <details className="parts-list">
        <summary>
          All setup elements <span>13</span>
        </summary>
        <div>
          {(Object.keys(ELEMENTS) as ElementId[]).map((id) => (
            <button
              key={id}
              onClick={() => onSelect(id)}
              aria-pressed={selected === id}
            >
              {id === "dog"
                ? "Dog"
                : id === "companion"
                  ? "O2 / E2"
                  : id === "owner"
                    ? "Owner O1"
                    : id === "experimenter"
                      ? "Experimenter E1"
                      : id === "eeg"
                        ? "EEG electrodes"
                        : id === "window"
                          ? "Electric window"
                          : id === "objects"
                            ? "Hidden objects"
                            : id === "inner"
                              ? "Inner zone"
                              : id === "outer"
                                ? "Outer zone"
                                : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
      </details>
    </aside>
  );
}
export function ResearchNotes() {
  return (
    <div className="research-notes">
      <details>
        <summary>
          Why this design works <span>+</span>
        </summary>
        <div>
          <p>{COPY.why}</p>
          <p>{COPY.behavioral}</p>
          <a href={PAPER_URL} target="_blank" rel="noreferrer">
            Read Boros et al. (2024) ↗
          </a>
        </div>
      </details>
      <details>
        <summary>
          Reconstruction notes <span>+</span>
        </summary>
        <div>
          <p>{COPY.notes}</p>
          <p>{COPY.assumptions}</p>
          <p>
            {AUTHOR_VALIDATED
              ? "Experimental arrangement confirmed with the study authors."
              : "Schematic reconstruction based on published methods — not author-validated."}
          </p>
          {AUTHOR_VALIDATION_NOTE && <p>{AUTHOR_VALIDATION_NOTE}</p>}
        </div>
      </details>
    </div>
  );
}
