/**
 * Responsive Dimensions Engine for The Tinted Pass 3D Physical Sketchbook
 * Establishes the physical dimensions of the complete open book first,
 * then derives the closed book dimensions using the exact same scale factor.
 *
 * Base Reference (ISO A4 standard aspect ratio: 1 : 1.4142857):
 * - Page Width: 280px
 * - Page Height: 396px (280 * sqrt(2))
 * - Open Spread Width: 560px (2 * 280px)
 * - Open Spread Height: 396px
 */

export const BASE_PAGE_WIDTH = 280;
export const ISO_A4_ASPECT = 297 / 210; // 1.4142857...
export const BASE_PAGE_HEIGHT = Math.round(BASE_PAGE_WIDTH * ISO_A4_ASPECT); // 396px
export const BASE_OPEN_WIDTH = BASE_PAGE_WIDTH * 2; // 560px
export const BASE_OPEN_HEIGHT = BASE_PAGE_HEIGHT; // 396px

/**
 * Calculates uniform scale factor S and book dimensions from available viewport/stage space.
 * Scales uniformly using BOTH available width and available height so that the entire
 * two-page spread fits comfortably within the homepage layout without cropping or distortion.
 *
 * @param {number} containerWidth - Measured stage or window width (px)
 * @param {number} containerHeight - Measured stage or available height (px)
 * @returns {object} Calculated scale and dimensions
 */
export function calculateBookDimensions(containerWidth, containerHeight) {
  const isMobile = containerWidth < 768;
  const paddingX = isMobile ? 24 : 64;
  const paddingY = isMobile ? 18 : 36;

  const availWidth = Math.max(260, containerWidth - paddingX);
  const availHeight = Math.max(200, containerHeight - paddingY);

  // Proportional scale factor using BOTH available width and available height
  const scaleByWidth = availWidth / BASE_OPEN_WIDTH;
  const scaleByHeight = availHeight / BASE_OPEN_HEIGHT;

  // Maximum scale is 1.0 (unscaled desktop); downscales uniformly on smaller viewports
  const scale = Math.min(1.0, scaleByWidth, scaleByHeight);

  // Both open book and closed book use the EXACT same scale factor
  const pageWidth = Math.round(BASE_PAGE_WIDTH * scale);
  const pageHeight = Math.round(BASE_PAGE_HEIGHT * scale);
  const closedWidth = pageWidth;
  const closedHeight = pageHeight;
  const openSpreadWidth = pageWidth * 2;
  const openSpreadHeight = pageHeight;

  return {
    scale,
    pageWidth,
    pageHeight,
    closedWidth,
    closedHeight,
    openSpreadWidth,
    openSpreadHeight,
    aspectRatio: ISO_A4_ASPECT,
    isMobile,
  };
}
