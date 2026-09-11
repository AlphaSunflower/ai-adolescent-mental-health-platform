"use client";

import {
  Suspense,
  type FC,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Canvas,
  invalidate,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useFBX,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";

export interface ViewerProps {
  url: string;
  width?: number | string;
  height?: number | string;
  modelXOffset?: number;
  modelYOffset?: number;
  defaultRotationX?: number;
  defaultRotationY?: number;
  defaultZoom?: number;
  minZoomDistance?: number;
  maxZoomDistance?: number;
  enableMouseParallax?: boolean;
  enableManualRotation?: boolean;
  enableHoverRotation?: boolean;
  enableManualZoom?: boolean;
  ambientIntensity?: number;
  keyLightIntensity?: number;
  fillLightIntensity?: number;
  rimLightIntensity?: number;
  environmentPreset?:
    | "city"
    | "sunset"
    | "night"
    | "dawn"
    | "studio"
    | "apartment"
    | "forest"
    | "park"
    | "none";
  placeholderSrc?: string;
  showScreenshotButton?: boolean;
  fadeIn?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  onModelLoaded?: () => void;
}

const DRAG_DECIDE_PX = 8;
const ROTATE_SPEED = 0.005;
const INERTIA = 0.925;
const PARALLAX_MAGNITUDE = 0.12;
const PARALLAX_EASE = 0.1;
const HOVER_MAGNITUDE = (6 * Math.PI) / 180;
const HOVER_EASE = 0.14;

const degToRad = (degrees: number) => (degrees * Math.PI) / 180;

const isMesh = (object: THREE.Object3D): object is THREE.Mesh =>
  "isMesh" in object && object.isMesh === true;

const isLight = (object: THREE.Object3D): object is THREE.Light =>
  "isLight" in object && object.isLight === true;

function getModelExtension(url: string) {
  return url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
}

function GltfModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  return <primitive object={scene} />;
}

function FbxModel({ url }: { url: string }) {
  const fbx = useFBX(url);
  const scene = useMemo(() => fbx.clone(true), [fbx]);
  return <primitive object={scene} />;
}

function ObjModel({ url }: { url: string }) {
  const object = useLoader(OBJLoader, url);
  const scene = useMemo(() => object.clone(true), [object]);
  return <primitive object={scene} />;
}

function ModelContent({ url }: { url: string }) {
  const extension = getModelExtension(url);

  if (extension === "glb" || extension === "gltf") {
    return <GltfModel url={url} />;
  }

  if (extension === "fbx") {
    return <FbxModel url={url} />;
  }

  if (extension === "obj") {
    return <ObjModel url={url} />;
  }

  console.error("Unsupported 3D model format:", extension);
  return null;
}

function ModelLoader({ placeholderSrc }: { placeholderSrc?: string }) {
  const { active, progress } = useProgress();

  if (!active && placeholderSrc) return null;

  return (
    <Html center>
      <div className="official-model-loader" role="status" aria-live="polite">
        {placeholderSrc ? (
          <img src={placeholderSrc} alt="" width={128} height={128} />
        ) : (
          <>
            <span className="official-model-loader__spinner" aria-hidden="true" />
            <span>{Math.round(progress)}%</span>
          </>
        )}
      </div>
    </Html>
  );
}

interface ModelInnerProps {
  url: string;
  xOffset: number;
  yOffset: number;
  initialPitch: number;
  initialYaw: number;
  minZoom: number;
  maxZoom: number;
  enableMouseParallax: boolean;
  enableManualRotation: boolean;
  enableHoverRotation: boolean;
  enableManualZoom: boolean;
  fadeIn: boolean;
  autoRotate: boolean;
  autoRotateSpeed: number;
  onLoaded?: () => void;
  children: ReactNode;
}

const ModelInner: FC<ModelInnerProps> = ({
  url,
  xOffset,
  yOffset,
  initialPitch,
  initialYaw,
  minZoom,
  maxZoom,
  enableMouseParallax,
  enableManualRotation,
  enableHoverRotation,
  enableManualZoom,
  fadeIn,
  autoRotate,
  autoRotateSpeed,
  onLoaded,
  children,
}) => {
  const outerRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const currentParallaxRef = useRef({ x: 0, y: 0 });
  const targetParallaxRef = useRef({ x: 0, y: 0 });
  const currentHoverRef = useRef({ x: 0, y: 0 });
  const targetHoverRef = useRef({ x: 0, y: 0 });
  const { camera, gl } = useThree();

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    inner.position.set(0, 0, 0);
    inner.rotation.set(0, 0, 0);
    inner.scale.set(1, 1, 1);
    inner.updateWorldMatrix(true, true);

    const bounds = new THREE.Box3().setFromObject(inner);
    const sphere = bounds.getBoundingSphere(new THREE.Sphere());
    if (!Number.isFinite(sphere.radius) || sphere.radius <= 0) return;

    const scale = 1 / (sphere.radius * 2);
    inner.scale.setScalar(scale);
    inner.position.set(
      -sphere.center.x * scale,
      -sphere.center.y * scale,
      -sphere.center.z * scale,
    );

    const fadeMaterials: THREE.Material[] = [];
    inner.traverse((object) => {
      if (!isMesh(object)) return;
      object.castShadow = true;
      object.receiveShadow = true;

      if (!fadeIn) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = 0;
        fadeMaterials.push(material);
      });
    });

    outer.position.set(xOffset, yOffset, 0);
    outer.rotation.set(initialPitch, initialYaw, 0);
    invalidate();

    if (!fadeIn) {
      onLoaded?.();
      return;
    }

    let progress = 0;
    const interval = window.setInterval(() => {
      progress = Math.min(1, progress + 0.05);
      fadeMaterials.forEach((material) => {
        material.opacity = progress;
        if (progress === 1) material.transparent = false;
      });
      invalidate();

      if (progress === 1) {
        window.clearInterval(interval);
        onLoaded?.();
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [
    fadeIn,
    initialPitch,
    initialYaw,
    onLoaded,
    url,
    xOffset,
    yOffset,
  ]);

  useEffect(() => {
    if (!enableManualRotation) return;

    const element = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging || !outerRef.current) return;
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;

      outerRef.current.rotation.y += deltaX * ROTATE_SPEED;
      outerRef.current.rotation.x += deltaY * ROTATE_SPEED;
      velocityRef.current = {
        x: deltaX * ROTATE_SPEED,
        y: deltaY * ROTATE_SPEED,
      };
      invalidate();
    };

    const handlePointerUp = () => {
      dragging = false;
    };

    element.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [enableManualRotation, gl]);

  useEffect(() => {
    const element = gl.domElement;
    const pointers = new Map<number, { x: number; y: number }>();
    let mode: "idle" | "decide" | "rotate" | "pinch" = "idle";
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let startDistance = 0;
    let startCameraZ = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1) {
        mode = "decide";
        startX = lastX = event.clientX;
        startY = lastY = event.clientY;
      } else if (pointers.size === 2 && enableManualZoom) {
        mode = "pinch";
        const [first, second] = [...pointers.values()];
        startDistance = Math.hypot(
          first.x - second.x,
          first.y - second.y,
        );
        startCameraZ = camera.position.z;
        event.preventDefault();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const point = pointers.get(event.pointerId);
      if (!point) return;
      point.x = event.clientX;
      point.y = event.clientY;

      if (mode === "decide") {
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        if (Math.abs(deltaX) > DRAG_DECIDE_PX || Math.abs(deltaY) > DRAG_DECIDE_PX) {
          if (
            enableManualRotation &&
            Math.abs(deltaX) > Math.abs(deltaY)
          ) {
            mode = "rotate";
            element.setPointerCapture(event.pointerId);
          } else {
            mode = "idle";
            pointers.clear();
          }
        }
      }

      if (mode === "rotate" && outerRef.current) {
        event.preventDefault();
        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        outerRef.current.rotation.y += deltaX * ROTATE_SPEED;
        outerRef.current.rotation.x += deltaY * ROTATE_SPEED;
        velocityRef.current = {
          x: deltaX * ROTATE_SPEED,
          y: deltaY * ROTATE_SPEED,
        };
        invalidate();
      } else if (mode === "pinch" && pointers.size === 2) {
        event.preventDefault();
        const [first, second] = [...pointers.values()];
        const distance = Math.hypot(
          first.x - second.x,
          first.y - second.y,
        );
        const ratio = startDistance / Math.max(distance, 1);
        camera.position.z = THREE.MathUtils.clamp(
          startCameraZ * ratio,
          minZoom,
          maxZoom,
        );
        invalidate();
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2 && mode === "pinch") mode = "idle";
      if (pointers.size === 0 && mode === "rotate") mode = "idle";
    };

    element.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, {
      passive: true,
    });

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [camera, enableManualRotation, enableManualZoom, gl, maxZoom, minZoom]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;

      if (enableMouseParallax) {
        targetParallaxRef.current = {
          x: -normalizedX * PARALLAX_MAGNITUDE,
          y: -normalizedY * PARALLAX_MAGNITUDE,
        };
      }

      if (enableHoverRotation) {
        targetHoverRef.current = {
          x: normalizedY * HOVER_MAGNITUDE,
          y: normalizedX * HOVER_MAGNITUDE,
        };
      }

      invalidate();
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [enableHoverRotation, enableMouseParallax]);

  useFrame((_, delta) => {
    const outer = outerRef.current;
    if (!outer) return;

    const frameDelta = Math.min(delta, 0.05);
    const previousHoverX = currentHoverRef.current.x;
    const previousHoverY = currentHoverRef.current.y;

    currentParallaxRef.current.x +=
      (targetParallaxRef.current.x - currentParallaxRef.current.x) *
      PARALLAX_EASE;
    currentParallaxRef.current.y +=
      (targetParallaxRef.current.y - currentParallaxRef.current.y) *
      PARALLAX_EASE;
    currentHoverRef.current.x +=
      (targetHoverRef.current.x - currentHoverRef.current.x) * HOVER_EASE;
    currentHoverRef.current.y +=
      (targetHoverRef.current.y - currentHoverRef.current.y) * HOVER_EASE;

    outer.position.x =
      xOffset + currentParallaxRef.current.x * 0.42;
    outer.position.y =
      yOffset + currentParallaxRef.current.y * 0.36;
    outer.rotation.x +=
      currentHoverRef.current.x - previousHoverX;
    outer.rotation.y +=
      currentHoverRef.current.y - previousHoverY;

    if (autoRotate) {
      outer.rotation.y += autoRotateSpeed * frameDelta;
    }

    outer.rotation.y += velocityRef.current.x;
    outer.rotation.x += velocityRef.current.y;
    velocityRef.current.x *= INERTIA;
    velocityRef.current.y *= INERTIA;

    const hasInertia =
      Math.abs(velocityRef.current.x) > 0.0001 ||
      Math.abs(velocityRef.current.y) > 0.0001;
    const hasParallax =
      Math.abs(currentParallaxRef.current.x - targetParallaxRef.current.x) >
        0.0001 ||
      Math.abs(currentParallaxRef.current.y - targetParallaxRef.current.y) >
        0.0001;
    const hasHover =
      Math.abs(currentHoverRef.current.x - targetHoverRef.current.x) >
        0.0001 ||
      Math.abs(currentHoverRef.current.y - targetHoverRef.current.y) >
        0.0001;

    if (autoRotate || hasInertia || hasParallax || hasHover) invalidate();
  });

  return (
    <group ref={outerRef}>
      <group ref={innerRef}>{children}</group>
    </group>
  );
};

const ModelViewer: FC<ViewerProps> = ({
  url,
  width = 400,
  height = 400,
  modelXOffset = 0,
  modelYOffset = 0,
  defaultRotationX = -8,
  defaultRotationY = 0,
  defaultZoom = 2.4,
  minZoomDistance = 1.6,
  maxZoomDistance = 3.8,
  enableMouseParallax = true,
  enableManualRotation = true,
  enableHoverRotation = true,
  enableManualZoom = true,
  ambientIntensity = 0.55,
  keyLightIntensity = 1.4,
  fillLightIntensity = 0.65,
  rimLightIntensity = 0.8,
  environmentPreset = "none",
  placeholderSrc,
  showScreenshotButton = false,
  fadeIn = false,
  autoRotate = false,
  autoRotateSpeed = 0.16,
  onModelLoaded,
}) => {
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.Camera>(null);
  const [isTouch] = useState(
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0),
  );

  const initialPitch = degToRad(defaultRotationX);
  const initialYaw = degToRad(defaultRotationY);
  const cameraZ = THREE.MathUtils.clamp(
    defaultZoom,
    minZoomDistance,
    maxZoomDistance,
  );
  const controlsTarget = useMemo(
    () => new THREE.Vector3(modelXOffset, modelYOffset, 0),
    [modelXOffset, modelYOffset],
  );

  useEffect(() => {
    const extension = getModelExtension(url);
    if (extension === "glb" || extension === "gltf") useGLTF.preload(url);
  }, [url]);

  const captureScreenshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    renderer.shadowMap.enabled = false;
    const lights: Array<{ light: THREE.Light; castShadow: boolean }> = [];
    scene.traverse((object) => {
      if (!isLight(object)) return;
      lights.push({ light: object, castShadow: object.castShadow });
      object.castShadow = false;
    });

    renderer.render(scene, camera);
    const anchor = document.createElement("a");
    anchor.download = "companion-model.png";
    anchor.href = renderer.domElement.toDataURL("image/png");
    anchor.click();

    renderer.shadowMap.enabled = true;
    lights.forEach(({ light, castShadow }) => {
      light.castShadow = castShadow;
    });
    invalidate();
  };

  return (
    <div
      className="official-model-viewer"
      style={{ width, height }}
      role="group"
      aria-label="可拖拽旋转的 3D 陪伴形象"
    >
      {showScreenshotButton ? (
        <button
          type="button"
          className="official-model-viewer__screenshot"
          onClick={captureScreenshot}
        >
          保存模型截图
        </button>
      ) : null}

      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: showScreenshotButton,
        }}
        camera={{
          fov: 40,
          near: 0.01,
          far: 100,
          position: [0, 0, cameraZ],
        }}
        onCreated={({ camera, gl, scene }) => {
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        {environmentPreset !== "none" ? (
          <Environment
            preset={environmentPreset}
            background={false}
          />
        ) : null}

        <ambientLight intensity={ambientIntensity} />
        <directionalLight
          position={[4, 5, 5]}
          intensity={keyLightIntensity}
          castShadow
        />
        <directionalLight
          position={[-4, 2, 5]}
          intensity={fillLightIntensity}
        />
        <directionalLight
          position={[0, 4, -5]}
          intensity={rimLightIntensity}
        />

        <ContactShadows
          position={[modelXOffset, modelYOffset - 0.62, 0]}
          opacity={0.28}
          scale={5}
          blur={2.4}
          far={4}
        />

        <Suspense fallback={<ModelLoader placeholderSrc={placeholderSrc} />}>
          <ModelInner
            url={url}
            xOffset={modelXOffset}
            yOffset={modelYOffset}
            initialPitch={initialPitch}
            initialYaw={initialYaw}
            minZoom={minZoomDistance}
            maxZoom={maxZoomDistance}
            enableMouseParallax={enableMouseParallax}
            enableManualRotation={enableManualRotation}
            enableHoverRotation={enableHoverRotation}
            enableManualZoom={enableManualZoom}
            fadeIn={fadeIn}
            autoRotate={autoRotate}
            autoRotateSpeed={autoRotateSpeed}
            onLoaded={onModelLoaded}
          >
            <ModelContent url={url} />
          </ModelInner>
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableRotate={false}
          enableZoom={enableManualZoom && !isTouch}
          minDistance={minZoomDistance}
          maxDistance={maxZoomDistance}
          target={controlsTarget}
        />
      </Canvas>
    </div>
  );
};

export default ModelViewer;
