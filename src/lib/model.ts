import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

function fileToArrayBuffer(
  file: File,
  opts?: { onProgress?: (progress01: number) => void },
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e: ProgressEvent<FileReader>) => {
      if (e.lengthComputable && opts?.onProgress) {
        const pct = e.total ? e.loaded / e.total : 0;
        opts.onProgress(pct);
      }
    };
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function mergeGeometriesFromObject(object: THREE.Object3D): THREE.BufferGeometry | null {
  const geoms: THREE.BufferGeometry[] = [];
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if ((mesh as any).isMesh && mesh.geometry) {
      const g = mesh.geometry.clone();
      g.applyMatrix4(mesh.matrixWorld);
      geoms.push(g);
    }
  });
  if (geoms.length === 0) return null;
  return mergeGeometries(geoms, false) as THREE.BufferGeometry;
}

export async function loadGeometryFromFile(
  file: File,
  opts?: { onReadProgress?: (progress01: number) => void; onParsingStart?: () => void },
): Promise<THREE.BufferGeometry | null> {
  const ab = await fileToArrayBuffer(file, { onProgress: opts?.onReadProgress });
  opts?.onParsingStart?.();
  const ext = file.name.toLowerCase().split(".").pop();

  if (ext === "stl") {
    const loader = new STLLoader();
    const geom = loader.parse(ab);
    geom.computeVertexNormals();
    return geom;
  }

  if (ext === "3mf") {
    const loader = new ThreeMFLoader();
    const group = loader.parse(ab);
    const geom = mergeGeometriesFromObject(group);
    if (geom) geom.computeVertexNormals();
    return geom;
  }

  // STEP requires a CAD parser (e.g. OpenCascade WASM). Not supported in MVP.
  return null;
}
