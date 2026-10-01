"use client";
import { RoundedBox, Line, Html } from "@react-three/drei";
import { Vector3, Quaternion } from "three";
import type { ObjectKind } from "@/lib/experimentData";
type Vec = [number, number, number];
export function Block({
  position = [0, 0, 0],
  size,
  color = "#777d79",
  radius = 0.05,
  rotation = [0, 0, 0],
}: {
  position?: Vec;
  size: Vec;
  color?: string;
  radius?: number;
  rotation?: Vec;
}) {
  return (
    <RoundedBox
      position={position}
      args={size}
      radius={radius}
      smoothness={3}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.84} />
    </RoundedBox>
  );
}
function Form({
  position,
  scale,
  color = "#b2ab9e",
  detail = 2,
}: {
  position: Vec;
  scale: Vec;
  color?: string;
  detail?: number;
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <icosahedronGeometry args={[1, detail]} />
      <meshStandardMaterial color={color} roughness={0.92} flatShading />
    </mesh>
  );
}
export function Rod({
  from,
  to,
  radius = 0.045,
  color = "#555d5a",
}: {
  from: Vec;
  to: Vec;
  radius?: number;
  color?: string;
}) {
  const a = new Vector3(...from),
    b = new Vector3(...to),
    delta = b.clone().sub(a);
  const quaternion = new Quaternion().setFromUnitVectors(
    new Vector3(0, 1, 0),
    delta.clone().normalize(),
  );
  return (
    <mesh
      position={a.add(b).multiplyScalar(0.5)}
      quaternion={quaternion}
      castShadow
    >
      <cylinderGeometry args={[radius, radius, delta.length(), 12]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
export function Human({
  position,
  rotation = 0,
  tone = "#a6ada9",
  raised = false,
}: {
  position: Vec;
  rotation?: number;
  tone?: string;
  raised?: boolean;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Block
        position={[0, 0.69, -0.1]}
        size={[0.72, 0.13, 0.68]}
        color="#454d4b"
      />
      <Block
        position={[0, 1.18, -0.39]}
        size={[0.73, 0.95, 0.12]}
        color="#454d4b"
      />
      {[-0.27, 0.27].flatMap((x) =>
        [-0.34, 0.15].map((z) => (
          <Rod
            key={`${x}-${z}`}
            from={[x, 0.08, z]}
            to={[x, 0.64, z]}
            radius={0.027}
          />
        )),
      )}
      <Form position={[0, 1.32, 0]} scale={[0.38, 0.59, 0.24]} color={tone} />
      <Form
        position={[0, 2.12, 0.015]}
        scale={[0.23, 0.31, 0.235]}
        color="#c5bfb2"
      />
      <Rod
        from={[0, 1.69, 0]}
        to={[0, 1.9, 0]}
        radius={0.095}
        color="#c5bfb2"
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Rod
            from={[side * 0.2, 0.81, 0.02]}
            to={[side * 0.25, 0.72, 0.52]}
            radius={0.13}
            color={tone}
          />
          <Rod
            from={[side * 0.25, 0.72, 0.52]}
            to={[side * 0.25, 0.16, 0.57]}
            radius={0.1}
            color={tone}
          />
          <Form
            position={[side * 0.25, 0.13, 0.69]}
            scale={[0.14, 0.1, 0.26]}
            color="#6d7471"
          />
          <Rod
            from={[side * 0.34, 1.59, 0.02]}
            to={[side * 0.47, 1.17, 0.27]}
            radius={0.095}
            color={tone}
          />
          <Rod
            from={[side * 0.47, 1.17, 0.27]}
            to={[side * 0.22, raised ? 1.98 : 1.02, raised ? 0.57 : 0.58]}
            radius={0.075}
            color={tone}
          />
          <Form
            position={[side * 0.22, raised ? 1.98 : 1.02, 0.58]}
            scale={[0.09, 0.12, 0.1]}
            color="#c5bfb2"
          />
        </group>
      ))}
    </group>
  );
}
export function Dog({ electrodes = false }: { electrodes?: boolean }) {
  return (
    <group position={[0, 0.2, 2.05]}>
      <Form position={[0, 0.35, 0.1]} scale={[0.4, 0.4, 0.77]} />
      <Form position={[0, 0.47, -0.42]} scale={[0.34, 0.42, 0.37]} />
      <Form
        position={[0, 0.77, -0.69]}
        scale={[0.285, 0.32, 0.34]}
        color="#c0b8a6"
      />
      <Form
        position={[0, 0.65, -1.0]}
        scale={[0.19, 0.16, 0.29]}
        color="#b0a690"
      />
      <Form
        position={[0, 0.68, -1.23]}
        scale={[0.14, 0.09, 0.06]}
        color="#4b4d47"
      />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Form
            position={[s * 0.26, 0.77, -0.64]}
            scale={[0.12, 0.28, 0.18]}
            color="#8c8372"
          />
          <Form
            position={[s * 0.28, 0.13, -0.66]}
            scale={[0.13, 0.13, 0.53]}
            color="#b5ad9b"
          />
          <Form
            position={[s * 0.31, 0.21, 0.64]}
            scale={[0.22, 0.24, 0.37]}
            color="#a59c8b"
          />
          <mesh position={[s * 0.23, 0.77, -0.91]}>
            <sphereGeometry args={[0.024, 8, 8]} />
            <meshStandardMaterial color="#343b37" />
          </mesh>
        </group>
      ))}
      <Line
        points={[
          [0.12, 0.29, 0.69],
          [0.37, 0.2, 1.02],
          [0.57, 0.16, 1.03],
          [0.71, 0.17, 0.81],
        ]}
        color="#9d9482"
        lineWidth={13}
      />
      <Line
        points={[
          [-0.28, 0.69, -0.46],
          [0, 0.86, -0.45],
          [0.28, 0.69, -0.46],
        ]}
        color="#505c5a"
        lineWidth={3}
      />
      {["Fz", "FCz", "Cz", "Pz"].map((label, i) => (
        <group key={label} position={[0, 1.044 - i * 0.017, -0.87 + i * 0.145]}>
          <mesh>
            <cylinderGeometry args={[0.034, 0.038, 0.018, 16]} />
            <meshStandardMaterial color="#afd5ce" roughness={0.55} />
          </mesh>
          {electrodes && (
            <Html
              position={[i % 2 === 0 ? -0.21 : 0.21, 0.15 + i * 0.1, 0]}
              center
              className="electrode-label"
              style={
                label === "Pz"
                  ? { transform: "translate(-125%, -160%)" }
                  : undefined
              }
              zIndexRange={[20, 0]}
            >
              {label === "Pz" ? "Pz · reference" : label}
            </Html>
          )}
        </group>
      ))}
      <Line
        points={[
          [0, 1.0, -0.42],
          [0.27, 0.83, -0.25],
          [0.5, 0.41, 0.11],
          [0.68, 0.05, 0.62],
          [1.38, -0.08, 0.86],
          [1.65, -0.09, 0.61],
        ]}
        color="#759892"
        lineWidth={1.2}
      />
    </group>
  );
}
export function StimulusObject({
  kind,
  scale = 1,
}: {
  kind: ObjectKind;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      {kind === "ball" && (
        <mesh castShadow>
          <sphereGeometry args={[0.19, 32, 20]} />
          <meshStandardMaterial color="#a9bdb1" roughness={0.9} />
        </mesh>
      )}
      {kind === "ball" && (
        <mesh rotation={[0.35, 0, 0.5]}>
          <torusGeometry args={[0.19, 0.009, 8, 48]} />
          <meshStandardMaterial color="#e2e3cf" />
        </mesh>
      )}
      {kind === "frisbee" && (
        <group rotation={[0.65, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.28, 0.045, 48]} />
            <meshStandardMaterial color="#bda483" roughness={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.283, 0.023, 10, 48]} />
            <meshStandardMaterial color="#caba9f" />
          </mesh>
        </group>
      )}
      {kind === "rope" && (
        <group rotation={[0, 0, 0.6]}>
          <Rod
            from={[-0.24, 0, 0]}
            to={[0.24, 0, 0]}
            radius={0.055}
            color="#b4a68d"
          />
          {[-0.25, 0.25].map((x) => (
            <Form
              key={x}
              position={[x, 0, 0]}
              scale={[0.105, 0.095, 0.085]}
              color="#b4a68d"
            />
          ))}
        </group>
      )}
      {kind === "toy" && (
        <group>
          <Form position={[0, 0, 0]} scale={[0.15, 0.2, 0.1]} color="#a99b96" />
          <Form
            position={[0, 0.22, 0]}
            scale={[0.13, 0.13, 0.1]}
            color="#a99b96"
          />
          {[-1, 1].map((s) => (
            <group key={s}>
              <Form
                position={[s * 0.11, 0.32, 0]}
                scale={[0.055, 0.055, 0.05]}
                color="#a99b96"
              />
              <Form
                position={[s * 0.17, 0.01, 0]}
                scale={[0.09, 0.06, 0.06]}
                color="#a99b96"
              />
              <Form
                position={[s * 0.1, -0.19, 0]}
                scale={[0.065, 0.1, 0.065]}
                color="#a99b96"
              />
            </group>
          ))}
        </group>
      )}
      {kind === "cup" && (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.105, 0.29, 32, 1, true]} />
            <meshStandardMaterial color="#b9bbb5" side={2} roughness={0.68} />
          </mesh>
          <mesh position={[0.14, 0, 0]}>
            <torusGeometry args={[0.095, 0.025, 10, 24]} />
            <meshStandardMaterial color="#b9bbb5" roughness={0.68} />
          </mesh>
        </group>
      )}
    </group>
  );
}
