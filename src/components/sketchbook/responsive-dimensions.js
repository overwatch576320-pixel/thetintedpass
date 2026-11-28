/**
 * Responsive Dimensions Engine for The Tinted Pass 3D Physical Sketchbook
 *
 * Sizing Architecture:
 * 1. Reference Card & Closed Physical Book Dimensions:
 *    - The carousel cards and closed hardcover books are EXACTLY the same width, height, and aspect ratio.
 *    - Desktop: 280px x 396px (ISO A4 1:1.414)
 *    - Laptop: 250px x 354px
 *    - Tablet: 210px x 297px
 *    - Mobile: 175px x 248px
 *    - The book NEVER shrinks when selected or transitioning to closed state.
 *
 * 2. Open Two-Page Spread Dimensions (Separate Sizing Requirement):
 *    - Mobile: Occupies ~94-96% of available mobile screen width with small side margins (~10px).
 *    - Both pages preserve authentic ISO A4 proportions (1:1.414).
 *    - Desktop: 560px x 396px (2 x 280px).
 */

export const ISO_A4_ASPECT = 297 / 210; // 1.4142857...

export function getResponsiveBookDimensions(windowWidth = typeof window !== "undefined" ? window.innerWidth : 1280) {
  const isMobile = windowWidth <= 480;
  const isTablet = windowWidth > 480 && windowWidth <= 768;
  const isLaptop = windowWidth > 768 && windowWidth <= 1200;

  // 1. CAROUSEL CARD & CLOSED BOOK DIMENSIONS (Exact 1:1 match)
  let cardWidth = 280;
  if (isMobile) {
    // Mobile: 175px reference card width
    cardWidth = Math.min(180, Math.max(165, Math.round(windowWidth * 0.45)));
  } else if (isTablet) {
    cardWidth = 210;
  } else if (isLaptop) {
    cardWidth = 250;
  } else {
    cardWidth = 280;
  }

  const cardHeight = Math.round(cardWidth * ISO_A4_ASPECT);

  // The closed physical book has EXACTLY the same width and height as the card
  const closedWidth = cardWidth;
  const closedHeight = cardHeight;

  // 2. OPEN TWO-PAGE SPREAD DIMENSIONS (Separate sizing requirement)
  // On mobile: occupies approximately 94–96% of available mobile screen width (~10px side margins)
  let openSpreadWidth;
  let openPageWidth;
  let openSpreadHeight;

  if (isMobile) {
    // Target 95% of screen width (e.g. 370px on 390px screen)
    const targetWidth = Math.round(windowWidth * 0.95);
    openPageWidth = Math.floor(targetWidth / 2);
    openSpreadWidth = openPageWidth * 2;
    openSpreadHeight = Math.round(openPageWidth * ISO_A4_ASPECT);
  } else if (isTablet) {
    openPageWidth = cardWidth;
    openSpreadWidth = cardWidth * 2;
    openSpreadHeight = cardHeight;
  } else {
    // Desktop: spread width = 2 * cardWidth
    openPageWidth = cardWidth;
    openSpreadWidth = cardWidth * 2;
    openSpreadHeight = cardHeight;
  }

  // Scale multiplier between closed book base and open spread
  const spreadScale = openSpreadWidth / (closedWidth * 2);

  return {
    cardWidth,
    cardHeight,
    closedWidth,
    closedHeight,
    pageWidth: cardWidth,
    pageHeight: cardHeight,
    openPageWidth,
    openSpreadWidth,
    openSpreadHeight,
    spreadScale,
    aspectRatio: ISO_A4_ASPECT,
    isMobile,
  };
}

export const calculateBookDimensions = (width, height) => getResponsiveBookDimensions(width);

