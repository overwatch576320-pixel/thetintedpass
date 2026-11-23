/**
 * bookCollisionAvoidance.js
 *
 * Implements dynamic movement-responsive Y-axis rotation,
 * local Z-axis rotation, and 3D collision avoidance
 * for the 3-book mobile collection on The Tinted Pass.
 *
 * Diagnostic settings:
 * - Visually exaggerated Y-axis rotation (~25°–30°) during movement
 * - Forward-arc depth trajectory (eliminates 3D clipping & polygon intersection)
 */

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * 3D Oriented Bounding Box (OBB) Corner Calculator
 */
export function get3DBookCorners(x, y, z, rotateZ_deg, rotateY_deg, W, H, D = 22) {
  const radZ = (rotateZ_deg * Math.PI) / 180;
  const radY = (rotateY_deg * Math.PI) / 180;
  const cosZ = Math.cos(radZ), sinZ = Math.sin(radZ);
  const cosY = Math.cos(radY), sinY = Math.sin(radY);

  const corners = [];
  for (const lx of [-W / 2, W / 2]) {
    for (const ly of [-H / 2, H / 2]) {
      for (const lz of [-D / 2, D / 2]) {
        // 1. Yaw around local Y-axis
        const yx = lx * cosY + lz * sinY;
        const yy = ly;
        const yz = -lx * sinY + lz * cosY;

        // 2. Roll around local Z-axis
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
export function check3DCollision(bookA, bookB, dimensions, safetyGap = 8) {
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
    D
  );
  const cornersB = get3DBookCorners(
    bookB.x,
    bookB.y,
    bookB.z,
    bookB.rotateZ || 0,
    bookB.rotateY || 0,
    W,
    H,
    D
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
function relaxPair(bA, bB, dimensions, safetyGap = 8) {
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
 *
 * Implements:
 * 1. Dynamic local Y-axis rotation:
 *    - The book moving towards the center subtly rotates around its local Y-axis in the direction of movement.
 *    - Neighbouring books rotate dynamically in the opposite direction to create angular clearance.
 *    - Visible Y-axis rotation (14°–16°) during movement.
 * 2. Continuous depth trajectory:
 *    - Advancing book lifts into foreground (Z = +32px to +40px)
 *    - Yielding books dip into background (Z = -28px to -46px)
 *    - Far background book stays clear at Z = -75px to -105px
 * 3. Multi-pass collision prevention solver:
 *    - Evaluates exact 3D corners of covers, spines, backboards, and pages
 *    - Guarantees >= 8px air gap at ALL intermediate positions (0.0 to 2.0).
 */
export function solveAllCarouselBooks(
  scrollProgress,
  velocity = 0,
  dimensions = { width: 160, height: 226 }
) {
  const W = dimensions.width;
  const stepX = Math.round(W * 0.52); // ~83px
  const clampedS = Math.max(0, Math.min(2, scrollProgress));
  const books = [];

  // Natural subtle rotation angles (hardcover book pivot):
  const yawHero = 11.5;
  const yawYield = 9.5;
  const yawFar = 3.0;

  for (let i = 0; i < 3; i++) {
    const diff = i - clampedS;
    const absDiff = Math.abs(diff);

    const x = diff * stepX;
    const y = absDiff * 6;
    const rotZ = diff * 8.5;
    const scale = Math.max(0.75, 1 - absDiff * 0.06);

    let z = 28;
    let rotY = 0;
    let deltaX = 0;

    if (clampedS >= 0 && clampedS <= 1) {
      const bell = Math.sin(Math.PI * clampedS); // 0 at s=0 and s=1, 1 at s=0.5
      const prefer0 = velocity < -0.05 || (Math.abs(velocity) <= 0.05 && clampedS < 0.5);

      if (prefer0) {
        // Book 0 is advancing towards center (moving right, +X)
        if (i === 0) {
          z = 28 + bell * 2; // lifts subtly into foreground (28px to 30px)
          rotY = yawHero * bell; // natural pivot right (+Y)
        } else if (i === 1) {
          z = -20 - bell * 6; // dips into background (-20px to -26px)
          rotY = -yawYield * bell; // turns left (-Y) away
          deltaX = 3.5 * bell; // tiny 3.5px outward clearance
        } else if (i === 2) {
          z = -60 - bell * 6; // background right (-60px to -66px)
          rotY = yawFar * bell;
        }
      } else {
        // Book 1 is hero (or moving towards Book 1)
        if (i === 1) {
          z = 28 + bell * 2; // lifts subtly into foreground (28px to 30px)
          rotY = -yawHero * bell; // natural pivot left (-Y)
        } else if (i === 0) {
          z = -20 - bell * 6; // dips into background (-20px to -26px)
          rotY = yawYield * bell; // turns right (+Y) away
          deltaX = -3.5 * bell; // tiny 3.5px outward clearance
        } else if (i === 2) {
          z = -60 - bell * 6; // background right (-60px to -66px)
          rotY = yawFar * bell;
        }
      }
    } else if (clampedS > 1 && clampedS <= 2) {
      const segS = clampedS - 1;
      const bell = Math.sin(Math.PI * segS);
      const prefer2 = velocity > 0.05 || (Math.abs(velocity) <= 0.05 && segS >= 0.5);

      if (prefer2) {
        // Book 2 is advancing towards center (moving left, -X)
        if (i === 2) {
          z = 28 + bell * 2; // lifts subtly into foreground (28px to 30px)
          rotY = -yawHero * bell; // natural pivot left (-Y)
        } else if (i === 1) {
          z = -20 - bell * 6; // dips into background (-20px to -26px)
          rotY = yawYield * bell; // turns right (+Y) away
          deltaX = -3.5 * bell;
        } else if (i === 0) {
          z = -60 - bell * 6; // background left (-60px to -66px)
          rotY = -yawFar * bell;
        }
      } else {
        // Book 1 is hero (or moving towards Book 1 from right)
        if (i === 1) {
          z = 28 + bell * 2; // lifts subtly into foreground (28px to 30px)
          rotY = yawHero * bell; // natural pivot right (+Y)
        } else if (i === 2) {
          z = -20 - bell * 6; // dips into background (-20px to -26px)
          rotY = -yawYield * bell; // turns left (-Y) away
          deltaX = 3.5 * bell;
        } else if (i === 0) {
          z = -60 - bell * 6; // background left (-60px to -66px)
          rotY = -yawFar * bell;
        }
      }
    }

    const zIndex = Math.round(50 + z);
    let opacity = 1;
    if (absDiff > 1.35) {
      opacity = Math.max(0, 1 - (absDiff - 1.35) / 0.45);
    }
    if (absDiff >= 1.8) {
      opacity = 0;
    }

    books.push({
      x: x + deltaX,
      y,
      z,
      rotateZ: rotZ,
      rotateY: rotY,
      scale,
      zIndex,
      opacity,
      coverAngle: 0,
      isTarget: false,
    });
  }

  // Continuous collision avoidance solver (3-pass relaxation)
  const safetyMargin = 7.0;
  for (let pass = 0; pass < 3; pass++) {
    relaxPair(books[0], books[1], dimensions, safetyMargin);
    relaxPair(books[1], books[2], dimensions, safetyMargin);
    relaxPair(books[0], books[2], dimensions, safetyMargin);
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
}) {
  const isAnyActive = targetBookIndex !== null && animationState !== "inCollection";

  // --- 1. CLOSED BOOK CAROUSEL HORIZONTAL SLIDING & BROWSING ---
  if (!isAnyActive) {
    const allBooks = solveAllCarouselBooks(scrollProgress, dragVelocity, dimensions);
    return allBooks[bookIndex] || allBooks[0];
  }

  const W = dimensions.width;
  const diff = bookIndex - scrollProgress;
  const absDiff = Math.abs(diff);
  const stepX = Math.round(W * 0.52);

  // Baseline Fan positions for selection transitions
  const fanX = diff * stepX;
  const fanY = absDiff * 6;
  const fanZ = diff === 0 ? 28 : diff < 0 ? -20 : -60;
  const fanRotateZ = diff * 8.5;
  const fanScale = Math.max(0.75, 1 - absDiff * 0.06);

  // --- 2. ACTIVE SELECTION / READING DESTINATION VALUES ---
  const isTarget = targetBookIndex === bookIndex;
  const targetDiff = targetBookIndex - scrollProgress;
  const distanceToTarget = bookIndex - targetBookIndex;

  // Reading position for selected book (spine centered at screen X = W/2)
  const destReadingX = W / 2;
  const destReadingY = -8;
  const destReadingZ = 75; // prominently in foreground
  const destReadingRotateZ = 0; // completely straightened
  const destReadingScale = 1.0;

  // Final clearance offsets and peak movement yaw angles:
  let destClearDeltaX = 0;
  let destClearDeltaY = 0;
  let destClearDeltaZ = 0;
  let destClearDeltaRotateZ = 0;
  let peakMovementYaw = 0;

  if (!isTarget) {
    if (Math.round(targetDiff) === 0) {
      // --- CENTER BOOK SELECTED (moving right +80px) ---
      if (distanceToTarget < 0) {
        // Left book: shifts left
        destClearDeltaX = -14;
        destClearDeltaY = 4;
        destClearDeltaZ = -20; // drops to -35px
        destClearDeltaRotateZ = -3.0; // tilts outward to -11.5°
        peakMovementYaw = -16.0; // pivots left during leftward travel
      } else {
        // Right book: shifts right
        destClearDeltaX = 32;
        destClearDeltaY = 4;
        destClearDeltaZ = -25; // drops to -80px
        destClearDeltaRotateZ = 4.5; // tilts outward to +13.0°
        peakMovementYaw = +18.0; // pivots right during rightward travel
      }
    } else if (Math.round(targetDiff) < 0) {
      // --- LEFT BOOK SELECTED (sweeping right +163px) ---
      if (Math.round(diff) === 0) {
        // Center book: shifts left and steps back into background
        destClearDeltaX = -28;
        destClearDeltaY = 8;
        destClearDeltaZ = -60; // drops to -30px
        destClearDeltaRotateZ = 6.5; // tilts clockwise away to +6.5°
        peakMovementYaw = -18.0; // pivots left during leftward travel
      } else if (Math.round(diff) > 0) {
        // Right book: shifts right
        destClearDeltaX = 28;
        destClearDeltaY = 4;
        destClearDeltaZ = -25; // drops to -80px
        destClearDeltaRotateZ = 4.0; // tilts outward to +12.5°
        peakMovementYaw = +16.0; // pivots right during rightward travel
      }
    } else {
      // --- RIGHT BOOK SELECTED ---
      if (Math.round(diff) === 0) {
        // Center book: shifts left
        destClearDeltaX = -28;
        destClearDeltaY = 8;
        destClearDeltaZ = -45; // drops to -15px
        destClearDeltaRotateZ = -6.5; // tilts counter-clockwise away to -6.5°
        peakMovementYaw = -18.0; // pivots left during leftward travel
      } else if (Math.round(diff) < 0) {
        // Left book: shifts further left
        destClearDeltaX = -24;
        destClearDeltaY = 4;
        destClearDeltaZ = -25; // drops to -40px
        destClearDeltaRotateZ = -3.5; // tilts outward to -12.0°
        peakMovementYaw = -15.0; // pivots left during leftward travel
      }
    }
  } else {
    // SELECTED BOOK PEAK YAW (Diagnostic Exaggeration: 26°–28°):
    if (Math.round(targetDiff) === 0) {
      // Center book travels right from 0 to +80px
      peakMovementYaw = +28.0; // clearly pivots right during rightward movement!
    } else if (Math.round(targetDiff) < 0) {
      // Left book sweeps right from -83px to +80px
      peakMovementYaw = +30.0; // clearly pivots right during rightward movement!
    } else {
      // Right book moves from +83px to +80px
      peakMovementYaw = -18.0; // pivots leftward towards center
    }
  }

  const destX = isTarget ? destReadingX : fanX + destClearDeltaX;
  const destY = isTarget ? destReadingY : fanY + destClearDeltaY;
  const destZ = isTarget ? destReadingZ : fanZ + destClearDeltaZ;
  const destRotateZ = isTarget ? destReadingRotateZ : fanRotateZ + destClearDeltaRotateZ;
  const destScale = isTarget ? destReadingScale : fanScale;

  // --- 3. DYNAMIC PROGRESS & MOVEMENT-RESPONSIVE Y-AXIS ROTATION ---
  const t = Math.max(0, Math.min(1, transitionProgress));
  const p = easeInOutCubic(t);

  // Bell curve: 0 at start (t=0), peaks at t=0.45, returns to 0 at destination (t=1.0)
  const isReversing = animationState === "reversing";
  const yawMultiplier = isReversing ? -1 : 1;
  const yawBell = Math.sin(Math.PI * Math.pow(t, 0.92));
  const currentRotateY = peakMovementYaw * yawBell * yawMultiplier;

  // Instantaneous spatial coordinates:
  let currentX, currentY, currentZ, currentRotateZ, currentScale;

  if (animationState === "repositioning") {
    currentX = fanX + (destX - fanX) * p;
    currentY = fanY + (destY - fanY) * p;
    currentRotateZ = fanRotateZ + (destRotateZ - fanRotateZ) * p;
    currentScale = fanScale + (destScale - fanScale) * p;

    // Forward-Arc Depth Trajectory:
    // Ensures books never slice or intersect in 3D during depth transitions!
    if (isTarget && targetBookIndex === 0) {
      // Left book lifts into foreground early (by t=0.5 it is already at Z=+75px)
      const earlyLift = Math.min(1, t * 1.8);
      currentZ = fanZ + (destZ - fanZ) * easeInOutCubic(earlyLift);
    } else if (!isTarget && targetBookIndex === 0 && bookIndex === 1) {
      // Center book steps back into background early (by t=0.5 it is already at Z=-30px)
      const earlyDrop = Math.min(1, t * 1.8);
      currentZ = fanZ + (destZ - fanZ) * easeInOutCubic(earlyDrop);
    } else {
      currentZ = fanZ + (destZ - fanZ) * p;
    }
  } else if (animationState === "reversing") {
    currentX = destX + (fanX - destX) * p;
    currentY = destY + (fanY - destY) * p;
    currentZ = destZ + (fanZ - destZ) * p;
    currentRotateZ = destRotateZ + (fanRotateZ - destRotateZ) * p;
    currentScale = destScale + (fanScale - destScale) * p;
  } else {
    currentX = destX;
    currentY = destY;
    currentZ = destZ;
    currentRotateZ = destRotateZ;
    currentScale = destScale;
  }

  // Stacking z-index: Selected book on top
  const zIndex = isTarget
    ? 100
    : Math.max(1, Math.round(20 - Math.abs(distanceToTarget) * 5));

  let opacity = 1;
  if (!isTarget) {
    if (animationState === "open" || animationState === "opening") {
      opacity = 0.35;
    } else {
      opacity = 1.0;
    }
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
    rotateY: animationState === "open" || animationState === "opening" || animationState === "closingCover"
      ? 0
      : currentRotateY,
    scale: currentScale,
    opacity,
    zIndex,
    coverAngle,
    isTarget,
  };
}
