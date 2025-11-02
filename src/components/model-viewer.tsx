"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { TrackballControls, Bounds, useBounds } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";

export type ModelViewerProps = {
  geometry: THREE.BufferGeometry | null;
  className?: string;
  color?: string;
  background?: string;
  scale?: number;
};

function FitOnChange({ deps }: { deps: any[] }) {
  const api = useBounds();
  useEffect(() => {
    api.fit();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function ModelMesh({ geometry, color = "#888" }: { geometry: THREE.BufferGeometry; color?: string }) {
  // Center geometry around origin
  const centered = useMemo(() => {
    const g = geometry.clone();
    g.computeBoundingBox();
    const box = g.boundingBox ?? new THREE.Box3();
    const center = new THREE.Vector3();
    box.getCenter(center);
    g.translate(-center.x, -center.y, -center.z);
    g.computeVertexNormals();
    return g;
  }, [geometry]);

  return (
    <mesh geometry={centered} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
    </mesh>
  );
}

export function ModelViewer({ geometry, className, color = "#6b7280", background = "var(--muted)", scale = 1 }: ModelViewerProps) {
  return (
    <div className={className} style={{ height: 360, width: "100%", borderRadius: 12, overflow: "hidden" }}>
      <Canvas shadows camera={{ position: [0, 0, 140], fov: 45 }} style={{ background }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={0.7} castShadow />
        <TrackballControls makeDefault rotateSpeed={1} zoomSpeed={1.2} panSpeed={0.8} />
        <Bounds clip fit margin={1.2}>
          {geometry ? (
            <group scale={[scale, scale, scale]}>
              <ModelMesh geometry={geometry} color={color} />
            </group>
          ) : null}
          <FitOnChange deps={[geometry, scale]} />
        </Bounds>
      </Canvas>
    </div>
  );
}
