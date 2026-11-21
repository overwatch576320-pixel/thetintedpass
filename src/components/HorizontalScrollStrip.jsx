import { useScrollEdgeFade } from "../hooks/useScrollEdgeFade";

/**
 * HorizontalScrollStrip
 * Reusable container component for horizontally scrollable tabs, filters, and chips.
 * Incorporates dynamic gradient edge-fade with zero background assumptions.
 */
export default function HorizontalScrollStrip({
  children,
  className = "",
  activeSelector = ".active",
  activeKey = null,
  fadeWidth = 28,
  autoCenterActive = true,
  role = "tablist",
  "aria-label": ariaLabel,
  style = {},
  ...props
}) {
  const { containerRef } = useScrollEdgeFade({
    activeSelector,
    activeKey,
    fadeWidth,
    autoCenterActive,
  });

  return (
    <div
      ref={containerRef}
      className={`scroll-edge-fade ${className}`}
      role={role}
      aria-label={ariaLabel}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
