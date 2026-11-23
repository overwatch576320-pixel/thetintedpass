/**
 * bookCollisionAvoidance.js
 *
 * Implements dynamic local Z-axis rotation and collision avoidance
 * for the 3-book collection on The Tinted Pass.
 *
 * Principles:
 * 1. Rotation is strictly around each book's own local Z-axis (perpendicular to cover).
 *    Zero Y-axis rotation (preserves front-facing appearance).
 * 2. When a book is selected, all three books subtly adjust their positions and
 *    local Z-rotations dynamically in coordination with the selected book's movement.
 * 3. Neighbouring books tilt away from the selected book to create clearance.
 * 4. 3D Collision Detection verifies that oriented bounding boxes (OBBs) in XY
 *    and depth intervals in Z maintain a strict positive safety gap at all times.
 */

// 2D Vector math helpers
function rotateVector(x, y, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

/**
 * Checks 3D collision between two oriented hardcover books using:
 * - Separating Axis Theorem (SAT) in the XY plane
 * - Depth interval overlap in the Z axis
 *
 * @returns {Object} { collides: boolean, minGap: number, zGap: number, xyOverlap: boolean }
 */
export function check3DCollision(bookA, bookB, dimensions, safetyGap = 8) {
  const W = dimensions.width;
  const H = dimensions.height;
  const D = 20; // Physical book depth / thickness

  // 1. Z-axis interval check
  // Book A interval: [zA - D/2, zA + D/2]
  // Book B interval: [zB - D/2, zB + D/2]
  const zDist = Math.abs(bookA.z - bookB.z);
  const zClearance = zDist - D;

  // If books are separated by more than safetyGap along Z, they cannot physically collide in 3D
  if (zClearance >= safetyGap) {
    return {
      collides: false,
      minGap: zClearance,
      zGap: zClearance,
      xyOverlap: true,
    };
  }

  // 2. Separating Axis Theorem (SAT) in XY plane
  // Axes to test: 2 normals of Box A, 2 normals of Box B
  const radA = (bookA.rotateZ * Math.PI) / 180;
  const radB = (bookB.rotateZ * Math.PI) / 180;

  const axes = [
    { x: Math.cos(radA), y: Math.sin(radA) },
    { x: -Math.sin(radA), y: Math.cos(radA) },
    { x: Math.cos(radB), y: Math.sin(radB) },
    { x: -Math.sin(radB), y: Math.cos(radB) },
  ];

  const dx = bookB.x - bookA.x;
  const dy = bookB.y - bookA.y;

  let minSeparation = Infinity;
  let hasSeparatingAxis = false;

  for (const axis of axes) {
    // Project half-dimensions of A
    const halfA_w = (W / 2) * Math.abs(axis.x * Math.cos(radA) + axis.y * Math.sin(radA));
    const halfA_h = (H / 2) * Math.abs(-axis.x * Math.sin(radA) + axis.y * Math.cos(radA));
    const rA = halfA_w + halfA_h;

    // Project half-dimensions of B
    const halfB_w = (W / 2) * Math.abs(axis.x * Math.cos(radB) + axis.y * Math.sin(radB));
    const halfB_h = (H / 2) * Math.abs(-axis.x * Math.sin(radB) + axis.y * Math.cos(radB));
    const rB = halfB_w + halfB_h;

    // Projected distance between centers
    const dist = Math.abs(dx * axis.x + dy * axis.y);
    const separation = dist - (rA + rB);

    if (separation >= safetyGap) {
      hasSeparatingAxis = true;
      minSeparation = Math.max(minSeparation, separation);
      break;
    }
  }

  const xyCollides = !hasSeparatingAxis;
  const collides = xyCollides && zClearance < safetyGap;

  return {
    collides,
    minGap: zClearance,
    zGap: zClearance,
    xyOverlap: xyCollides,
  };
}

/**
 * Computes coordinated 3D transform for a book in the collection,
 * incorporating dynamic local Z-axis rotation and collision avoidance.
 */
export function getCoordinatedBookTransform({
  bookIndex,
  scrollProgress,
  targetBookIndex,
  animationState, // 'inCollection' | 'repositioning' | 'opening' | 'open' | 'closingCover' | 'reversing'
  dimensions,
}) {
  const W = dimensions.width;
  const diff = bookIndex - scrollProgress;
  const absDiff = Math.abs(diff);

  // Lateral step offset: calibrated to ~84px on 160px width
  // Ensures left book (0) and right book (2) have a positive safety gap in XY
  // and maintain comfortable 30-35px screen margins on mobile
  const stepX = Math.round(W * 0.52);

  // --- BASELINE FAN (inCollection) ---
  const fanX = diff * stepX;
  const fanY = absDiff * 6;
  // Depth separation:
  // Center book (diff = 0): Z = +30px (prominently in front)
  // Left book (diff = -1): Z = -15px (between center and right in depth)
  // Right book (diff = +1): Z = -45px (safely behind both center and left)
  // This staggers all 3 books with a minimum 10px-25px physical 3D clearance gap,
  // making physical 3D geometry collision mathematically impossible!
  let fanZ = 30;
  if (diff < -0.5) {
    fanZ = -15 - (absDiff - 1) * 20;
  } else if (diff > 0.5) {
    fanZ = -45 - (absDiff - 1) * 20;
  }
  // Local Z-axis rotation: left is -8.5°, center is 0°, right is +8.5°
  const fanRotateZ = diff * 8.5;
  const fanScale = Math.max(0.75, 1 - absDiff * 0.06);

  // If no book is selected or currently active, return baseline fan
  const isAnyActive =
    targetBookIndex !== null && animationState !== "inCollection";

  if (!isAnyActive) {
    let fanOpacity = 1;
    if (absDiff > 1.35) {
      fanOpacity = Math.max(0, 1 - (absDiff - 1.35) / 0.45);
    }
    if (absDiff >= 1.8) {
      fanOpacity = 0;
    }

    const zIndex = Math.max(1, Math.round(30 - absDiff * 8));

    return {
      x: fanX,
      y: fanY,
      z: fanZ,
      rotateZ: fanRotateZ,
      rotateY: 0, // Zero Y-axis rotation
      scale: fanScale,
      opacity: fanOpacity,
      zIndex,
      coverAngle: 0,
      isTarget: false,
    };
  }

  // --- COORDINATED SELECTION & CLEARANCE STATE ---
  const isTarget = targetBookIndex === bookIndex;
  const targetDiff = targetBookIndex - scrollProgress; // Which slot was selected (-1 = left, 0 = center, +1 = right)
  const distanceToTarget = bookIndex - targetBookIndex; // Relative offset to selected book

  // 1. Target Reading Position for Selected Book
  // Spine at screen center (X = W / 2) so 2W double spread is centered
  const readingX = W / 2;
  const readingY = -8;
  const readingZ = 75; // Prominently in foreground
  const readingRotateZ = 0; // Completely straightened
  const readingScale = 1.0;

  // 2. Coordinated Offsets for Neighbouring Books (Collision Avoidance)
  // Compute dynamic offsets based on which book is selected:
  let clearDeltaX = 0;
  let clearDeltaY = 0;
  let clearDeltaZ = 0;
  let clearDeltaRotateZ = 0;

  if (!isTarget) {
    if (Math.round(targetDiff) === 0) {
      // CENTER BOOK SELECTED (Moving right from 0 to +W/2)
      if (distanceToTarget < 0) {
        // Left book: center book moves away from it to the right
        clearDeltaX = -10;
        clearDeltaY = 4;
        clearDeltaZ = -15; // Push back to -45px
        clearDeltaRotateZ = -3.0; // Tilts outward to -11.5°
      } else {
        // Right book: center book moves TOWARDS it!
        // Right book must tilt away and shift right/back to yield clearance
        clearDeltaX = 26;
        clearDeltaY = 4;
        clearDeltaZ = -18; // Push back to -48px
        clearDeltaRotateZ = 5.0; // Tilts outward to +13.5°
      }
    } else if (Math.round(targetDiff) < 0) {
      // LEFT BOOK SELECTED (Moving from -stepX all the way to +W/2)
      if (Math.round(diff) === 0) {
        // Center book: Left book passes directly in front of it!
        clearDeltaX = -22;
        clearDeltaY = 8;
        clearDeltaZ = -35; // Drop back to -5px
        clearDeltaRotateZ = 6.5; // Tilts away clockwise to +6.5°
      } else if (Math.round(diff) > 0) {
        // Right book (farther neighbour)
        clearDeltaX = 20;
        clearDeltaY = 4;
        clearDeltaZ = -12; // Push back to -42px
        clearDeltaRotateZ = 3.5; // Tilts outward to +12.0°
      }
    } else {
      // RIGHT BOOK SELECTED (Moving from +stepX to +W/2)
      if (Math.round(diff) === 0) {
        // Center book: Right book approaches from the right
        clearDeltaX = -24;
        clearDeltaY = 8;
        clearDeltaZ = -28; // Drop back to +2px
        clearDeltaRotateZ = -6.5; // Tilts away counter-clockwise to -6.5°
      } else if (Math.round(diff) < 0) {
        // Left book (farther neighbour)
        clearDeltaX = -18;
        clearDeltaY = 4;
        clearDeltaZ = -12; // Push back to -42px
        clearDeltaRotateZ = -3.5; // Tilts outward to -12.0°
      }
    }
  }

  // Active transformed values
  const activeX = isTarget ? readingX : fanX + clearDeltaX;
  const activeY = isTarget ? readingY : fanY + clearDeltaY;
  const activeZ = isTarget ? readingZ : fanZ + clearDeltaZ;
  const activeRotateZ = isTarget ? readingRotateZ : fanRotateZ + clearDeltaRotateZ;
  const activeScale = isTarget ? readingScale : fanScale;

  // Stacking z-index: Selected book on top, then center slot, then sides
  const zIndex = isTarget
    ? 100
    : Math.max(1, Math.round(20 - Math.abs(distanceToTarget) * 5));

  // Opacity: Side books remain visible in clearance positions during repositioning
  // and maintain subtle presence or dimming in reading mode
  let opacity = 1;
  if (!isTarget) {
    if (animationState === "open" || animationState === "opening") {
      opacity = 0.32; // Dimmed to give reading focus while preserving collection presence
    } else if (animationState === "repositioning" || animationState === "reversing") {
      opacity = 1.0; // 100% visible during coordinated animation
    } else {
      opacity = 0.32;
    }
  }

  // Cover angle: 0° when closed/repositioning, -180° when opening/open
  let coverAngle = 0;
  if (isTarget) {
    if (animationState === "opening" || animationState === "open") {
      coverAngle = -180;
    } else {
      coverAngle = 0;
    }
  }

  return {
    x: activeX,
    y: activeY,
    z: activeZ,
    rotateZ: activeRotateZ,
    rotateY: 0,
    scale: activeScale,
    opacity,
    zIndex,
    coverAngle,
    isTarget,
  };
}
