/**
 * bookCollisionAvoidance.js
 *
 * Implements dynamic movement-responsive Y-axis rotation,
 * local Z-axis rotation, and 3D collision avoidance
 * for the 3-book mobile collection on The Tinted Pass.
 *
 * Core Principles:
 * 1. Controlled dynamic local Y-axis rotation during horizontal movement:
 *    - Moving left: pivots around local Y in one direction (negative angle).
 *    - Moving right: pivots around local Y in opposite direction (positive angle).
 *    - As movement slows and reaches destination, Y-axis rotation returns to 0°.
 *    - Movement feels like a natural physical pivot, revealing authentic 3D book thickness.
 * 2. Preserves existing local Z-axis behaviour:
 *    - Selected book straightens to 0°.
 *    - Neighbouring books tilt away to create clearance.
 *    - Outward position adjustments prevent intersection.
 * 3. 3D depth staggering:
 *    - Center book (+30px), Left book (-15px), Right book (-55px) in baseline fan.
 *    - Guaranteed positive safety gap across entire motion path.
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
 * Evaluates 3D Collision and Safety Gap between two books taking into account
 * both Z-axis rotation and dynamic Y-axis rotation.
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

  // Depth interval along world Z
  const minZA = Math.min(...cornersA.map((c) => c.z));
  const maxZA = Math.max(...cornersA.map((c) => c.z));
  const minZB = Math.min(...cornersB.map((c) => c.z));
  const maxZB = Math.max(...cornersB.map((c) => c.z));
  const zClearance = Math.max(minZB - maxZA, minZA - maxZB);

  // Lateral interval along world X
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
 * Computes coordinated 3D transform for a book in the collection,
 * incorporating dynamic local Z-axis rotation, movement-responsive local Y-axis rotation,
 * and 3D collision avoidance.
 */
export function getCoordinatedBookTransform({
  bookIndex,
  scrollProgress,
  targetBookIndex,
  animationState, // 'inCollection' | 'repositioning' | 'opening' | 'open' | 'closingCover' | 'reversing'
  transitionProgress = 1.0, // 0 to 1 during repositioning and reversing
  dragYaw = 0, // dynamic Y-rotation during swipe / drag
  dimensions,
}) {
  const W = dimensions.width;
  const diff = bookIndex - scrollProgress;
  const absDiff = Math.abs(diff);

  // Lateral step offset: ~83px on 160px width
  const stepX = Math.round(W * 0.52);

  // --- 1. BASELINE FAN CONFIGURATION (inCollection rest state) ---
  const fanX = diff * stepX;
  const fanY = absDiff * 6;

  // Staggered depth layering:
  // Center book (diff = 0): Z = +30px (in front)
  // Left book (diff = -1): Z = -15px
  // Right book (diff = +1): Z = -55px
  let fanZ = 30;
  if (diff < -0.5) {
    fanZ = -15 - (absDiff - 1) * 20;
  } else if (diff > 0.5) {
    fanZ = -55 - (absDiff - 1) * 20;
  }

  // Local Z-axis rotation in fanned rest state
  const fanRotateZ = diff * 8.5;
  const fanScale = Math.max(0.75, 1 - absDiff * 0.06);

  // If resting in collection (no book selected):
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

    // Dynamic Y-axis rotation during horizontal swipe/drag:
    // When dragging left (content moving left), books pivot left (dragYaw < 0).
    // When dragging right (content moving right), books pivot right (dragYaw > 0).
    // When settled, dragYaw = 0.
    const activeRotateY = dragYaw ? Math.max(-14, Math.min(14, dragYaw)) : 0;

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
  const targetDiff = targetBookIndex - scrollProgress; // -1 = left, 0 = center, +1 = right
  const distanceToTarget = bookIndex - targetBookIndex;

  // Final reading position for the selected book (spine at screen center)
  const destReadingX = W / 2;
  const destReadingY = -8;
  const destReadingZ = 75; // prominently in foreground
  const destReadingRotateZ = 0; // completely straightened
  const destReadingScale = 1.0;

  // Final clearance offsets for neighbouring books:
  let destClearDeltaX = 0;
  let destClearDeltaY = 0;
  let destClearDeltaZ = 0;
  let destClearDeltaRotateZ = 0;
  let peakMovementYaw = 0; // Peak Y-axis rotation angle during horizontal movement

  if (!isTarget) {
    if (Math.round(targetDiff) === 0) {
      // --- CENTER BOOK SELECTED (moves right by +80px) ---
      if (distanceToTarget < 0) {
        // Left book (book 0): shifts left (-12px)
        destClearDeltaX = -12;
        destClearDeltaY = 4;
        destClearDeltaZ = -15; // drops to -30px
        destClearDeltaRotateZ = -3.0; // tilts outward to -11.5°
        peakMovementYaw = -5.0; // turns left during leftward travel
      } else {
        // Right book (book 2): shifts right (+29px)
        destClearDeltaX = 29;
        destClearDeltaY = 4;
        destClearDeltaZ = -18; // drops to -73px
        destClearDeltaRotateZ = 4.5; // tilts outward to +13.0°
        peakMovementYaw = +8.0; // turns right during rightward travel
      }
    } else if (Math.round(targetDiff) < 0) {
      // --- LEFT BOOK SELECTED (sweeps right by +163px) ---
      if (Math.round(diff) === 0) {
        // Center book (book 1): shifts left (-26px) and steps back
        destClearDeltaX = -26;
        destClearDeltaY = 8;
        destClearDeltaZ = -55; // drops to -25px
        destClearDeltaRotateZ = 6.5; // tilts clockwise away to +6.5°
        peakMovementYaw = -7.0; // turns left during leftward travel
      } else if (Math.round(diff) > 0) {
        // Right book (book 2): shifts right (+27px)
        destClearDeltaX = 27;
        destClearDeltaY = 4;
        destClearDeltaZ = -20; // drops to -75px
        destClearDeltaRotateZ = 4.0; // tilts outward to +12.5°
        peakMovementYaw = +7.0; // turns right during rightward travel
      }
    } else {
      // --- RIGHT BOOK SELECTED (elevates to foreground) ---
      if (Math.round(diff) === 0) {
        // Center book (book 1): shifts left (-26px)
        destClearDeltaX = -26;
        destClearDeltaY = 8;
        destClearDeltaZ = -40; // drops to -10px
        destClearDeltaRotateZ = -6.5; // tilts counter-clockwise away to -6.5°
        peakMovementYaw = -7.5; // turns left during leftward travel
      } else if (Math.round(diff) < 0) {
        // Left book (book 0): shifts further left (-22px)
        destClearDeltaX = -22;
        destClearDeltaY = 4;
        destClearDeltaZ = -20; // drops to -35px
        destClearDeltaRotateZ = -3.5; // tilts outward to -12.0°
        peakMovementYaw = -6.0; // turns left during leftward travel
      }
    }
  } else {
    // SELECTED BOOK PEAK YAW:
    if (Math.round(targetDiff) === 0) {
      // Center book moves right from 0 to +80px (+80px displacement)
      peakMovementYaw = +11.5; // turns right during rightward travel
    } else if (Math.round(targetDiff) < 0) {
      // Left book sweeps right from -83px to +80px (+163px displacement)
      peakMovementYaw = +12.0; // turns right during rightward travel
    } else {
      // Right book moves from +83px to +80px (slight left pivot)
      peakMovementYaw = -6.0; // subtle leftward turn
    }
  }

  // End / Settled coordinates for this book in active state
  const destX = isTarget ? destReadingX : fanX + destClearDeltaX;
  const destY = isTarget ? destReadingY : fanY + destClearDeltaY;
  const destZ = isTarget ? destReadingZ : fanZ + destClearDeltaZ;
  const destRotateZ = isTarget ? destReadingRotateZ : fanRotateZ + destClearDeltaRotateZ;
  const destScale = isTarget ? destReadingScale : fanScale;

  // --- 3. DYNAMIC PROGRESS & MOVEMENT-RESPONSIVE Y-AXIS ROTATION ---
  // Clamp progress between 0 and 1
  const t = Math.max(0, Math.min(1, transitionProgress));
  const p = easeInOutCubic(t);

  // The bell curve: 0 at start (t=0), peaks around t=0.45, returns to 0 at destination (t=1.0)
  // When reversing back to collection, movement direction is reversed:
  const isReversing = animationState === "reversing";
  const yawMultiplier = isReversing ? -1 : 1;
  const yawBell = Math.sin(Math.PI * Math.pow(t, 0.92));
  const currentRotateY = peakMovementYaw * yawBell * yawMultiplier;

  // Instantaneous spatial coordinates along the motion trajectory:
  let currentX, currentY, currentZ, currentRotateZ, currentScale;

  if (animationState === "repositioning") {
    // Travel from Fan -> Active
    currentX = fanX + (destX - fanX) * p;
    currentY = fanY + (destY - fanY) * p;
    currentRotateZ = fanRotateZ + (destRotateZ - fanRotateZ) * p;
    currentScale = fanScale + (destScale - fanScale) * p;

    // Depth curve:
    if (isTarget && targetBookIndex === 0) {
      // Left book elevates early to foreground to glide cleanly in front
      const earlyLift = Math.min(1, t * 1.5);
      currentZ = fanZ + (destZ - fanZ) * easeInOutCubic(earlyLift);
    } else if (!isTarget && targetBookIndex === 0 && bookIndex === 1) {
      // Center book drops back early when Left book advances
      const earlyDrop = Math.min(1, t * 1.5);
      currentZ = fanZ + (destZ - fanZ) * easeInOutCubic(earlyDrop);
    } else {
      currentZ = fanZ + (destZ - fanZ) * p;
    }
  } else if (animationState === "reversing") {
    // Travel in reverse: Active -> Fan (t goes 1 -> 0, or we run t 0 -> 1 with reverse interpolation)
    currentX = destX + (fanX - destX) * p;
    currentY = destY + (fanY - destY) * p;
    currentZ = destZ + (fanZ - destZ) * p;
    currentRotateZ = destRotateZ + (fanRotateZ - destRotateZ) * p;
    currentScale = destScale + (fanScale - destScale) * p;
  } else {
    // 'opening', 'open', 'closingCover' (settled in active reading positions, rotateY = 0°)
    currentX = destX;
    currentY = destY;
    currentZ = destZ;
    currentRotateZ = destRotateZ;
    currentScale = destScale;
  }

  // Stacking z-index: Selected book on top, then center slot, then sides
  const zIndex = isTarget
    ? 100
    : Math.max(1, Math.round(20 - Math.abs(distanceToTarget) * 5));

  // Opacity: Side books remain visible in clearance positions
  let opacity = 1;
  if (!isTarget) {
    if (animationState === "open" || animationState === "opening") {
      opacity = 0.35;
    } else {
      opacity = 1.0;
    }
  }

  // Cover opening angle: 0° when closed/repositioning, -180° when opening/open
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
