import * as THREE from "three";

// Compute signed volume of a triangle given by points a, b, c
function signedVolumeOfTriangle(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) {
  return a.dot(b.clone().cross(c)) / 6.0;
}

// Returns volume in mm^3
export function computeGeometryVolumeMM3(geometry: THREE.BufferGeometry): number {
  // Ensure we work on a non-indexed geometry for triangle iteration
  const geom = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  // Ensure position attribute exists
  const pos = geom.getAttribute("position");
  if (!pos) return 0;

  let volume = 0;
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  for (let i = 0; i < pos.count; i += 3) {
    vA.fromBufferAttribute(pos as THREE.BufferAttribute, i + 0);
    vB.fromBufferAttribute(pos as THREE.BufferAttribute, i + 1);
    vC.fromBufferAttribute(pos as THREE.BufferAttribute, i + 2);
    volume += signedVolumeOfTriangle(vA, vB, vC);
  }

  return Math.abs(volume);
}

// Returns the axis-aligned bounding box size (width, height, depth) in mm
export function computeGeometrySizeMM(geometry: THREE.BufferGeometry): THREE.Vector3 {
  const geom = geometry.clone();
  geom.computeBoundingBox();
  const box = geom.boundingBox ?? new THREE.Box3();
  const size = new THREE.Vector3();
  box.getSize(size);
  return size;
}
