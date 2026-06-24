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
        // Only dispose cloned materials (not geometry — geometry is shared with useGLTF cache)
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

function findInnerBottom(object) {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return null;

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  let minDistanceY = Infinity;
  const result = new THREE.Vector3();
  const v = new THREE.Vector3();

  const allowedXOffset = Math.max(0.45, size.x * 0.25);
  const allowedZOffset = Math.max(0.45, size.z * 0.45);

  object.traverse((child) => {
    if (!child.isMesh) return;
    const pos = child.geometry?.attributes?.position;
    if (!pos) return;
    child.updateMatrixWorld(true);
    const mat = child.matrixWorld;

    const step = Math.max(1, Math.floor(pos.count / 2000));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mat);
      if (v.y < center.y &&
          Math.abs(v.x - center.x) < allowedXOffset &&
          Math.abs(v.z - center.z) < allowedZOffset) {

        const distToCenter = center.y - v.y;
        if (distToCenter < minDistanceY) {
          minDistanceY = distToCenter;
          result.copy(v);
        }
      }
    }
  });

  return minDistanceY < Infinity ? result : null;
}

function EngravingModel({ engraving, engravingFont, ringRef, bandStyle, ringUrl, materialProps }) {
  const [surfaceData, setSurfaceData] = useState(null);

  useEffect(() => {
    if (!ringRef.current || !engraving) return;
    ringRef.current.updateMatrixWorld(true);

    const innerBottom = findInnerBottom(ringRef.current);
    if (!innerBottom) return;

    const box = new THREE.Box3().setFromObject(ringRef.current);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Find the inner surface normal at innerBottom point
    let surfaceNormal = new THREE.Vector3(0, -1, 0);
    let nearestDistance = Infinity;

    ringRef.current.traverse((child) => {
      if (!child.isMesh) return;
      const pos = child.geometry?.attributes?.position;
      if (!pos) return;
      child.updateMatrixWorld(true);
      const mat = child.matrixWorld;
      const v = new THREE.Vector3();

      for (let i = 0; i < pos.count; i += Math.max(1, Math.floor(pos.count / 500))) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mat);
        const dist = v.distanceTo(innerBottom);
        if (dist < nearestDistance && dist > 0.001) {
          nearestDistance = dist;
          // Approximate normal by checking neighboring vertices
          if (i > 0 && i < pos.count - 1) {
            const v1 = new THREE.Vector3().fromBufferAttribute(pos, i - 1).applyMatrix4(mat);
            const v2 = new THREE.Vector3().fromBufferAttribute(pos, i + 1).applyMatrix4(mat);
            const edge1 = new THREE.Vector3().subVectors(v2, v);
            const edge2 = new THREE.Vector3().subVectors(v1, v);
            surfaceNormal.crossVectors(edge1, edge2).normalize();
          }
        }
      }
    });

    // Calculate inner radius
    const innerRadius = Math.min(size.x, size.z) / 2.8;
    const circumference = Math.PI * innerRadius * 2;
    const charSpacing = circumference / (engraving.length + 1);
    const totalArc = charSpacing * engraving.length;
    const startAngle = Math.PI - (totalArc / (2 * innerRadius));

    const chars = [];
    for (let i = 0; i < engraving.length; i++) {
      const angle = startAngle + (i * charSpacing) / innerRadius;
      const x = center.x + innerRadius * Math.cos(angle);
      const z = center.z + innerRadius * Math.sin(angle);
      const y = innerBottom.y;

      // Offset INTO the ring along the surface normal
      const offsetDist = 0.015;
      const offsetPos = new THREE.Vector3(x, y, z).addScaledVector(surfaceNormal, -offsetDist);

      chars.push({
        char: engraving[i],
        position: [offsetPos.x, offsetPos.y, offsetPos.z],
        angle: angle + Math.PI / 2,
      });
    }

    setSurfaceData({
      chars,
      normal: surfaceNormal,
      innerRadius,
    });
  }, [ringRef, bandStyle, ringUrl, engraving]);

  const textColor = useMemo(() => {
    if (materialProps && materialProps.color) {
      const [r, g, b] = materialProps.color;
      return `#${Math.round(r * 0.7 * 255).toString(16).padStart(2, '0')}${Math.round(g * 0.7 * 255).toString(16).padStart(2, '0')}${Math.round(b * 0.7 * 255).toString(16).padStart(2, '0')}`;
    }
    return '#6b5441';
  }, [materialProps]);

  const showEngraving = engraving && bandStyle !== 'Twisted' && bandStyle !== 'Eternity';

  if (!showEngraving || !surfaceData) return null;

  // Create canvas texture for each character
  const createCharTexture = (char) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw char
    ctx.fillStyle = 'white';
    ctx.font = 'bold 100px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  };

  return (
    <group>
      {surfaceData.chars.map((charData, idx) => (
        <mesh key={idx} position={charData.position} rotation={[0, charData.angle, Math.PI]}>
          <planeGeometry args={[0.06, 0.09]} />
          <meshStandardMaterial
            map={createCharTexture(charData.char)}
            metalness={0.85}
            roughness={0.25}
            emissive="#333333"
            emissiveIntensity={0.2}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

const GEM_OPTICS_CONFIGS = {
  'Diamond': { color: '#ffffff', transmission: 1.0, roughness: 0.0, ior: 2.417, clearcoat: 1.0 },
  'Sapphire': { color: '#0f4c81', transmission: 0.9, roughness: 0.05, ior: 1.76, clearcoat: 0.8 },
  'Ruby': { color: '#9b111e', transmission: 0.9, roughness: 0.05, ior: 1.76, clearcoat: 0.8 },
  'Emerald': { color: '#046307', transmission: 0.85, roughness: 0.08, ior: 1.57, clearcoat: 0.8 },
  'Amethyst': { color: '#6a0dad', transmission: 0.9, roughness: 0.05, ior: 1.54, clearcoat: 0.8 },
  'Topaz': { color: '#00ced1', transmission: 0.92, roughness: 0.05, ior: 1.62, clearcoat: 0.8 },
};

const getGemConfig = (name) => {
  if (!name) return GEM_OPTICS_CONFIGS['Diamond'];
  const key = Object.keys(GEM_OPTICS_CONFIGS).find(k => k.toLowerCase() === name.toLowerCase());
  return GEM_OPTICS_CONFIGS[key] || GEM_OPTICS_CONFIGS['Diamond'];
};

function GemModel({ url, ringRef, gemstoneName, gemCarat, ringWidthScale, ringUrl }) {
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

  // Apply gemstone physics shader parameters
  useEffect(() => {
    const config = getGemConfig(gemstoneName);
    cloned.traverse((child) => {
      if (!child.isMesh) return;
      // Restore the original high-fidelity solid-crystal material from the GLB model
      // but clone it to prevent mutating the template cache
      child.material = child.material.clone();
      child.material.color.set(config.color);
    });
  }, [cloned, gemstoneName]);

  useEffect(() => {
    const compute = () => {
      if (!ringRef.current) return null;
      ringRef.current.updateMatrixWorld(true);
      cloned.updateMatrixWorld(true);

      const ringBox = new THREE.Box3().setFromObject(ringRef.current);
      // Use the pristine base scene geometry to avoid transformed feedback loops
      const gemBox = new THREE.Box3().setFromObject(scene);
      if (ringBox.isEmpty() || gemBox.isEmpty()) return null;

      const ringSize = ringBox.getSize(new THREE.Vector3());
      const gemSize = gemBox.getSize(new THREE.Vector3());
      const gemCenter = gemBox.getCenter(new THREE.Vector3());

      if (ringSize.y < 0.001 || gemSize.y < 0.001) return null;
      const gemMax = Math.max(gemSize.x, gemSize.y, gemSize.z);
      if (gemMax > ringSize.y * 10) return null;

      // Volumetric carat scale factor (base is 2.0 carats)
      const caratFactor = Math.pow((gemCarat || 2.0) / 2.0, 1 / 3);

      // Scale gem to 22% of ring's Y height, adjusted by carat factor
      const s = ((ringSize.y * 0.22) / gemMax) * caratFactor;

      // Locate the actual prong tip (highest-Y vertex)
      const prong = findProngTip(ringRef.current);
      if (!prong) return null;

      // Anchor gem's bottom vertex based on setting model:
      // Setting 1 (Prong solitaire) holds the gemstone high in the air, so only 1/3 (33%) of its height sits below the prong tips.
      // Other embedded settings (Bezel, Channel, Halo) require the stone to sit deeper (80% overlap) to be flush with the metal/halo.
      let overlapFactor = 0.80;
      if (ringUrl && (ringUrl.includes('/1.') || ringUrl.endsWith('1.glb') || ringUrl.includes('setting1'))) {
        overlapFactor = 0.33;
      }

      const overlap = gemSize.y * s * overlapFactor;
      const posY = prong.y - overlap - gemBox.min.y * s;
      const posX = - gemCenter.x * s;
      const posZ = - gemCenter.z * s;

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
  }, [ringRef, cloned, gemCarat, ringWidthScale, ringUrl, scene]);

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

function Scene({ ringUrl, gemUrl, materialProps, ringWidthScale, gemstoneName, gemCarat, lightingPreset, engraving, engravingFont, bandStyle }) {
  const { scene: ringScene } = useGLTF(ringUrl);
  const ringRef = useRef();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} castShadow />
      <directionalLight position={[-4, -4, -4]} intensity={0.4} />
      <CameraAdjust ringScene={ringScene} />
      <Environment preset={lightingPreset || "studio"} />
      <group ref={ringRef}>
        <RingModel url={ringUrl} materialProps={materialProps} widthScale={ringWidthScale} />
      </group>
      {gemUrl && (
        <GemModel 
          key={gemUrl} 
          url={gemUrl} 
          ringRef={ringRef} 
          gemstoneName={gemstoneName}
          gemCarat={gemCarat}
          ringWidthScale={ringWidthScale}
          ringUrl={ringUrl}
        />
      )}
      {/* Engraving feature disabled temporarily */}
      {/* <Suspense fallback={null}>
        <EngravingModel
          engraving={engraving}
          engravingFont={engravingFont}
          ringRef={ringRef}
          bandStyle={bandStyle}
          ringUrl={ringUrl}
          materialProps={materialProps}
        />
      </Suspense> */}
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
      <meshBasicMaterial color="#D7A36F" />
    </mesh>
  );
}

function JewelryViewer({ ringUrl, gemUrl, materialProps, ringWidthScale, gemstoneName, gemCarat, lightingPreset, engraving, engravingFont, bandStyle }) {
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
          <Scene 
            ringUrl={ringUrl} 
            gemUrl={gemUrl} 
            materialProps={materialProps} 
            ringWidthScale={ringWidthScale} 
            gemstoneName={gemstoneName}
            gemCarat={gemCarat}
            lightingPreset={lightingPreset}
            engraving={engraving}
            engravingFont={engravingFont}
            bandStyle={bandStyle}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default memo(JewelryViewer);
