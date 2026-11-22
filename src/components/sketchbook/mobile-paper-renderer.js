import { BOOK_LIGHT } from "./lighting";
import { PAGE_ASPECT } from "./geometry";
import { paperStock, paperTexture, createPaperMaterial, createBookRenderer, addBookLight, createCoverEdge } from "./book-rendering";
import * as THREE from "three";
const ASPECT = PAGE_ASPECT;
const TAU = Math.PI * 2;
const COVER_FOLD_RADIUS = 0.045;
const paperFoldRadius = (page) => 0.05 + Math.min(page, 40) * 65e-5;
const COVER_THICKNESS = 2e-3;
const PAGE_COLUMNS = 64;
const PAGE_ROWS = 32;
const columnU = (u) => u <= 1 / 3 ? u * 0.3 : u <= 2 / 3 ? 0.1 + (u - 1 / 3) * 0.9 : 0.4 + (u - 2 / 3) * 1.8;
const COVER_REST_DEPTH = 0.05;
const FOLDED_HINGE_X = 0;
const foldedRise = (page) => Math.min(page, 40) * 6e-4;
const PAPER_CORNER = 0.035;
const COVER_CORNER = 0.045;
const smooth = (value) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};
const smoother = (value) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * t * (t * (6 * t - 15) + 10);
};
function conePoint(x, y, taper, radius, limit) {
  const r = Math.max(1e-4, radius + (ASPECT / 2 - y) * taper);
  const slant = x * taper / r;
  const wrap = Math.abs(slant) < 1e-3 ? x / r : Math.atan(slant) / taper;
  const coneCos = Math.sqrt(1 - taper * taper);
  const outlet = Math.min(limit, 0.42);
  let curved;
  if (wrap < limit) {
    const reach = Math.hypot(r, x * taper);
    curved = new THREE.Vector3(
      reach * Math.sin(wrap),
      y + taper * (reach * (1 - Math.cos(wrap)) - x * x / (r + reach)),
      reach * coneCos * (1 - Math.cos(wrap))
    );
    if (wrap <= limit - outlet) return curved;
  }
  const fan = taper * limit;
  const sinc = Math.abs(fan) < 1e-3 ? 1 - fan * fan / 6 : Math.sin(fan) / fan;
  const versine = Math.abs(fan) < 1e-3 ? fan / 2 : (1 - Math.cos(fan)) / fan;
  const along = x * taper * Math.sin(fan) + r * Math.cos(fan);
  const past = x * Math.cos(fan) - r * limit * sinc;
  const lift = along * (1 - Math.cos(limit)) + past * Math.sin(limit);
  const tangent = new THREE.Vector3(
    along * Math.sin(limit) + past * Math.cos(limit),
    y + r * limit * versine - x * Math.sin(fan) + taper * lift,
    coneCos * lift
  );
  return curved ? curved.lerp(tangent, smoother((wrap - limit + outlet) / outlet)) : tangent;
}
function shapeSheet(geometry, progress, radius, lift, grabY = 0, corner = PAPER_CORNER, stackRise = 0, pageWidth = 1, pageHeight = ASPECT) {
  const lead = TAU * (1 - (1 - progress) ** 2);
  const phase = lead / TAU;
  const spine = 105 * Math.PI / 180;
  const handoff = 35 * Math.PI / 180;
  const excess = lead - spine;
  const transfer = THREE.MathUtils.clamp(
    (excess + handoff) / (2 * handoff),
    0,
    1
  );
  const wrap = excess >= handoff ? excess : handoff * (2 * transfer ** 3 - transfer ** 4);
  const rotation = lead - wrap;
  const rollPhase = smooth(wrap / (TAU - spine));
  const rollScale = 1 + 1.1 * (1 - rollPhase) + (corner === COVER_CORNER ? 0.1 : 0.35) * Math.sin(Math.PI * rollPhase) ** 2;
  const top = radius * rollScale;
  const taperRatio = 0.28 + 0.28 * Math.sin(Math.PI * phase) ** 2;
  const taper = (radius * taperRatio * rollScale - top) / ASPECT;
  const endX = (y) => {
    const rowRadius = Math.max(1e-4, top + (ASPECT / 2 - y) * taper);
    return Math.abs(taper) < 1e-4 ? rowRadius * wrap : rowRadius * Math.tan(taper * wrap) / taper;
  };
  const settledTilt = Math.atan2(
    endX(-pageHeight / 2) - endX(pageHeight / 2),
    pageHeight
  );
  const tilt = THREE.MathUtils.lerp(
    grabY * 0.38,
    settledTilt,
    smoother(phase)
  );
  const cos = Math.cos(tilt), sin = Math.sin(tilt);
  const start = Math.max(
    endX(pageHeight / 2) * cos + pageHeight / 2 * sin,
    endX(-pageHeight / 2) * cos - pageHeight / 2 * sin
  );
  const length = Math.max(
    1e-3,
    pageWidth * cos + pageHeight / 2 * Math.abs(sin) - start
  );
  const trailingBend = (corner === COVER_CORNER ? 0.16 : 0.48) * Math.sin(Math.PI * smooth((phase - 0.42) / 0.58)) ** 2;
  const panelBend = 2.5 * (1 - smoother((progress - 0.3) / 0.5)) * (lead - TAU * progress) + trailingBend;
  const bend = -lead * Math.tanh(panelBend / Math.max(lead, 1e-4));
  const pileLift = lift * (1 - smoother(lead / spine));
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const ca = Math.cos(rotation), sa = Math.sin(rotation);
  for (let index = 0; index < position.count; index++) {
    const u = uv.getX(index), y = (uv.getY(index) - 0.5) * pageHeight;
    const cornerY = Math.max(0, Math.abs(y) - (pageHeight / 2 - corner));
    const inset = corner - Math.sqrt(Math.max(0, corner * corner - cornerY * cornerY));
    const bindingInset = 0;
    const x = (bindingInset + u * (pageWidth - inset - bindingInset)) * (1 - pileLift * 0.04);
    const along = x * cos + y * sin;
    const across = -x * sin + y * cos;
    const beyond = Math.max(0, along - start);
    const angle = beyond / length * bend;
    const curled = along - beyond + beyond * (Math.abs(angle) < 1e-4 ? 1 : Math.sin(angle) / angle);
    const height = Math.abs(angle) < 1e-4 ? 0 : beyond * (1 - Math.cos(angle)) / angle;
    const cx = curled * cos - across * sin, cy = curled * sin + across * cos;
    const point = conePoint(cx, cy, taper, top, wrap);
    if (height !== 0) {
      const tangentX = conePoint(cx + 1e-3, cy, taper, top, wrap).sub(point);
      const tangentY = conePoint(cx, cy + 1e-3, taper, top, wrap).sub(point);
      point.add(tangentX.cross(tangentY).normalize().multiplyScalar(height));
    }
    const rise = Math.sqrt(Math.max(0, 1 - (1 - Math.min(x / 0.4, 1)) ** 2));
    const pile = pileLift * rise * (1 - 0.5 * smooth((x - 0.4) / 0.6)) * (1 - 0.6 * y / ASPECT);
    const z = point.z + pile;
    position.setXYZ(
      index,
      point.x * ca - z * sa,
      point.y + stackRise * smooth(beyond / length),
      point.x * sa + z * ca
    );
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
}
export function createPaperRenderer(host, width, height) {
  const palette = getComputedStyle(host);
  const paperColor = palette.getPropertyValue("--sketchbook-paper").trim();
  const coverEdgeColor = palette.getPropertyValue("--sketchbook-cover-edge").trim();
  const canvasScaleX = parseFloat(palette.getPropertyValue("--book-canvas-scale-x")) || 2.8;
  const canvasScaleY = parseFloat(palette.getPropertyValue("--book-canvas-scale-y")) || 1.6;
  const renderer = createBookRenderer(host, width * canvasScaleX, height * canvasScaleY);
  const viewHeight = ASPECT * canvasScaleY / 0.91;
  const cameraDistance = 6.2;
  const camera = new THREE.PerspectiveCamera(
    2 * Math.atan(viewHeight / (cameraDistance * 2)) * 180 / Math.PI,
    width * canvasScaleX / (height * canvasScaleY),
    1,
    10
  );
  camera.position.set(0.5, 0.015, cameraDistance);
  const scene = new THREE.Scene();
  const stock = paperStock();
  addBookLight(scene, 0.4);
  camera.updateMatrixWorld();
  const projectGround = (x, y) => {
    const point = new THREE.Vector3(x, y, -0.07).project(camera);
    return { x: (point.x + 1) * canvasScaleX / 2 - (canvasScaleX - 1) / 2, y: (1 - point.y) * canvasScaleY / 2 - (canvasScaleY - 1) / 2 };
  };
  const groundWidth = 1.035, groundHeight = ASPECT * 1.045;
  const groundTop = projectGround(0, groundHeight / 2), groundBottom = projectGround(groundWidth, -groundHeight / 2);
  const groundScale = (groundBottom.x - groundTop.x) * width / groundWidth;
  const groundFootprint = { left: groundTop.x, top: groundTop.y, width: groundBottom.x - groundTop.x, height: groundBottom.y - groundTop.y, radius: COVER_CORNER * groundScale, offsetX: -BOOK_LIGHT.x * 0.025 * groundScale, offsetY: BOOK_LIGHT.y * 0.025 * groundScale, blur: 0.018 * groundScale };
  const blankCanvas = document.createElement("canvas");
  blankCanvas.width = blankCanvas.height = 2;
  const blankContext = blankCanvas.getContext("2d");
  blankContext.fillStyle = paperColor;
  blankContext.fillRect(0, 0, 2, 2);
  const blank = new THREE.CanvasTexture(blankCanvas);
  blank.colorSpace = THREE.SRGBColorSpace;
  function leaf() {
    const geometry = new THREE.PlaneGeometry(
      1,
      ASPECT,
      PAGE_COLUMNS,
      PAGE_ROWS
    );
    const uv = geometry.attributes.uv;
    const edgeRows = 5 / PAGE_ROWS;
    for (let i = 0; i < uv.count; i++) {
      const v = uv.getY(i);
      const denseV = v < edgeRows ? v / edgeRows * 0.055 : v > 1 - edgeRows ? 1 - (1 - v) / edgeRows * 0.055 : 0.055 + (v - edgeRows) / (1 - edgeRows * 2) * 0.89;
      uv.setXY(i, columnU(uv.getX(i)), denseV);
    }
    const { material, back, faceInk, bindingShade, paperFill } = createPaperMaterial(blank, stock);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    scene.add(mesh);
    return {
      geometry,
      material,
      mesh,
      back,
      faceInk,
      bindingShade,
      paperFill
    };
  }
  function coverEdge(cover) {
    return createCoverEdge(cover, PAGE_COLUMNS, PAGE_ROWS, coverEdgeColor, COVER_THICKNESS);
  }
  const behind = /* @__PURE__ */ new Map();
  const behindPoses = /* @__PURE__ */ new Map();
  const pile = Array.from({ length: 5 }, leaf);
  const sheet = leaf();
  const foldedCover = leaf();
  const backCover = leaf();
  const movingEdge = coverEdge(sheet);
  const foldedEdge = coverEdge(foldedCover);
  const backEdge = coverEdge(backCover);
  const leaves = [...pile, sheet, foldedCover, backCover];
  let textures = [];
  let coverTexture = null;
  let coverTextureKey = "";
  let liningTexture = null;
  let radius = paperFoldRadius(0);
  let sheetPage = 0;
  let turnSpan = 1;
  const packetPoses = /* @__PURE__ */ new Map();
  let foldPositions = new Float64Array(0);
  const foldPosition = (page) => foldPositions[page] ?? 0;
  const loadedFoldPosition = (page, count) => {
    const pressure = 0.1 * smooth((count - page) / 8) + 0.05 * count / (count + 16);
    return foldPosition(page) * (1 - pressure);
  };
  let openingCover = false;
  let isDisposed = false;
  let grab = 0;
  function prepareFoldPositions(pageCount) {
    if (foldPositions.length === pageCount) return;
    foldPositions = new Float64Array(pageCount);
    behindPoses.clear();
    if (pageCount > 1) foldPositions[1] = 1;
    if (pageCount <= 2) return;
    let total = 0;
    const lastFolded = pageCount - 2;
    for (let page = 2; page <= lastFolded; page++) {
      const seed = Math.sin(page * 127.1 + 19.7) * 43758.5453;
      const air = seed - Math.floor(seed);
      total += 0.1 + air * 0.2 + 5.2 * air ** 12;
      foldPositions[page] = total;
    }
    const span = Math.min(39, Math.max(0, lastFolded - 1));
    for (let page = 2; page <= lastFolded; page++) {
      foldPositions[page] = 1 + foldPositions[page] / total * span;
    }
    foldPositions[pageCount - 1] = foldPositions[lastFolded];
  }
  function captureFoldPose(paper, page, count) {
    const position = loadedFoldPosition(page, count);
    shapeSheet(
      paper.geometry,
      1,
      paperFoldRadius(position),
      0,
      0,
      PAPER_CORNER,
      foldedRise(position)
    );
    return {
      positions: new Float32Array(paper.geometry.attributes.position.array),
      normals: new Float32Array(paper.geometry.attributes.normal.array)
    };
  }
  function packetStart(paper, depth) {
    shapeSheet(paper.geometry, 0, radius, 0.075 / (1 + depth * 0.5));
    const positions = new Float32Array(paper.geometry.attributes.position.array);
    for (let i = 2; i < positions.length; i += 3) positions[i] -= depth * 12e-4;
    return {
      positions,
      normals: new Float32Array(paper.geometry.attributes.normal.array)
    };
  }
  function poseDifference(pose, base) {
    return {
      positions: pose.positions.map((value, i) => value - base.positions[i]),
      normals: pose.normals.map((value, i) => value - base.normals[i])
    };
  }
  function prepareFoldedPages(page) {
    packetPoses.clear();
    behind.forEach((paper, number) => {
      paper.mesh.visible = number < page || number > page && number < page + turnSpan;
    });
    const count = Math.max(0, page - 1);
    const baseStart = turnSpan > 1 ? packetStart(sheet, 0) : null;
    const baseEnd = turnSpan > 1 ? captureFoldPose(sheet, page, count + turnSpan) : null;
    for (let number = 1; number < page + turnSpan; number++) {
      if (number === page) continue;
      let paper = behind.get(number);
      if (!paper) {
        paper = leaf();
        paper.material.map = blank;
        paper.back.value = blank;
        paper.bindingShade.value = 0.08;
        behind.set(number, paper);
      }
      paper.mesh.visible = true;
      paper.mesh.position.set(FOLDED_HINGE_X, 0, -COVER_REST_DEPTH);
      if (number > page && baseStart && baseEnd) {
        packetPoses.set(number, {
          from: poseDifference(packetStart(paper, number - page), baseStart),
          to: poseDifference(
            captureFoldPose(paper, number, count + turnSpan),
            baseEnd
          )
        });
        continue;
      }
      const previous = behindPoses.get(number);
      if (previous?.count === count && previous.span === turnSpan) continue;
      const from = previous && previous.count + previous.span === count ? previous.to : captureFoldPose(paper, number, count);
      const to = previous?.count === count + turnSpan ? previous.from : captureFoldPose(paper, number, count + turnSpan);
      behindPoses.set(number, { count, span: turnSpan, from, to, blend: -1 });
    }
  }
  function settleFoldedPages(blend) {
    behind.forEach((paper, number) => {
      if (!paper.mesh.visible || packetPoses.has(number)) return;
      const pose = behindPoses.get(number);
      if (pose.blend === blend) return;
      const points = paper.geometry.attributes.position;
      const normals = paper.geometry.attributes.normal;
      for (let index = 0; index < points.array.length; index++) {
        points.array[index] = THREE.MathUtils.lerp(
          pose.from.positions[index],
          pose.to.positions[index],
          blend
        );
        normals.array[index] = THREE.MathUtils.lerp(
          pose.from.normals[index],
          pose.to.normals[index],
          blend
        );
      }
      points.needsUpdate = true;
      normals.needsUpdate = true;
      pose.blend = blend;
    });
  }
  function render(progress = 0) {
    if (isDisposed) return;
    const curl = 1 - Math.sqrt(1 - THREE.MathUtils.clamp(progress, 0, 1));
    sheet.faceInk.value = 1 - smooth((progress - 0.45) / 0.1);
    sheet.bindingShade.value = openingCover ? 0.04 : 0.035 + 0.045 * smooth(progress);
    const landing = smoother((progress - 0.3) / 0.7);
    const stackBlend = smoother((progress - 0.22) / 0.78);
    const foldedCount = Math.max(0, sheetPage - 1) + turnSpan * stackBlend;
    const movingFold = loadedFoldPosition(sheetPage, foldedCount);
    shapeSheet(
      sheet.geometry,
      curl,
      openingCover ? COVER_FOLD_RADIUS : paperFoldRadius(movingFold),
      openingCover ? 0.095 : 0.075,
      grab,
      openingCover ? COVER_CORNER : PAPER_CORNER,
      foldedRise(movingFold) * landing,
      openingCover ? 1.028 : 1,
      openingCover ? ASPECT * 1.025 : ASPECT
    );
    sheet.mesh.position.z = -COVER_REST_DEPTH * landing;
    sheet.mesh.position.x = openingCover ? THREE.MathUtils.lerp(-8e-3, FOLDED_HINGE_X, landing) : FOLDED_HINGE_X * landing;
    if (openingCover) movingEdge.update();
    pile.forEach((leaf2, index) => {
      if (!leaf2.mesh.visible) return;
      const depth = index + turnSpan * (1 - progress);
      leaf2.bindingShade.value = 0.035 + 4e-3 * Math.min(depth, 5);
      leaf2.mesh.position.z = -depth * 12e-4;
      shapeSheet(leaf2.geometry, 0, radius, 0.075 / (1 + depth * 0.5));
    });
    settleFoldedPages(stackBlend);
    const outerPoints = sheet.geometry.attributes.position;
    const outerNormals = sheet.geometry.attributes.normal;
    packetPoses.forEach((pose, number) => {
      const paper = behind.get(number);
      const points = paper.geometry.attributes.position;
      const normals = paper.geometry.attributes.normal;
      const fan = (number - sheetPage) * 8e-4 * Math.sin(Math.PI * progress);
      for (let i = 0; i < points.array.length; i++) {
        points.array[i] = outerPoints.array[i] + THREE.MathUtils.lerp(pose.from.positions[i], pose.to.positions[i], stackBlend) - outerNormals.array[i] * fan;
        normals.array[i] = outerNormals.array[i] + THREE.MathUtils.lerp(pose.from.normals[i], pose.to.normals[i], stackBlend);
      }
      points.needsUpdate = true;
      normals.needsUpdate = true;
      paper.mesh.position.copy(sheet.mesh.position);
      paper.bindingShade.value = sheet.bindingShade.value;
    });
    renderer.render(scene, camera);
  }
  return {
    groundFootprint,
    setPages(front, bottom, page = 0, cover, pageCount = page + 2, span = 1) {
      if (cover) {
        const stockImage = cover.querySelector(".cover-stock-image");
        const key = `${stockImage?.currentSrc || stockImage?.src || "plain"}:${stockImage?.complete && !!stockImage.naturalWidth}`;
        if (!coverTexture || key !== coverTextureKey) {
          coverTexture?.dispose();
          liningTexture?.dispose();
          coverTexture = paperTexture(cover, width, height);
          liningTexture = paperTexture(cover, width, height, false);
          coverTextureKey = key;
        }
      }
      openingCover = page === 0;
      sheetPage = page;
      turnSpan = openingCover ? 1 : Math.max(1, Math.min(span, pageCount - page - 1));
      prepareFoldPositions(pageCount);
      const next = [paperTexture(front, width, height)];
      next.push(bottom ? paperTexture(bottom, width, height) : blank);
      radius = paperFoldRadius(foldPosition(page));
      sheet.material.map = next[0];
      sheet.back.value = openingCover ? liningTexture || blank : blank;
      sheet.material.roughness = openingCover ? 0.98 : 0.82;
      sheet.material.specularIntensity = openingCover ? 0.25 : 0.85;
      sheet.material.envMapIntensity = 0;
      sheet.material.clearcoat = openingCover ? 0 : 0.12;
      sheet.material.metalness = 0;
      sheet.paperFill.value = openingCover ? 0 : 0.45;
      sheet.mesh.position.set(openingCover ? -8e-3 : 0, 0, 0);
      movingEdge.mesh.visible = openingCover;
      foldedCover.mesh.visible = !openingCover;
      for (const coverLeaf of [foldedCover, backCover]) {
        coverLeaf.bindingShade.value = 0.04;
        coverLeaf.material.roughness = 0.98;
        coverLeaf.material.specularIntensity = 0.25;
        coverLeaf.material.envMapIntensity = 0;
        coverLeaf.material.clearcoat = 0;
        coverLeaf.material.metalness = 0;
        coverLeaf.paperFill.value = 0;
        coverLeaf.material.map = coverTexture || blank;
        coverLeaf.back.value = liningTexture || blank;
      }
      foldedCover.mesh.position.set(FOLDED_HINGE_X, 0, -COVER_REST_DEPTH);
      foldedCover.faceInk.value = 0;
      shapeSheet(
        foldedCover.geometry,
        1,
        COVER_FOLD_RADIUS,
        0,
        0,
        COVER_CORNER,
        0,
        1.028,
        ASPECT * 1.025
      );
      foldedEdge.update();
      backCover.material.map = liningTexture || blank;
      backCover.mesh.position.set(-8e-3, 0, -COVER_REST_DEPTH - 4e-3);
      shapeSheet(
        backCover.geometry,
        0,
        0.07,
        6e-3,
        0,
        COVER_CORNER,
        0,
        1.035,
        ASPECT * 1.045
      );
      backEdge.update();
      for (let i = 0; i < pile.length; i++) {
        const leaf2 = pile[i];
        leaf2.mesh.visible = i < pageCount - page - turnSpan;
        leaf2.material.map = i === 0 ? next[1] : blank;
        leaf2.back.value = blank;
        leaf2.mesh.position.z = -(i + turnSpan) * 12e-4;
        shapeSheet(leaf2.geometry, 0, radius, 0.075 / (1 + (i + turnSpan) * 0.5));
      }
      prepareFoldedPages(page);
      textures.forEach((texture) => {
        if (texture !== blank) texture.dispose();
      });
      textures = next;
    },
    setGrab(y) {
      grab = THREE.MathUtils.clamp(y, -1, 1);
    },
    render,
    dispose() {
      isDisposed = true;
      textures.forEach((texture) => {
        if (texture !== blank) texture.dispose();
      });
      blank.dispose();
      stock.dispose();
      coverTexture?.dispose();
      liningTexture?.dispose();
      movingEdge.dispose();
      foldedEdge.dispose();
      backEdge.dispose();
      [...leaves, ...behind.values()].forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
  };
}
