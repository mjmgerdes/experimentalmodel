"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";
import type { CameraPreset } from "@/lib/experimentData";
const VIEWS: Record<
  CameraPreset,
  {
    position: [number, number, number];
    target: [number, number, number];
    zoom: number;
  }
> = {
  Overview: { position: [9, 24, -12], target: [0.4, 0.35, 0], zoom: 61 },
  "Dog / Inner zone": {
    position: [5, 6.8, 8],
    target: [-0.25, 1.6, 1.3],
    zoom: 84,
  },
  "Owner / Outer zone": {
    position: [3.2, 12, -13],
    target: [0.25, 1.4, -1.2],
    zoom: 88,
  },
  "Side view": { position: [11, 7.8, 5.5], target: [0, 1, 0], zoom: 79 },
  "EEG focus": { position: [3, 8, 5.5], target: [0.4, 0.65, 1.9], zoom: 166 },
};
export default function CameraController({
  preset,
  resetKey,
  reducedMotion,
}: {
  preset: CameraPreset;
  resetKey: number;
  reducedMotion: boolean;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const lastKey = useRef("");
  const active = useRef(true);
  useFrame(({ camera, size }, delta) => {
    const key = `${preset}-${resetKey}-${size.width}-${size.height}`;
    if (lastKey.current !== key) {
      lastKey.current = key;
      active.current = true;
    }
    if (!active.current || !controls.current) return;
    const view = VIEWS[preset];
    const factor = reducedMotion ? 1 : 1 - Math.exp(-delta * 7);
    const position = new Vector3(...view.position),
      target = new Vector3(...view.target);
    const zoom =
      view.zoom * Math.min(size.width / 820, size.height / 650, 1.35);
    camera.position.lerp(position, factor);
    controls.current.target.lerp(target, factor);
    camera.zoom += (zoom - camera.zoom) * factor;
    camera.updateProjectionMatrix();
    controls.current.update();
    if (
      camera.position.distanceTo(position) < 0.005 &&
      Math.abs(camera.zoom - zoom) < 0.05
    )
      active.current = false;
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan
      enableDamping
      dampingFactor={0.09}
      minZoom={22}
      maxZoom={450}
      minPolarAngle={0.16}
      maxPolarAngle={Math.PI / 2.08}
      onStart={() => {
        active.current = false;
      }}
    />
  );
}
