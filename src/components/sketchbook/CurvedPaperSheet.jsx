import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { PAGE_ASPECT } from "./geometry";
import { BOOK_LIGHT } from "./lighting";

/**
 * Authentic 3D Flexible Paper Sheet
 * Powered by Three.js with 64x40 subdivided mesh (2,560 vertices).
 * Recreates the exact physical paper mechanics from niyamax.github.io/sketchbook:
 * - Corner lift & diagonal folding (driven by grabY)
 * - Traveling curved curl that rolls across the page
 * - Dynamic central gutter swell & bridge
 * - Dual-sided paper shader (revealing reverse side as it flips)
 * - Dynamic moving highlights, specular sheen & cast shadow
 */

const HINGE_DEPTH = 0.012;
const HINGE_INSET = 0.006;
const HINGE_WIDTH = 0.055;
const CORNER = 0.040;
const COLS = 64;
const CORNER_ROWS = 12;
const ROWS = 16 + CORNER_ROWS * 2;
const ASPECT = PAGE_ASPECT;

// Generates procedural paper stock texture
function createPaperStockTexture() {
  const size = 256;
  const pixels = new Uint8Array(size * size * 4);
  const random = (x, y) => {
    let seed = Math.imul(x + 17, 374761393) ^ Math.imul(y + 53, 668265263);
    seed = Math.imul(seed ^ (seed >>> 13), 1274126177);
    return ((seed ^ (seed >>> 16)) >>> 0) / 4294967295;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fibre = random(Math.floor(x / 3), y);
      const grain = random(x, y) * 0.7 + fibre * 0.3;
      const offset = (y * size + x) * 4;
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = Math.round(
        255 * (0.24 + grain * 0.52)
      );
      pixels[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, ASPECT);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

// Renders an editorial sketchbook folio onto a 2D canvas texture
function createFolioCanvasTexture(pageData, width, height, paperColor, isRight) {
  const canvas = document.createElement("canvas");
  const scale = 2; // Retina sharpness
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  // 1. Warm paper base
  ctx.fillStyle = paperColor || "#fbf8f0";
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle artist dot-grid
  ctx.fillStyle = "rgba(100, 115, 125, 0.13)";
  const dotSpacing = 18;
  const dotRadius = 0.75;
  for (let x = 20; x < width - 20; x += dotSpacing) {
    for (let y = 24; y < height - 24; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Central spine binding gradient
  const gutterGrad = ctx.createLinearGradient(
    isRight ? 0 : width - 24,
    0,
    isRight ? 24 : width,
    0
  );
  if (isRight) {
    gutterGrad.addColorStop(0, "rgba(0, 0, 0, 0.16)");
    gutterGrad.addColorStop(0.35, "rgba(0, 0, 0, 0.04)");
    gutterGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  } else {
    gutterGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
    gutterGrad.addColorStop(0.65, "rgba(0, 0, 0, 0.04)");
    gutterGrad.addColorStop(1, "rgba(0, 0, 0, 0.16)");
  }
  ctx.fillStyle = gutterGrad;
  ctx.fillRect(isRight ? 0 : width - 24, 0, 24, height);

  // 4. Folio Image (if present)
  if (pageData?.image) {
    const img = new Image();
    img.src = pageData.image;
    if (img.complete && img.naturalWidth) {
      const fit = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const w = img.naturalWidth * fit;
      const h = img.naturalHeight * fit;
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
    }
  }

  // 5. Folio Number typography
  const pageNum = pageData?.pageNumber || pageData?.num;
  if (pageNum) {
    ctx.font = "600 9px monospace";
    ctx.fillStyle = "rgba(40, 52, 60, 0.65)";
    ctx.textBaseline = "alphabetic";
    const numStr = String(pageNum).padStart(2, "0");
    if (isRight) {
      ctx.textAlign = "right";
      ctx.fillText(numStr, width - 22, height - 20);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(numStr, 22, height - 20);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Custom Dual-Sided Physical Paper Material matching reference
function createDualSidedPaperMaterial(frontTex, backTex, stockTex) {
  const back = { value: backTex };
  const faceInk = { value: 1.0 };
  const bindingShade = { value: 0.035 };
  const paperFill = { value: 0.45 };
  const gutter = { value: 0.16 };

  const material = new THREE.MeshPhysicalMaterial({
    map: frontTex,
    side: THREE.DoubleSide,
    metalness: 0,
    roughness: 0.82,
    specularIntensity: 0.85,
    clearcoat: 0.12,
    clearcoatRoughness: 0.28,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.backMap = back;
    shader.uniforms.faceInkAmount = faceInk;
    shader.uniforms.bindingShade = bindingShade;
    shader.uniforms.paperFill = paperFill;
    shader.uniforms.gutterAmount = gutter;
    shader.uniforms.stockMap = { value: stockTex };

    shader.fragmentShader =
      "uniform sampler2D backMap;\nuniform sampler2D stockMap;\nuniform float faceInkAmount;\nuniform float bindingShade;\nuniform float paperFill;\nuniform float gutterAmount;\n" +
      shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
      vec4 frontInk = mix(texture2D(backMap, vMapUv), texture2D(map, vMapUv), faceInkAmount);
      vec4 backInk = texture2D(backMap, vec2(1.0 - vMapUv.x, vMapUv.y));
      diffuseColor *= gl_FrontFacing ? frontInk : backInk;
      float stockGrain = texture2D(stockMap, vMapUv * vec2(1.0, ${ASPECT})).r;
      diffuseColor.rgb *= 1.0 + (stockGrain - 0.5) * 0.12;
      float bindingProfile = exp(-vMapUv.x * 28.0);
      diffuseColor.rgb *= 1.0 - bindingShade * bindingProfile;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `
      outgoingLight = mix(outgoingLight, max(outgoingLight, diffuseColor.rgb), paperFill);
      outgoingLight *= 1.0 - gutterAmount * bindingProfile;
      #include <opaque_fragment>
      `
    );
  };

  return { material, back, faceInk, bindingShade, paperFill, gutter };
}

export default function CurvedPaperSheet({
  progress = 0, // 0.0 (start) -> 1.0 (end)
  direction = 1, // 1 = forward (right to left), -1 = backward (left to right)
  grabY = 0, // -1 to +1 (corner lift)
  frontPage = null,
  backPage = null,
  width = 160,
  height = 226,
  paperColor = "#fbfaf6",
}) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);

  const clampedP = Math.max(0, Math.min(1, progress));

  // Initialize Three.js WebGL scene once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 2));
      renderer.setSize(width * 2, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch (e) {
      console.warn("CurvedPaperSheet WebGL fallback:", e);
      return;
    }

    const scene = new THREE.Scene();

    // Directional light matching sketchbook reference
    const light = new THREE.DirectionalLight(0xffffff, 3.6);
    light.position.set(BOOK_LIGHT.x * 4, BOOK_LIGHT.y * 4, BOOK_LIGHT.z * 4);
    scene.add(light);

    // Perspective camera
    const camera = new THREE.PerspectiveCamera(
      (2 * Math.atan(ASPECT / (2 * 6.2)) * 180) / Math.PI,
      2 / ASPECT,
      1,
      12
    );
    camera.position.set(0, 0, 6.2);
    scene.add(camera);

    // Textures
    const stock = createPaperStockTexture();
    const frontTex = createFolioCanvasTexture(frontPage, width, height, paperColor, true);
    const backTex = createFolioCanvasTexture(backPage, width, height, paperColor, false);

    // 64x40 Subdivided Plane Geometry
    const geometry = new THREE.PlaneGeometry(1, ASPECT, COLS, ROWS);
    const uv = geometry.attributes.uv;
    const edge = CORNER_ROWS / ROWS;
    const radius = CORNER / ASPECT;
    const arc = (t) => radius * (1 - Math.cos((t * Math.PI) / 2));
    for (let i = 0; i < uv.count; i++) {
      const v = 1 - Math.floor(i / (COLS + 1)) / ROWS;
      uv.setY(
        i,
        v <= edge
          ? arc(v / edge)
          : v >= 1 - edge
          ? 1 - arc((1 - v) / edge)
          : radius + ((v - edge) / (1 - 2 * edge)) * (1 - 2 * radius)
      );
    }
    uv.needsUpdate = true;

    // Dual-Sided Material
    const { material, back } = createDualSidedPaperMaterial(frontTex, backTex, stock);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    // Dynamic Receiver-Page Cast Shadow
    const shadeMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        extent: { value: 0 },
        strength: { value: 0 },
        leftPage: { value: 1 },
        rightPage: { value: 1 },
      },
      vertexShader: `
        varying vec2 paperUV;
        void main() {
          paperUV = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 paperUV;
        uniform float extent, strength;
        void main() {
          float x = paperUV.x * 2.0 - 1.0;
          float e = abs(extent);
          float penumbra = 1.0 - smoothstep(max(0.0, e - 0.12), e + 0.12, abs(x));
          float ends = smoothstep(0.0, 0.04, paperUV.y) * (1.0 - smoothstep(0.96, 1.0, paperUV.y));
          gl_FragColor = vec4(0.05, 0.08, 0.12, strength * penumbra * ends);
        }
      `,
    });
    const shadeGeometry = new THREE.PlaneGeometry(2, ASPECT, COLS * 2 + 1, 1);
    const shadeMesh = new THREE.Mesh(shadeGeometry, shadeMaterial);
    shadeMesh.position.z = -0.003;
    scene.add(shadeMesh);

    sceneRef.current = {
      renderer,
      scene,
      camera,
      geometry,
      mesh,
      material,
      back,
      frontTex,
      backTex,
      stock,
      shadeMesh,
      shadeMaterial,
    };

    return () => {
      renderer.dispose();
      geometry.dispose();
      shadeGeometry.dispose();
      material.dispose();
      shadeMaterial.dispose();
      frontTex.dispose();
      backTex.dispose();
      stock.dispose();
      sceneRef.current = null;
    };
  }, [width, height, paperColor, frontPage, backPage]);

  // Update physical paper curl geometry on every frame/progress change
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;

    const { renderer, scene, camera, geometry, shadeMaterial } = s;

    // Physical Progress Mapping:
    // Direction 1 (Forward): 0 (flat right) -> 1 (flat left)
    // Direction -1 (Backward): 0 (flat left) -> 1 (flat right)
    const effectiveProgress = direction === 1 ? clampedP : 1 - clampedP;
    const effectiveGrab = direction === 1 ? grabY : -grabY;

    // Apply authentic developable conical paper curl formula across all 2,560 vertices
    const points = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < points.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      const baseY = (v - 0.5) * ASPECT;

      // Rounded paper corner geometry
      const cornerY = Math.max(0, Math.abs(baseY) - (ASPECT / 2 - CORNER));
      const inset = CORNER - Math.sqrt(Math.max(0, CORNER * CORNER - cornerY * cornerY));
      const reach = u * (1 - inset);
      const hinge = Math.exp(-reach / HINGE_WIDTH);
      const y = baseY * (1 - (2 * HINGE_INSET * hinge) / ASPECT);

      // Corner Grab Diagonal Folding:
      // When grabbed near a corner (v != 0.5), progress p is modulated across the sheet,
      // causing the corner to lift first and a continuous diagonal fold to roll across!
      const p = THREE.MathUtils.clamp(
        effectiveProgress + effectiveGrab * 0.085 * (v - 0.5) * 2 * Math.sin(Math.PI * effectiveProgress),
        0,
        1
      );

      // Conical paper curl equations
      const angle = Math.PI * p;
      const curl = 0.58 * Math.sin(Math.PI * p);
      const k = -2 * curl;
      const a = angle + curl;

      const x = Math.abs(k) < 1e-5 ? reach * Math.cos(angle) : (Math.sin(a + k * reach) - Math.sin(a)) / k;
      const z = Math.abs(k) < 1e-5 ? reach * Math.sin(angle) : (Math.cos(a) - Math.cos(a + k * reach)) / k;

      // Elastic gutter rise bridging across the central binding
      const gutterRise = 0.024 * (1 - Math.exp(-reach / 0.06)) * Math.exp(-reach / 0.22);

      points.setXYZ(
        i,
        x,
        y,
        z - HINGE_DEPTH * hinge + gutterRise * Math.cos(Math.PI * p) ** 2
      );
    }

    points.needsUpdate = true;
    geometry.computeVertexNormals();

    // Update dynamic cast shadow onto underlying page
    shadeMaterial.uniforms.extent.value = (effectiveProgress - 0.5) * 1.8;
    shadeMaterial.uniforms.strength.value = 0.42 * Math.sin(Math.PI * effectiveProgress);

    renderer.render(scene, camera);
  }, [clampedP, direction, grabY]);

  if (clampedP <= 0.001 || clampedP >= 0.999) {
    return null;
  }

  return (
    <div
      className="curved-paper-host"
      style={{
        position: "absolute",
        left: `-${width}px`,
        top: 0,
        width: `${width * 2}px`,
        height: `${height}px`,
        pointerEvents: "none",
        zIndex: 60,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
