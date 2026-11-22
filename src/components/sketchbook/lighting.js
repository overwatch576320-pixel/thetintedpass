// One broad key light above and to the viewer's left, in page-width units.
// Three.js uses y-up; the DOM projection below uses screen y-down.
export const BOOK_LIGHT = Object.freeze({ x: -0.45, y: 0.65, z: 1 });

export function projectShadow(point) {
  return {
    x: point.x - (point.z * BOOK_LIGHT.x) / BOOK_LIGHT.z,
    y: point.y + (point.z * BOOK_LIGHT.y) / BOOK_LIGHT.z,
  };
}
