import React, { useMemo } from "react";

/**
 * Subdivided 3D Flexible Paper Sheet
 * Implements authentic developable conical/cylindrical paper curl mathematics.
 *
 * Life cycle of a turn:
 * 1. Outer edge lifts first.
 * 2. Sheet curves into an authentic physical cylindrical/conical arc.
 * 3. High natural arch bridges forward (+Z) across the central spine.
 * 4. Front face turns away while reverse face becomes visible.
 * 5. Curvature relaxes as it approaches opposite stack.
 * 6. Lands flat and seamless on the opposite stack.
 */
export default function CurvedPaperSheet({
  progress = 0, // 0.0 (flat right or start of turn) -> 1.0 (flat left or end of turn)
  direction = 1, // 1 = forward (turning right to left), -1 = backward (turning left to right)
  grabY = 0, // -1 (bottom corner) to +1 (top corner) for natural corner-lift tilt
  frontPage = null,
  backPage = null,
  width = 160,
  height = 226,
  paperColor = "#fbfaf6",
  baseZ = 9.5,
}) {
  const NUM_STRIPS = 18;
  const W = width;
  const H = height;
  const clampedP = Math.max(0, Math.min(1, progress));

  // Compute 3D coordinates and rotations for all strips across the width
  const strips = useMemo(() => {
    if (clampedP <= 0.001 || clampedP >= 0.999) return [];

    // Map progress to physical spatial configuration (0 = flat right, 1 = flat left)
    const effectiveP = direction === 1 ? clampedP : 1 - clampedP;
    const result = [];
    const deltaW = W / NUM_STRIPS;

    // Corner grab tilt: lifts the grabbed corner slightly earlier
    const bellP = Math.sin(Math.PI * effectiveP);
    const cornerTilt = grabY * 0.075 * bellP;

    // Conical curl equations matching physical paper behavior:
    const angle = Math.PI * effectiveP;
    const curl = 0.58 * Math.sin(Math.PI * effectiveP);
    const k = -2 * curl;
    const a = angle + curl;

    const calcPoint = (u) => {
      let x, z;
      if (Math.abs(k) < 1e-4) {
        x = u * Math.cos(angle);
        z = u * Math.sin(angle);
      } else {
        x = (Math.sin(a + k * u) - Math.sin(a)) / k;
        z = (Math.cos(a) - Math.cos(a + k * u)) / k;
      }
      return { x: x * W, z: z * W };
    };

    for (let i = 0; i < NUM_STRIPS; i++) {
      const u0 = i / NUM_STRIPS;
      const u1 = (i + 1) / NUM_STRIPS;
      const uMid = (i + 0.5) / NUM_STRIPS;

      const p0 = calcPoint(u0);
      const p1 = calcPoint(u1);

      const dx = p1.x - p0.x;
      const dz = p1.z - p0.z;
      const chordLen = Math.hypot(dx, dz);
      // Tangent angle in degrees
      const rotY = Math.atan2(dz, dx) * (180 / Math.PI);

      // Local surface normal orientation for realistic lighting
      const normalAngle = a + k * uMid;
      const frontLight = Math.max(0.74, 0.88 + 0.12 * Math.cos(normalAngle));
      const backLight = Math.max(0.74, 0.88 - 0.12 * Math.cos(normalAngle));

      // Specular sheen along the cylindrical crest of the arch
      const crestProximity = Math.max(0, 1 - Math.abs(rotY - 90) / 45);
      const sheenIntensity = 0.24 * Math.sin(Math.PI * effectiveP) * crestProximity;

      // Coordinates in book space
      const finalX = p0.x;
      const finalZ = p0.z + baseZ;
      const finalRotY = -rotY;

      // Vertical tilt for corner lift
      const stripTiltY = (i / NUM_STRIPS) * cornerTilt * 12;

      result.push({
        idx: i,
        u: u0,
        x: finalX,
        y: stripTiltY,
        z: finalZ,
        width: Math.max(deltaW, chordLen) + 0.45, // slight overlap to prevent subpixel seams
        rotY: finalRotY,
        frontLight,
        backLight,
        sheenIntensity,
        leftOffsetFront: i * deltaW,
        leftOffsetBack: (NUM_STRIPS - i) * deltaW,
      });
    }

    return result;
  }, [clampedP, direction, grabY, W, baseZ]);

  if (clampedP <= 0.001 || clampedP >= 0.999 || strips.length === 0) {
    return null;
  }

  // Under-sheet dynamic ambient cast shadow onto underlying page stack
  const effectiveP = direction === 1 ? clampedP : 1 - clampedP;
  const shadowOpacity = 0.38 * Math.sin(Math.PI * effectiveP);
  // Center of shadow moves smoothly across the gutter with the crest
  const crestX = (0.5 - effectiveP) * W * 0.85;

  return (
    <div
      className="curved-paper-host"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: `${W}px`,
        height: `${H}px`,
        pointerEvents: "none",
        transformStyle: "preserve-3d",
        zIndex: 50,
      }}
      aria-hidden="true"
    >
      {/* 1. Dynamic Contact Shadow on the Page Below */}
      {shadowOpacity > 0.02 && (
        <div
          className="curved-paper-cast-shadow"
          style={{
            position: "absolute",
            left: `${crestX - W * 0.5}px`,
            top: "6px",
            width: `${W}px`,
            height: `${H - 12}px`,
            transform: `translateZ(${baseZ - 1}px)`,
            background: `radial-gradient(ellipse at center, rgba(10, 18, 26, ${shadowOpacity.toFixed(2)}) 0%, rgba(10, 18, 26, ${(shadowOpacity * 0.35).toFixed(2)}) 55%, transparent 75%)`,
            filter: "blur(8px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* 2. Subdivided 3D Geometry Strips */}
      {strips.map((strip) => (
        <div
          key={strip.idx}
          className="curved-paper-strip"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: `${strip.width.toFixed(2)}px`,
            height: `${H}px`,
            transformOrigin: "0% 50% 0px",
            transform: `translate3d(${strip.x.toFixed(2)}px, ${strip.y.toFixed(2)}px, ${strip.z.toFixed(2)}px) rotateY(${strip.rotY.toFixed(2)}deg)`,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          {/* Front Face: Slice of Turning Front Page */}
          <div
            className="curved-strip-face front-strip"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: paperColor,
              overflow: "hidden",
              backfaceVisibility: "hidden",
              filter: `brightness(${strip.frontLight.toFixed(3)})`,
              boxShadow: strip.u < 0.1 ? "inset 2px 0 4px rgba(0,0,0,0.15)" : "none",
            }}
          >
            <div
              className="curved-strip-slice-content"
              style={{
                position: "absolute",
                left: `${-strip.leftOffsetFront.toFixed(2)}px`,
                top: 0,
                width: `${W}px`,
                height: `${H}px`,
                backgroundColor: paperColor,
              }}
            >
              {frontPage?.image ? (
                <img
                  src={frontPage.image}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="persistent-folio-blank">
                  <span className="persistent-folio-num right-num">
                    {String(frontPage?.pageNumber || frontPage?.num || 2).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>

            {/* Specular sheen along the crest */}
            {strip.sheenIntensity > 0.02 && (
              <div
                className="curved-strip-sheen"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(to right, transparent, rgba(255,255,255,${strip.sheenIntensity.toFixed(2)}), transparent)`,
                  pointerEvents: "none",
                }}
              />
            )}
          </div>

          {/* Back Face: Slice of Turning Reverse Page */}
          <div
            className="curved-strip-face back-strip"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: paperColor,
              overflow: "hidden",
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              filter: `brightness(${strip.backLight.toFixed(3)})`,
              boxShadow: (1 - strip.u) < 0.1 ? "inset -2px 0 4px rgba(0,0,0,0.15)" : "none",
            }}
          >
            <div
              className="curved-strip-slice-content"
              style={{
                position: "absolute",
                left: `${-strip.leftOffsetBack.toFixed(2)}px`,
                top: 0,
                width: `${W}px`,
                height: `${H}px`,
                backgroundColor: paperColor,
              }}
            >
              {backPage?.image ? (
                <img
                  src={backPage.image}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="persistent-folio-blank">
                  <span className="persistent-folio-num left-num">
                    {String(backPage?.pageNumber || backPage?.num || 3).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
