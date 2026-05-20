import { Suspense, useMemo, useEffect, useState, useRef, memo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function RingModel({ url, materialProps, widthScale }) {
  const { scene } = useGLTF(url);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) child.material = child.material.clone();
    });

    // Normalize orientation to upright (hole along Z, band in XY plane, prong at top Y).
    // The axis with the smallest bounding-box extent is the band thickness = hole direction.
    c.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(c).getSize(new THREE.Vector3());
    if (size.y < size.x && size.y < size.z) {
      // Flat (hole along Y) → rotate to upright
      c.rotation.x = -Math.PI / 2;
    } else if (size.x < size.y && size.x < size.z) {
      // On its side (hole along X) → rotate to upright
      c.rotation.y = Math.PI / 2;
    }
    // size.z smallest → already upright, no rotation needed

    return c;
  }, [scene]);

  useEffect(() => {
    return () => {
      cloned.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => m?.dispose());
      });
    };
  }, [cloned]);

  useEffect(() => {
    if (!materialProps) return;
    const [r, g, b] = materialProps.color;
    cloned.traverse((child) => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        m.color.setRGB(r, g, b);
        m.metalness = materialProps.metallic;
        m.roughness = materialProps.roughness;
        m.needsUpdate = true;
      });
    });
  }, [cloned, materialProps]);

  return <primitive object={cloned} scale={[1, widthScale ?? 1, 1]} />;
}

// Find the world-space position of the highest-Y vertex in an object.
// For a ring with prongs/stone-holder, this is the prong tip — which is
// where the gem should be seated. Works for any ring orientation because
// prongs are by design the tallest feature of the ring.
function findProngTip(object) {
  let maxY = -Infinity;
  const result = new THREE.Vector3();
  const v = new THREE.Vector3();
  object.traverse((child) => {
    if (!child.isMesh) return;
    const pos = child.geometry?.attributes?.position;
    if (!pos) return;
    child.updateMatrixWorld(true);
    const mat = child.matrixWorld;
    // Sample at most ~2000 vertices per mesh to keep this fast
    const step = Math.max(1, Math.floor(pos.count / 2000));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mat);
      if (v.y > maxY) {
        maxY = v.y;
        result.copy(v);
      }
    }
  });
  return maxY > -Infinity ? result : null;
}

function GemModel({ url, ringRef }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const [transform, setTransform] = useState(null);

  useEffect(() => {
    return () => {
      cloned.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => m?.dispose());
      });
    };
  }, [cloned]);

  useEffect(() => {
    const compute = () => {
      if (!ringRef.current) return null;
      ringRef.current.updateMatrixWorld(true);
      cloned.updateMatrixWorld(true);

      const ringBox = new THREE.Box3().setFromObject(ringRef.current);
      const gemBox = new THREE.Box3().setFromObject(cloned);
      if (ringBox.isEmpty() || gemBox.isEmpty()) return null;

      const ringSize = ringBox.getSize(new THREE.Vector3());
      const gemSize = gemBox.getSize(new THREE.Vector3());
      const gemCenter = gemBox.getCenter(new THREE.Vector3());

      if (ringSize.y < 0.001 || gemSize.y < 0.001) return null;
      const gemMax = Math.max(gemSize.x, gemSize.y, gemSize.z);
      if (gemMax > ringSize.y * 10) return null;

      // Scale gem to 22% of ring's Y height (band's outer diameter for upright,
      // band thickness + prong height for flat rings — works either way)
      const s = (ringSize.y * 0.22) / gemMax;

      // Locate the actual prong tip (highest-Y vertex), not the bbox center.
      // The bbox center can be off when the ring has stray geometry in X/Z.
      const prong = findProngTip(ringRef.current);
      if (!prong) return null;

      // Anchor gem's bottom vertex just inside the prong tip (15% overlap),
      // centered horizontally on the prong's X/Z position.
      const overlap = gemSize.y * s * 0.15;
      const posY = prong.y - overlap - gemBox.min.y * s;
      const posX = prong.x - gemCenter.x * s;
      const posZ = prong.z - gemCenter.z * s;

      return { position: [posX, posY, posZ], scale: s };
    };

    const t = compute();
    if (t) {
      setTransform(t);
      return;
    }
    const raf = requestAnimationFrame(() => {
      const t2 = compute();
      if (t2) setTransform(t2);
    });
    return () => cancelAnimationFrame(raf);
  }, [ringRef, cloned]);

  if (!transform) return null;

  return (
    <primitive
      object={cloned}
      position={transform.position}
      scale={transform.scale}
    />
  );
}

function CameraAdjust({ ringScene }) {
  const { camera } = useThree();
  useMemo(() => {
    ringScene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(ringScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = (maxDim / 2) / Math.tan((camera.fov * Math.PI) / 360) * 2.2;
    // 3/4 view: elevated + side angle
    camera.position.set(center.x, center.y + dist * 0.5, center.z + dist * 0.9);
    camera.near = dist / 100;
    camera.far = dist * 20;
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }, [ringScene, camera]);
  return null;
}

function Scene({ ringUrl, gemUrl, materialProps, ringWidthScale }) {
  const { scene: ringScene } = useGLTF(ringUrl);
  const ringRef = useRef();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-4, -4, -4]} intensity={0.4} />
      <CameraAdjust ringScene={ringScene} />
      <Environment preset="studio" />
      <group ref={ringRef}>
        <RingModel url={ringUrl} materialProps={materialProps} widthScale={ringWidthScale} />
      </group>
      {gemUrl && <GemModel url={gemUrl} ringRef={ringRef} />}
      <OrbitControls
        autoRotate
        autoRotateSpeed={1.5}
        enablePan={false}
      />
    </>
  );
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.1]} />
      <meshBasicMaterial color="#b08d26" />
    </mesh>
  );
}

function JewelryViewer({ ringUrl, gemUrl, materialProps, ringWidthScale }) {
  if (!ringUrl) return null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'radial-gradient(ellipse at center, #2a2520 0%, #0f0e0c 100%)',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 35 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={<Loader />}>
          <Scene ringUrl={ringUrl} gemUrl={gemUrl} materialProps={materialProps} ringWidthScale={ringWidthScale} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default memo(JewelryViewer);
