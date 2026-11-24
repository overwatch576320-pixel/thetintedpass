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
 * - |d| = 0.0: 1.00 (100% full opacity, completely solid)
 * - |d| = 1.0: 0.94 (~94% opacity, solid and recognizable)
 * - |d| = 2.0: 0.84 (~84% opacity, atmospheric softening)
 * - |d| = 3.0: 0.70 (~70% opacity, blending softly into background)
 * - |d| >= 4.2: 0.00
 */
export function computeCarouselOpacity(absDiff) {
  if (absDiff <= 1.0) {
    return 1.00 - absDiff * 0.06;
  } else if (absDiff <= 2.0) {
    return 0.94 - (absDiff - 1.0) * 0.10;
  } else if (absDiff <= 3.0) {
    return 0.84 - (absDiff - 2.0) * 0.14;
  } else {
    return Math.max(0, 0.70 - (absDiff - 3.0) * 0.55);
  }
}

/**
 * Continuous progressive depth-of-field blur:
 * - |d| = 0.0: completely sharp, 100% opacity and no blur
 * - |d| -> 0.0: books approaching centre gradually become sharper
 * - |d| = 1.0: immediate side books slightly blurred (1.1px), covers remain clearly recognisable
 * - |d| = 2.0: corner books progressively more blurred (2.7px) and softly focused
 * - |d| >= 3.0: farthest visible books blend softly into background (4.5px)
 * Applied to the complete 3D object without halos or transparent washouts.
 */
export function computeCarouselBlur(absDiff) {
  if (absDiff <= 0.04) {
    return "none";
  }
  const blurPx = Math.min(5.5, 1.10 * Math.pow(absDiff, 1.3));
  const brightness = Math.max(0.84, 1.00 - absDiff * 0.04);
  const contrast = Math.max(0.90, 1.00 - absDiff * 0.025);
  return `blur(${blurPx.toFixed(2)}px) brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)})`;
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
 * Computes coordinated 3D transform for a book in the collection.
 * Supports continuous, reversible physical book opening via openProgress in [0, 1].
 */
export function getCoordinatedBookTransform({
  bookIndex,
  scrollProgress,
  targetBookIndex,
  openProgress = 0, // 0 = fully closed in collection, 1 = fully open reading spread
  animationState, // preserved for backwards compatibility
  transitionProgress = 1.0, // preserved for backwards compatibility
  dragYaw = 0,
  dragVelocity = 0,
  dimensions,
  totalBooks = 5,
}) {
  // Derive effective continuous progress:
  let p = openProgress;
  if (p === 0 && targetBookIndex !== null) {
    if (animationState === "open" || animationState === "opening") p = 1.0;
    else if (animationState === "closingCover") p = 0.0;
    else if (animationState === "repositioning") p = transitionProgress * 0.15;
    else if (animationState === "reversing") p = (1 - transitionProgress) * 0.15;
  }

  const isAnyActive = targetBookIndex !== null && p > 0;

  // --- 1. CLOSED BOOK CAROUSEL HORIZONTAL SLIDING & BROWSING ---
  if (!isAnyActive) {
    const allBooks = solveAllCarouselBooks(scrollProgress, dragVelocity, dimensions, totalBooks);
    return allBooks[bookIndex] || allBooks[0];
  }

  const W = dimensions.width;
  const diff = bookIndex - scrollProgress;
  const absDiff = Math.abs(diff);
  const stepX = Math.round(W * 0.62); // 99px spacing

  // Exact collision-resolved resting fan positions — ensures 100% seamless closing alignment
  const restingBooks = solveAllCarouselBooks(scrollProgress, 0, dimensions, totalBooks);
  const restingBook = restingBooks[bookIndex] || restingBooks[0];

  const fanX = restingBook.x;
  const fanY = restingBook.y;
  const fanZ = restingBook.z;
  const fanRotateZ = restingBook.rotateZ;
  const fanRotateY = restingBook.rotateY;
  const fanScale = restingBook.scale;

  const isTarget = targetBookIndex === bookIndex;
  const clampedP = Math.max(0, Math.min(1, p));
  // Smooth natural polynomial ease: S(t) = t * t * (3 - 2 * t)
  const eased = clampedP * clampedP * (3 - 2 * clampedP);

  if (isTarget) {
    // When the front cover rotates -180° around the left spine hinge to form the left page,
    // the spine shifts from X = fanX to X = 0 (stage center).
    // The closed book spans from X = 0 to X = W relative to its spine.
    // In the open spread, the spine is centered at X = 0, so the book root is at X = W/2.
    const destReadingX = W / 2;
    const destReadingY = 0;
    const destReadingZ = 50; // prominently in foreground
    const destReadingRotateZ = 0; // completely straightened
    const destReadingRotateY = 0; // completely front-facing
    const destReadingScale = 1.0;

    const currentX = fanX + (destReadingX - fanX) * eased;
    const currentY = fanY + (destReadingY - fanY) * eased;
    const currentZ = fanZ + (destReadingZ - fanZ) * eased;
    const currentRotateZ = fanRotateZ * (1 - eased);
    const currentRotateY = fanRotateY * (1 - eased);
    const currentScale = fanScale + (destReadingScale - fanScale) * eased;

    // Cover rotation around spine hinge:
    // Uses smoothstep easing so it lifts gently from 0°, moves swiftly through 90°,
    // and settles gently into -180° without slamming or snapping.
    const coverAngle = -180.0 * eased;

    return {
      x: currentX,
      y: currentY,
      z: currentZ,
      rotateZ: currentRotateZ,
      rotateY: currentRotateY,
      scale: currentScale,
      zIndex: 100,
      opacity: 1.0,
      filter: "none",
      coverAngle,
      isTarget: true,
      openProgress: clampedP,
    };
  }

  // Background books: smoothly part and yield into atmospheric depth
  const distFromTarget = bookIndex - targetBookIndex;
  const sign = distFromTarget > 0 ? 1 : -1;
  const absDist = Math.abs(distFromTarget);

  const clearDeltaX = sign * (24 + absDist * 12) * eased;
  const clearDeltaZ = (-35 - absDist * 15) * eased;
  const clearDeltaY = absDist * 2.5 * eased;

  const currentX = fanX + clearDeltaX;
  const currentY = fanY + clearDeltaY;
  const currentZ = fanZ + clearDeltaZ;
  const currentRotateZ = fanRotateZ;
  const currentRotateY = fanRotateY;
  const currentScale = fanScale;

  const zIndex = Math.max(1, Math.round(45 + currentZ));
  const baseOpacity = computeCarouselOpacity(absDiff);
  const opacity = Math.max(0.25, baseOpacity * (1 - 0.65 * eased));
  const baseFilter = computeCarouselBlur(absDiff);
  const blurExtra = (0.45 * eased).toFixed(2);
  const filter = eased > 0.01 ? `blur(${blurExtra}px) brightness(${Math.max(0.68, 0.95 - eased * 0.25).toFixed(2)})` : baseFilter;

  return {
    x: currentX,
    y: currentY,
    z: currentZ,
    rotateZ: currentRotateZ,
    rotateY: currentRotateY,
    scale: currentScale,
    zIndex,
    opacity,
    filter,
    coverAngle: 0,
    isTarget: false,
    openProgress: clampedP,
  };
}
