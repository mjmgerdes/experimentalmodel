"use client";
import {
  memo,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { Group, MeshStandardMaterial, MathUtils } from "three";
import { Block, Dog, Human, StimulusObject, Rod } from "./Models";
import CameraController from "./CameraController";
import type { CameraPreset, ElementId, Condition } from "@/lib/experimentData";
import { OBJECTS } from "@/lib/experimentData";
import type { TrialStep } from "@/lib/trialStates";
type Vec = [number, number, number];
interface SceneProps {
  step: TrialStep;
  trial: boolean;
  condition: Condition;
  selected: ElementId | null;
  onSelect: (id: ElementId | null) => void;
  preset: CameraPreset;
  resetKey: number;
  reducedMotion: boolean;
  inspectWindow: boolean;
  labels: boolean;
  timeRef: RefObject<number>;
}
function Annotation({
  portal,
  position,
  children,
}: {
  portal: RefObject<HTMLDivElement | null>;
  position: Vec;
  children: ReactNode;
}) {
  return (
    <Html
      portal={portal as RefObject<HTMLElement>}
      position={position}
      center
      zIndexRange={[10, 0]}
      className="scene-annotation"
    >
      <span>{children}</span>
    </Html>
  );
}
function ElectricGlass({
  clear,
  reveal,
  reducedMotion,
}: {
  clear: boolean;
  reveal: boolean;
  reducedMotion: boolean;
}) {
  const material = useRef<MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    if (material.current)
      material.current.opacity = reveal
        ? 0.09
        : MathUtils.damp(
            material.current.opacity,
            clear ? 0.09 : 1,
            reducedMotion ? 1000 : 10,
            dt,
          );
  });
  return (
    <mesh position={[0, 1.99, 0]} castShadow={!clear}>
      <boxGeometry args={[3.08, 1.4, 0.065]} />
      <meshStandardMaterial
        ref={material}
        color={clear ? "#bfdad4" : "#c7d0ca"}
        transparent
        opacity={1}
        roughness={clear ? 0.2 : 0.85}
        metalness={0.08}
        depthWrite={!clear}
      />
    </mesh>
  );
}
function HeldObject({
  step,
  condition,
  reducedMotion,
}: {
  step: TrialStep;
  condition: Condition;
  reducedMotion: boolean;
}) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current)
      ref.current.position.y =
        step === 4
          ? 2.1
          : MathUtils.damp(
              ref.current.position.y,
              step === 3 ? 2.1 : 0.84,
              reducedMotion ? 1000 : 14,
              dt,
            );
  });
  return (
    <group
      ref={ref}
      position={[0, 0.84, -1.05]}
      visible={step >= 1 && step <= 4}
    >
      <StimulusObject
        kind={condition === "match" ? "ball" : "frisbee"}
        scale={1.2}
      />
    </group>
  );
}
function SoundWaves({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = reducedMotion
        ? 1
        : 1 + Math.sin(clock.elapsedTime * 3) * 0.025;
      ref.current.scale.setScalar(pulse);
    }
  });
  return (
    <group ref={ref} visible={active}>
      {[-1.13, 1.13].flatMap((x) =>
        [0.3, 0.55, 0.8].map((r, i) => (
          <Line
            key={`${x}-${r}`}
            points={Array.from(
              { length: 25 },
              (_, j) =>
                [
                  x + Math.sin((j / 24 - 0.5) * 1.6) * r,
                  0.45,
                  -0.9 + Math.cos((j / 24 - 0.5) * 1.6) * r,
                ] as Vec,
            )}
            color="#94bdb6"
            transparent
            opacity={0.6 - i * 0.12}
            lineWidth={1}
          />
        )),
      )}
    </group>
  );
}
const SelectionContext = createContext<{
  selected: ElementId | null;
  onSelect: (id: ElementId | null) => void;
}>({ selected: null, onSelect: () => {} });
function Pick({
  id,
  children,
  position = [0, 0, 0],
  ring,
}: {
  id: ElementId;
  children: ReactNode;
  position?: Vec;
  ring?: [number, number];
}) {
  const { selected, onSelect } = useContext(SelectionContext);
  return (
    <group
      position={position}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}
      {selected === id && ring && (
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={ring} />
          <meshBasicMaterial color="#9bbdb6" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}
function MonitorReadout({
  step,
  condition,
  timeRef,
}: {
  step: TrialStep;
  condition: Condition;
  timeRef: RefObject<number>;
}) {
  const text = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame: number;
    const tick = () => {
      if (text.current)
        text.current.textContent =
          step === 1
            ? condition === "match"
              ? "BALL"
              : "FRISBEE"
            : step === 3
              ? Math.max(0, (1000 - timeRef.current) / 1000).toFixed(1)
              : step === 4
                ? Math.max(0, (2000 - timeRef.current) / 1000).toFixed(1)
                : "READY";
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [step, condition, timeRef]);
  return <span ref={text} />;
}
function SceneContent(props: SceneProps & {portal: RefObject<HTMLDivElement | null>}) {
  const {
    step,
    trial,
    condition,
    selected,
    onSelect,
    preset,
    reducedMotion,
    inspectWindow,
    labels,
  } = props;
  const clear = trial ? step === 2 || step === 4 : inspectWindow;

  return (
    <SelectionContext.Provider value={{ selected, onSelect }}>
      <color attach="background" args={["#202724"]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#e3e6da", "#3f5047", 1.65]} />
      <directionalLight
        position={[-5, 11, 6]}
        intensity={3.2}
        color="#fff3da"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-normalBias={0.035}
        shadow-radius={4}
      />
      <directionalLight position={[5, 6, -6]} intensity={1.4} color="#b8d7d2" />
      <Block
        position={[0.45, -0.17, 0]}
        size={[8.2, 0.3, 8.1]}
        color="#404a44"
        radius={0.14}
      />
      <Pick id="inner">
        <Block
          position={[0.45, 0.001, 1.99]}
          size={[8.12, 0.055, 4.04]}
          color="#59625a"
          radius={0.035}
        />
      </Pick>
      <Pick id="outer">
        <Block
          position={[0.45, 0.002, -2.02]}
          size={[8.12, 0.055, 3.97]}
          color="#47534d"
          radius={0.035}
        />
      </Pick>
      <Line
        points={[
          [-3.55, 0.036, 0],
          [4.43, 0.036, 0],
        ]}
        color="#8d9c90"
        lineWidth={1}
        dashed
        dashSize={0.07}
        gapSize={0.08}
      />
      {/* Three occluders: central partition plus two outer-zone wings. */}
      <group>
        <Block
          position={[-1.93, 1.55, -1.33]}
          size={[0.14, 3.1, 2.8]}
          color="#8b9589"
        />
        <Block
          position={[1.93, 1.55, -1.33]}
          size={[0.14, 3.1, 2.8]}
          color="#8b9589"
        />
        <Block
          position={[0, 0.59, 0]}
          size={[3.98, 1.18, 0.15]}
          color="#a6afa1"
        />
        <Block
          position={[0, 2.94, 0]}
          size={[3.98, 0.32, 0.15]}
          color="#a6afa1"
        />
        {[-1.76, 1.76].map((x) => (
          <Block
            key={x}
            position={[x, 1.99, 0]}
            size={[0.45, 1.65, 0.15]}
            color="#a6afa1"
          />
        ))}
        <Pick id="window">
          <ElectricGlass
            clear={clear}
            reveal={trial && step === 4}
            reducedMotion={reducedMotion}
          />
          <Line
            points={[
              [-1.58, 1.25, 0.087],
              [-1.58, 2.72, 0.087],
              [1.58, 2.72, 0.087],
              [1.58, 1.25, 0.087],
              [-1.58, 1.25, 0.087],
            ]}
            color={selected === "window" ? "#badbd1" : "#59695f"}
            lineWidth={2}
          />
        </Pick>
      </group>
      <Pick id="mattress">
        <Block
          position={[0, 0.135, 2.17]}
          size={[1.55, 0.22, 2.65]}
          color="#8b9489"
          radius={0.11}
        />
        <Block
          position={[0, 0.251, 2.17]}
          size={[1.46, 0.03, 2.55]}
          color="#9ca396"
          radius={0.014}
        />
      </Pick>
      <Pick id={preset === "EEG focus" ? "eeg" : "dog"}>
        <Dog
          electrodes={
            preset === "EEG focus" || selected === "eeg" || selected === "dog"
          }
        />
      </Pick>
      <Pick id="eeg" position={[1.68, 0.15, 2.67]} ring={[0.3, 0.32]}>
        <Block size={[0.43, 0.23, 0.54]} color="#384c47" />
        <Block
          position={[0, 0.12, 0]}
          size={[0.29, 0.025, 0.24]}
          color="#88b2a7"
        />
      </Pick>
      <Pick id="companion" position={[-1.47, 0, 2.39]} ring={[0.6, 0.615]}>
        <Human position={[0, 0, 0]} rotation={Math.PI + 0.25} tone="#838f88" />
      </Pick>
      <Pick id="owner" position={[0, 0, -1.75]} ring={[0.65, 0.67]}>
        <Human
          position={[0, 0, 0]}
          tone="#b8baaa"
          raised={trial && (step === 3 || step === 4)}
        />
      </Pick>
      <HeldObject
        step={trial ? step : 0}
        condition={condition}
        reducedMotion={reducedMotion}
      />
      <Pick id="monitor">
        <Block
          position={[0, 0.81, -0.23]}
          size={[0.91, 0.54, 0.08]}
          color="#293934"
          rotation={[-0.14, 0, 0]}
        />
        <Block
          position={[0, 0.81, -0.281]}
          size={[0.78, 0.41, 0.015]}
          color={trial && step === 1 ? "#acc6b9" : "#58736a"}
          rotation={[-0.14, 0, 0]}
        />
        {trial && step > 0 && (
          <Html
            position={[0, 0.83, -0.34]}
            rotation={[0, Math.PI, 0]}
            transform
            distanceFactor={2.3}
            zIndexRange={[2, 0]}
            occlude
            className="monitor-text"
          >
            <MonitorReadout
              step={step}
              condition={condition}
              timeRef={props.timeRef}
            />
          </Html>
        )}
      </Pick>
      <Pick id="speakers">
        {[-1.15, 1.15].map((x) => (
          <group key={x} position={[x, 0.26, -0.83]}>
            <Block size={[0.31, 0.46, 0.29]} color="#35413a" />
            {[0.12, -0.1].map((y, i) => (
              <mesh
                key={y}
                position={[0, y, 0.15]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry
                  args={[i ? 0.065 : 0.088, i ? 0.065 : 0.088, 0.01, 24]}
                />
                <meshStandardMaterial color="#69776b" roughness={0.95} />
              </mesh>
            ))}
          </group>
        ))}
      </Pick>
      <SoundWaves active={trial && step === 2} reducedMotion={reducedMotion} />
      <Pick id="objects" position={[-1.2, 0, -2.3]} ring={[0.46, 0.48]}>
        <Block position={[0, 0.37, 0]} size={[0.9, 0.7, 0.8]} color="#606c60" />
        <Block
          position={[0, 0.74, 0]}
          size={[1.0, 0.055, 0.86]}
          color="#939b88"
        />
        {OBJECTS.map((o, i) => (
          <group
            key={o.kind}
            position={[
              (i % 2) * 0.41 - 0.2,
              0.9,
              -0.24 + Math.floor(i / 2) * 0.22,
            ]}
          >
            <StimulusObject kind={o.kind} scale={0.61} />
          </group>
        ))}
      </Pick>
      <Pick id="experimenter" position={[3.04, 0, -1.76]} ring={[0.58, 0.6]}>
        <Human position={[0, 0, 0]} rotation={-0.25} tone="#788b85" />
        <Block
          position={[0, 0.86, 0.88]}
          size={[1.15, 0.08, 0.68]}
          color="#778578"
        />
        {[-0.48, 0.48].map((x) => (
          <Rod
            key={x}
            from={[x, 0.04, 0.88]}
            to={[x, 0.83, 0.88]}
            radius={0.035}
          />
        ))}
        <Block
          position={[0, 1.14, 1.0]}
          size={[0.66, 0.43, 0.045]}
          color="#293d35"
          rotation={[0.1, 0, 0]}
        />
        <Block
          position={[0, 0.92, 0.79]}
          size={[0.69, 0.025, 0.36]}
          color="#a1b0a0"
        />
      </Pick>
      <Pick id="webcam" position={[0.92, 2.91, 0.19]}>
        <Block size={[0.22, 0.12, 0.14]} color="#364a40" radius={0.025} />
        <mesh position={[0, 0, 0.079]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.037, 0.037, 0.025, 16]} />
          <meshStandardMaterial
            color="#abc5b8"
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      </Pick>
      {labels && (
        <>
          <Annotation portal={props.portal} position={[-2.75, 0.08, 1.45]}>
            01 / INNER ZONE
          </Annotation>
          <Annotation portal={props.portal} position={[2.95, 0.05, -3.12]}>
            02 / OUTER ZONE
          </Annotation>
          <Annotation portal={props.portal} position={[0.02, 1.65, 2.39]}>
            Dog <i>+ scalp EEG</i>
          </Annotation>
          <Annotation portal={props.portal} position={[-1.69, 2.72, 2.37]}>O2 / E2</Annotation>
          <Annotation portal={props.portal} position={[0, 2.89, -1.85]}>Owner O1</Annotation>
          <Annotation portal={props.portal} position={[3.15, 2.75, -1.76]}>
            E1 <i>experimenter</i>
          </Annotation>
          <Annotation portal={props.portal} position={[-0.05, 3.44, 0.02]}>
            Electric window <i>{clear ? "transparent" : "opaque"}</i>
          </Annotation>
        </>
      )}
      <CameraController
        preset={preset}
        resetKey={props.resetKey}
        reducedMotion={reducedMotion}
      />
    </SelectionContext.Provider>
  );
}
function ExperimentScene(props: SceneProps) {
  const portal = useRef<HTMLDivElement>(null);
  return (
    <div className="model-host">
    <Canvas
      orthographic
      camera={{ position: [9, 24, -12], zoom: 60, near: 0.1, far: 80 }}
      dpr={[1, 1.7]}
      shadows="percentage"
      gl={{ antialias: true, alpha: false }}
      onPointerMissed={() => props.onSelect(null)}
      aria-label="Interactive schematic of the dog EEG experiment. Use the labeled setup list to inspect every element without interacting with the canvas."
    >
      <SceneContent {...props} portal={portal} />
    </Canvas>
    <div ref={portal} className="annotation-host"/>
    </div>
  );
}
export default memo(ExperimentScene);
