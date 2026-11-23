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
 * Computes coordinated 3D transform for a book in the collection
 */
export function getCoordinatedBookTransform({
  bookIndex,
  scrollProgress,
  targetBookIndex,
  animationState, // 'inCollection' | 'repositioning' | 'opening' | 'open' | 'closingCover' | 'reversing'
  transitionProgress = 1.0, // 0 to 1 during repositioning and reversing
  dragYaw = 0,
  dimensions,
}) {
  const W = dimensions.width;
  const diff = bookIndex - scrollProgress;
  const absDiff = Math.abs(diff);

  // Lateral step offset: ~83px on 160px width
  const stepX = Math.round(W * 0.52);

  // --- 1. BASELINE FAN CONFIGURATION (Rest state) ---
  const fanX = diff * stepX;
  const fanY = absDiff * 6;

  // Staggered depth layering in baseline fan:
  // Center book (diff = 0): Z = +30px (in front)
  // Left book (diff = -1): Z = -15px
  // Right book (diff = +1): Z = -55px
  let fanZ = 30;
  if (diff < -0.5) {
    fanZ = -15 - (absDiff - 1) * 20;
  } else if (diff > 0.5) {
    fanZ = -55 - (absDiff - 1) * 20;
  }

  const fanRotateZ = diff * 8.5;
  const fanScale = Math.max(0.75, 1 - absDiff * 0.06);

  const isAnyActive = targetBookIndex !== null && animationState !== "inCollection";

  if (!isAnyActive) {
    let fanOpacity = 1;
    if (absDiff > 1.35) {
      fanOpacity = Math.max(0, 1 - (absDiff - 1.35) / 0.45);
    }
    if (absDiff >= 1.8) {
      fanOpacity = 0;
    }

    const zIndex = Math.max(1, Math.round(30 - absDiff * 8));
    const activeRotateY = dragYaw ? Math.max(-28, Math.min(28, dragYaw)) : 0;

    return {
      x: fanX,
      y: fanY,
      z: fanZ,
      rotateZ: fanRotateZ,
      rotateY: activeRotateY,
      scale: fanScale,
      opacity: fanOpacity,
      zIndex,
      coverAngle: 0,
      isTarget: false,
    };
  }

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
