/**
 * bookCollisionAvoidance.js
 *
 * Implements:
 * 1. Perfectly front-facing centre book (100% scale, Y-axis rotation exactly 0°).
 * 2. Mirrored Y-axis rotation for side books (75% scale, turning slightly away from viewer):
 *    - Left book: negative Y-rotation (-14°).
 *    - Right book: positive Y-rotation (+14°).
 *    - Corner books: ±18°, farthest books: ±20°.
 *    - Continuous and smooth interpolation to 0° as any book approaches centre.
 * 3. Elimination of 3D clipping & intersections:
 *    - Continuous 3D Oriented Bounding Box collision solver with 5-pass relaxation.
 *    - Forward-arc depth trajectory during passing moments.
 *    - Spacious horizontal spacing (stepX = 99px).
 * 4. Progressive opacity and depth-of-field blur:
 *    - Centre: 100% opacity, completely sharp (filter: none).
 *    - Immediate side books: ~94% opacity, mostly sharp (blur: 0.22px).
 *    - Corner books: ~88% opacity, noticeably softer (blur: 0.48px).
 *    - Farthest books: ~76% opacity, subtle atmospheric blur (blur: 0.78px).
 */

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Piecewise continuous scale hierarchy:
 * |d| = 0.0 -> 1.00 (100% full original scale)
 * |d| = 1.0 -> 0.75 (75% of original scale)
 * |d| = 2.0 -> 0.67 (67%, within 65–70% target)
 * |d| >= 3.0 -> 0.58 (58%, within 55–60% target)
 */
export function computeCarouselScale(absDiff) {
  if (absDiff <= 1.0) {
    return 1.00 - absDiff * 0.25;
  } else if (absDiff <= 2.0) {
    return 0.75 - (absDiff - 1.0) * 0.08;
  } else if (absDiff <= 3.0) {
    return 0.67 - (absDiff - 2.0) * 0.09;
  } else {
    return Math.max(0.50, 0.58 - (absDiff - 3.0) * 0.08);
  }
}

/**
 * Continuous progressive opacity hierarchy:
 * |d| = 0.0 -> 1.00 (100% full opacity)
 * |d| = 1.0 -> 0.94 (~90–95% opacity)
 * |d| = 2.0 -> 0.88 (~85–90% opacity)
 * |d| = 3.0 -> 0.76 (~70–80% opacity)
 * |d| >= 4.2 -> 0.00
 */
export function computeCarouselOpacity(absDiff) {
  if (absDiff <= 1.0) {
    return 1.00 - absDiff * 0.06;
  } else if (absDiff <= 2.0) {
    return 0.94 - (absDiff - 1.0) * 0.06;
  } else if (absDiff <= 3.0) {
    return 0.88 - (absDiff - 2.0) * 0.12;
  } else {
    return Math.max(0, 0.76 - (absDiff - 3.0) * 0.65);
  }
}

/**
 * Continuous progressive depth-of-field blur:
 * |d| <= 0.35 -> none (centre book is completely sharp)
 * |d| = 1.0   -> blur(0.22px) brightness(0.96) (mostly sharp)
 * |d| = 2.0   -> blur(0.48px) brightness(0.93) (noticeably softer)
 * |d| >= 3.0  -> blur(0.78px) brightness(0.90) (subtle atmospheric distance blur)
 */
export function computeCarouselBlur(absDiff) {
  if (absDiff <= 0.35) {
    return "none";
  }
  let blurPx;
  if (absDiff <= 1.0) {
    blurPx = ((absDiff - 0.35) / 0.65) * 0.22;
  } else if (absDiff <= 2.0) {
    blurPx = 0.22 + (absDiff - 1.0) * 0.26;
  } else {
    blurPx = Math.min(0.85, 0.48 + (absDiff - 2.0) * 0.30);
  }
  const brightness = Math.max(0.88, 1.00 - absDiff * 0.035);
  return `blur(${blurPx.toFixed(2)}px) brightness(${brightness.toFixed(2)})`;
}

/**
 * INWARD-FACING Mirrored Y-axis rotation:
 * - diff = 0 (centre): exactly 0.0° (front-facing!)
 * - diff < 0 (left books): POSITIVE rotY (+27° at |d|=1, +45° at |d|=2, +59° at |d|=3)
 *   turning front covers inward towards the right (centre)!
 * - diff > 0 (right books): NEGATIVE rotY (-27° at |d|=1, -45° at |d|=2, -59° at |d|=3)
 *   turning front covers inward towards the left (centre)!
 * Symmetrically mirrored inward curved fan around the centre book with dramatic perspective.
 */
export function computeCarouselMirroredYaw(diff) {
  const absDiff = Math.abs(diff);
  const sign = diff < 0 ? -1 : diff > 0 ? 1 : 0;
  // Negative sign ensures: left (diff < 0) gets positive rotY (turns right towards centre),
  // right (diff > 0) gets negative rotY (turns left towards centre).
  if (absDiff <= 1.0) {
    return -sign * absDiff * 27.0;
  } else if (absDiff <= 2.0) {
    return -sign * (27.0 + (absDiff - 1.0) * 18.0);
  } else {
    return -sign * Math.min(62.0, 45.0 + (absDiff - 2.0) * 14.0);
  }
}

/**
 * Progressive visual depth hierarchy (Z-axis):
 * |d| = 0 -> +32px (foreground center reading position)
 * |d| = 1 -> -16px (immediate side books behind center book)
 * |d| = 2 -> -66px (corner books layered deeper into the background)
 * |d| = 3 -> -98px (farthest books)
 */
export function getCarouselBaseZ(absDiff) {
  if (absDiff <= 1.0) {
    return 32 - absDiff * 48;
  } else if (absDiff <= 2.0) {
    return -16 - (absDiff - 1.0) * 50;
  } else {
    return -66 - (absDiff - 2.0) * 32;
  }
}

/**
 * 3D Oriented Bounding Box (OBB) Corner Calculator
 * Anchored to the center-bottom origin (matching CSS transform-origin: center bottom)
 * with uniform 3D scaling applied to all physical dimensions (cover, spine, pages, backboard).
 */
export function get3DBookCorners(x, y, z, rotateZ_deg, rotateY_deg, W, H, D = 22, scale = 1.0) {
  const radZ = (rotateZ_deg * Math.PI) / 180;
  const radY = (rotateY_deg * Math.PI) / 180;
  const cosZ = Math.cos(radZ), sinZ = Math.sin(radZ);
  const cosY = Math.cos(radY), sinY = Math.sin(radY);

  const corners = [];
  // Center-bottom origin: lx in [-W/2, W/2], ly in [-H, 0]
  for (const rawLx of [-W / 2, W / 2]) {
    for (const rawLy of [-H, 0]) {
      for (const rawLz of [-D / 2, D / 2]) {
        const lx = rawLx * scale;
        const ly = rawLy * scale;
        const lz = rawLz * scale;

        // 1. Yaw around local Y-axis
        const yx = lx * cosY + lz * sinY;
        const yy = ly;
        const yz = -lx * sinY + lz * cosY;

        // 2. Roll around local Z-axis (grounded at bottom)
        const zx = yx * cosZ - yy * sinZ;
        const zy = yx * sinZ + yy * cosZ;
        const zz = yz;

        // 3. Translation
        corners.push({ x: x + zx, y: y + zy, z: z + zz });
      }
    }
  }
  return corners;
}

/**
 * Evaluates 3D Collision and Safety Gap between two books
 */
export function check3DCollision(bookA, bookB, dimensions, safetyGap = 6) {
  const W = dimensions.width;
  const H = dimensions.height;
  const D = 22;

  const cornersA = get3DBookCorners(
    bookA.x,
    bookA.y,
    bookA.z,
    bookA.rotateZ || 0,
    bookA.rotateY || 0,
    W,
    H,
    D,
    bookA.scale || 1.0
  );
  const cornersB = get3DBookCorners(
    bookB.x,
    bookB.y,
    bookB.z,
    bookB.rotateZ || 0,
    bookB.rotateY || 0,
    W,
    H,
    D,
    bookB.scale || 1.0
  );

  const minZA = Math.min(...cornersA.map((c) => c.z));
  const maxZA = Math.max(...cornersA.map((c) => c.z));
  const minZB = Math.min(...cornersB.map((c) => c.z));
  const maxZB = Math.max(...cornersB.map((c) => c.z));
  const zClearance = Math.max(minZB - maxZA, minZA - maxZB);

  const minXA = Math.min(...cornersA.map((c) => c.x));
  const maxXA = Math.max(...cornersA.map((c) => c.x));
  const minXB = Math.min(...cornersB.map((c) => c.x));
  const maxXB = Math.max(...cornersB.map((c) => c.x));
  const xClearance = Math.max(minXB - maxXA, minXA - maxXB);

  const effectiveGap = Math.max(zClearance, xClearance);
  const collides = effectiveGap < safetyGap;

  return {
    collides,
    minGap: effectiveGap,
    zGap: zClearance,
    xGap: xClearance,
  };
}

/**
 * Multi-pass 3D collision relaxation solver for carousel books.
 * Enforces a strict minimum physical air gap between all book bodies, covers, and spines.
 */
function relaxPair(bA, bB, dimensions, safetyGap = 6) {
  const col = check3DCollision(bA, bB, dimensions, safetyGap);
  if (!col.collides) return;

  const deficit = safetyGap - col.minGap;
  if (deficit <= 0) return;

  if (bA.z >= bB.z) {
    bA.z += deficit * 0.6;
    bB.z -= deficit * 0.4;
  } else {
    bB.z += deficit * 0.6;
    bA.z -= deficit * 0.4;
  }
}

/**
 * Computes continuous, collision-free 3D transforms for all books in the closed collection carousel.
 */
export function solveAllCarouselBooks(
  scrollProgress,
  velocity = 0,
  dimensions = { width: 160, height: 226 },
  totalBooks = 5
) {
  const W = dimensions.width;
  const stepX = Math.round(W * 0.62); // 99px spacing
  const maxIdx = totalBooks - 1;
  const clampedS = Math.max(0, Math.min(maxIdx, scrollProgress));
  const books = [];

  // Active transition segment
  const segIdx = Math.min(totalBooks - 2, Math.floor(clampedS));
  const segProgress = clampedS - segIdx; // [0, 1]
  const bell = Math.sin(Math.PI * segProgress);

  const preferLeft = velocity < -0.05 || (Math.abs(velocity) <= 0.05 && segProgress < 0.5);

  for (let i = 0; i < totalBooks; i++) {
    const diff = i - clampedS;
    const absDiff = Math.abs(diff);

    const scale = computeCarouselScale(absDiff);
    const x = diff * stepX;
    const y = absDiff * 5.0;
    const rotZ = diff * 7.0;

    // Mirrored Y-axis rotation that smoothly reaches exactly 0° at center (diff = 0)
    let rotY = computeCarouselMirroredYaw(diff);

    let z = getCarouselBaseZ(absDiff);
    let deltaX = 0;

    // Forward-arc depth trajectory during active passing interval:
    if (preferLeft) {
      if (i === segIdx) {
        // Book segIdx is advancing towards center (moving right, +X)
        z = 32 + bell * 4;
        deltaX = -2 * bell;
      } else if (i === segIdx + 1) {
        // Book segIdx + 1 yields into background
        z = -24 - bell * 8;
        deltaX = 2 * bell;
      } else if (i > segIdx + 1) {
        z -= bell * 12;
      } else if (i < segIdx) {
        z -= bell * 12;
      }
    } else {
      if (i === segIdx + 1) {
        // Book segIdx + 1 is advancing towards center (moving left, -X)
        z = 32 + bell * 4;
        deltaX = 2 * bell;
      } else if (i === segIdx) {
        // Book segIdx yields into background
        z = -24 - bell * 8;
        deltaX = -2 * bell;
      } else if (i > segIdx + 1) {
        z -= bell * 12;
      } else if (i < segIdx) {
        z -= bell * 12;
      }
    }

    const zIndex = Math.round(50 + z);
    const opacity = computeCarouselOpacity(absDiff);
    const filter = computeCarouselBlur(absDiff);

    books.push({
      x: x + deltaX,
      y,
      z,
      rotateZ: rotZ,
      rotateY: rotY,
      scale,
      zIndex,
      opacity,
      filter,
      coverAngle: 0,
      isTarget: false,
    });
  }

  // Continuous collision avoidance solver (5-pass relaxation across all pairs)
  const safetyMargin = 6.0;
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < books.length; i++) {
      for (let j = i + 1; j < Math.min(books.length, i + 3); j++) {
        relaxPair(books[i], books[j], dimensions, safetyMargin);
      }
    }
  }

  return books;
}

/**
 * Computes coordinated 3D transform for a book in the collection
 */
export function getCoordinatedBookTransform({
  bookIndex,
  scrollProgress,
  targetBookIndex,
  animationState, // 'inCollection' | 'repositioning' | 'opening' | 'open' | 'closingCover' | 'reversing'
  transitionProgress = 1.0, // 0 to 1 during repositioning and reversing
  dragYaw = 0,
  dragVelocity = 0,
  dimensions,
  totalBooks = 5,
}) {
  const isAnyActive = targetBookIndex !== null && animationState !== "inCollection";

  // --- 1. CLOSED BOOK CAROUSEL HORIZONTAL SLIDING & BROWSING ---
  if (!isAnyActive) {
    const allBooks = solveAllCarouselBooks(scrollProgress, dragVelocity, dimensions, totalBooks);
    return allBooks[bookIndex] || allBooks[0];
  }

  const W = dimensions.width;
  const diff = bookIndex - scrollProgress;
  const absDiff = Math.abs(diff);
  const stepX = Math.round(W * 0.62); // 99px spacing

  // Baseline Fan positions for selection transitions
  const fanX = diff * stepX;
  const fanY = absDiff * 5.0;
  const fanZ = getCarouselBaseZ(absDiff);
  const fanRotateZ = diff * 7.0;
  const fanRotateY = computeCarouselMirroredYaw(diff);
  const fanScale = computeCarouselScale(absDiff);

  // --- 2. ACTIVE SELECTION / READING DESTINATION VALUES ---
  const isTarget = targetBookIndex === bookIndex;

  // Reading position for selected book (spine centered at screen X = W/2)
  const destReadingX = W / 2;
  const destReadingY = -8;
  const destReadingZ = 75; // prominently in foreground
  const destReadingRotateZ = 0; // completely straightened
  const destReadingRotateY = 0; // completely front-facing
  const destReadingScale = 1.0;

  // Final clearance offsets and peak movement yaw angles:
  let destClearDeltaX = 0;
  let destClearDeltaY = 4;
  let destClearDeltaZ = -25;
  let destClearDeltaRotateZ = 0;
  let peakMovementYaw = 0;

  if (!isTarget) {
    if (bookIndex < targetBookIndex) {
      // Background book on left: shifts leftward to clear space for the open reading spread
      const distFromTarget = targetBookIndex - bookIndex;
      destClearDeltaX = -18 - distFromTarget * 10;
      destClearDeltaZ = -30 - distFromTarget * 15;
      destClearDeltaRotateZ = -3.0;
      peakMovementYaw = -16.0;
    } else {
      // Background book on right: shifts rightward
      const distFromTarget = bookIndex - targetBookIndex;
      destClearDeltaX = 24 + distFromTarget * 10;
      destClearDeltaZ = -30 - distFromTarget * 15;
      destClearDeltaRotateZ = 4.0;
      peakMovementYaw = +16.0;
    }
  } else {
    // Target book: sweeps towards reading position (spine centered at W/2)
    const travelDx = destReadingX - fanX;
    peakMovementYaw = travelDx > 0 ? +26.0 : travelDx < 0 ? -26.0 : 0;
  }

  const destX = isTarget ? destReadingX : fanX + destClearDeltaX;
  const destY = isTarget ? destReadingY : fanY + destClearDeltaY;
  const destZ = isTarget ? destReadingZ : fanZ + destClearDeltaZ;
  const destRotateZ = isTarget ? destReadingRotateZ : fanRotateZ + destClearDeltaRotateZ;
  const destRotateY = isTarget ? destReadingRotateY : fanRotateY;
  const destScale = isTarget ? destReadingScale : fanScale;

  // --- 3. DYNAMIC PROGRESS & MOVEMENT-RESPONSIVE Y-AXIS ROTATION ---
  const t = Math.max(0, Math.min(1, transitionProgress));
  const p = easeInOutCubic(t);

  const isReversing = animationState === "reversing";
  const yawMultiplier = isReversing ? -1 : 1;
  const yawBell = Math.sin(Math.PI * Math.pow(t, 0.92));
  const dynamicMovementYaw = peakMovementYaw * yawBell * yawMultiplier;

  // Instantaneous spatial coordinates:
  let currentX, currentY, currentZ, currentRotateZ, currentRotateY, currentScale;

  if (animationState === "repositioning") {
    currentX = fanX + (destX - fanX) * p;
    currentY = fanY + (destY - fanY) * p;
    currentRotateZ = fanRotateZ + (destRotateZ - fanRotateZ) * p;
    currentRotateY = fanRotateY + (destRotateY - fanRotateY) * p + dynamicMovementYaw;
    currentScale = fanScale + (destScale - fanScale) * p;

    // Forward-Arc Depth Trajectory:
    if (isTarget) {
      const earlyLift = Math.min(1, t * 1.8);
      currentZ = fanZ + (destZ - fanZ) * easeInOutCubic(earlyLift);
    } else {
      const earlyDrop = Math.min(1, t * 1.8);
      currentZ = fanZ + (destZ - fanZ) * easeInOutCubic(earlyDrop);
    }
  } else if (animationState === "reversing") {
    currentX = destX + (fanX - destX) * p;
    currentY = destY + (fanY - destY) * p;
    currentZ = destZ + (fanZ - destZ) * p;
    currentRotateZ = destRotateZ + (fanRotateZ - destRotateZ) * p;
    currentRotateY = destRotateY + (fanRotateY - destRotateY) * p + dynamicMovementYaw;
    currentScale = destScale + (fanScale - destScale) * p;
  } else {
    currentX = destX;
    currentY = destY;
    currentZ = destZ;
    currentRotateZ = destRotateZ;
    currentRotateY = destRotateY;
    currentScale = destScale;
  }

  // Stacking z-index: Selected book on top
  const zIndex = isTarget
    ? 100
    : Math.max(1, Math.round(50 + currentZ));

  let opacity = computeCarouselOpacity(absDiff);
  if (!isTarget) {
    if (animationState === "open" || animationState === "opening") {
      opacity = 0.35;
    }
  } else {
    opacity = 1.0;
  }

  let filter = computeCarouselBlur(absDiff);
  if (!isTarget && (animationState === "open" || animationState === "opening")) {
    filter = "brightness(0.68) blur(0.4px)";
  }

  let coverAngle = 0;
  if (isTarget) {
    if (animationState === "opening" || animationState === "open") {
      coverAngle = -180;
    } else {
      coverAngle = 0;
    }
  }

  return {
    x: currentX,
    y: currentY,
    z: currentZ,
    rotateZ: currentRotateZ,
    rotateY:
      animationState === "open" ||
      animationState === "opening" ||
      animationState === "closingCover"
        ? 0
        : currentRotateY,
    scale: currentScale,
    opacity,
    filter,
    zIndex,
    coverAngle,
    isTarget,
  };
}
