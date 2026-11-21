import { useState, useEffect } from "react";
import { Sliders, Smartphone, Monitor, Tablet, Copy, Check, RotateCcw, X } from "lucide-react";

const VAR_MAP = {
  heroBgPos: { cssVar: "hero-bg-pos", unit: "%", default: 73 },
  heroTitleSize: { cssVar: "hero-title-size", unit: "px", default: 35 },
  heroTitleLh: { cssVar: "hero-title-lh", unit: "", default: 1.05 },
  heroDescSize: { cssVar: "hero-desc-size", unit: "px", default: 16 },
  heroEaselSize: { cssVar: "hero-easel-size", unit: "px", default: 108 },
  heroEaselTop: { cssVar: "hero-easel-top", unit: "px", default: 355 },
  heroActionsTop: { cssVar: "hero-actions-top", unit: "px", default: 525 },
  manifestoLeft: { cssVar: "manifesto-left", unit: "%", default: 35 },
  manifestoFontSize: { cssVar: "manifesto-font-size", unit: "px", default: 10.5 },
  logoSize: { cssVar: "logo-size", unit: "px", default: 44 },
};

const getInitialValues = () => {
  const vals = {};
  for (const [key, conf] of Object.entries(VAR_MAP)) {
    vals[key] = conf.default;
  }
  return vals;
};

export default function VisualEditor() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [viewport, setViewport] = useState("auto");
  const [values, setValues] = useState(getInitialValues);

  const applyCssVar = (key, val) => {
    const conf = VAR_MAP[key];
    if (conf) {
      document.documentElement.style.setProperty(`--${conf.cssVar}`, `${val}${conf.unit}`);
    }
  };

  const update = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    applyCssVar(key, val);
  };

  useEffect(() => {
    // Apply all CSS variables on mount
    for (const [key, conf] of Object.entries(VAR_MAP)) {
      document.documentElement.style.setProperty(`--${conf.cssVar}`, `${conf.default}${conf.unit}`);
    }
  }, []);

  const reset = () => {
    const initial = getInitialValues();
    setValues(initial);
    for (const [key, conf] of Object.entries(VAR_MAP)) {
      document.documentElement.style.setProperty(`--${conf.cssVar}`, `${conf.default}${conf.unit}`);
    }
  };

  const copyConfig = () => {
    const text = `Updated Visual Values:
- Hero Background Position: ${values.heroBgPos}%
- Hero Title Size: ${values.heroTitleSize}px (line-height: ${values.heroTitleLh})
- Hero Script Size: ${values.heroDescSize}px
- Easel Illustration Size: ${values.heroEaselSize}px (Top: ${values.heroEaselTop}px)
- CTA Buttons Top: ${values.heroActionsTop}px
- Manifesto Left Offset: ${values.manifestoLeft}%
- Manifesto Font Size: ${values.manifestoFontSize}px
- Logo Size: ${values.logoSize}px`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const setFrameWidth = (w) => {
    setViewport(w);
    const root = document.getElementById("root");
    if (!root) return;
    if (w === "auto") {
      root.style.width = "100%";
      root.style.margin = "0";
      root.style.boxShadow = "none";
      document.body.classList.remove("is-mobile-preview");
    } else {
      root.style.width = w;
      root.style.margin = "0 auto";
      root.style.boxShadow = "0 0 50px rgba(0,0,0,0.35)";
      if (w === "390px") {
        document.body.classList.add("is-mobile-preview");
      } else {
        document.body.classList.remove("is-mobile-preview");
      }
    }
  };

  return (
    <aside className="ve-wrapper" aria-label="Visual design toolbar">
      {!open && (
        <button className="ve-open-btn" onClick={() => setOpen(true)} title="Open Visual Design Bar">
          <Sliders size={18} />
          <span>Visual Controls</span>
        </button>
      )}

      {open && (
        <div className="ve-panel">
          <div className="ve-header">
            <div className="ve-title">
              <Sliders size={17} color="#9b4d36" />
              <strong>Visual Editor</strong>
              <small>Changes apply in real time</small>
            </div>
            <div className="ve-header-actions">
              <button className="ve-btn-icon" onClick={reset} title="Reset to defaults">
                <RotateCcw size={14} />
              </button>
              <button className="ve-btn-icon" onClick={() => setOpen(false)} title="Minimize toolbar">
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="ve-viewports">
            <span>Frame:</span>
            <button className={viewport === "auto" ? "ve-vbtn active" : "ve-vbtn"} onClick={() => setFrameWidth("auto")}>
              <Monitor size={12} /> Full
            </button>
            <button className={viewport === "390px" ? "ve-vbtn active" : "ve-vbtn"} onClick={() => setFrameWidth("390px")}>
              <Smartphone size={12} /> Phone (390px)
            </button>
            <button className={viewport === "768px" ? "ve-vbtn active" : "ve-vbtn"} onClick={() => setFrameWidth("768px")}>
              <Tablet size={12} /> Tablet
            </button>
          </div>

          <div className="ve-tabs">
            <button className={activeTab === "hero" ? "ve-tab active" : "ve-tab"} onClick={() => setActiveTab("hero")}>
              Hero
            </button>
            <button className={activeTab === "manifesto" ? "ve-tab active" : "ve-tab"} onClick={() => setActiveTab("manifesto")}>
              Manifesto
            </button>
            <button className={activeTab === "header" ? "ve-tab active" : "ve-tab"} onClick={() => setActiveTab("header")}>
              Logo
            </button>
          </div>

          <div className="ve-body">
            {activeTab === "hero" && (
              <>
                <div className="ve-control">
                  <div className="ve-label">
                    <span>Human Traveler Position (Left ↔ Right)</span>
                    <strong>{values.heroBgPos}%</strong>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="95"
                    step="1"
                    value={values.heroBgPos}
                    onChange={(e) => update("heroBgPos", Number(e.target.value))}
                  />
                </div>

                <div className="ve-control">
                  <div className="ve-label">
                    <span>Headline Size</span>
                    <strong>{values.heroTitleSize}px</strong>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="68"
                    step="1"
                    value={values.heroTitleSize}
                    onChange={(e) => update("heroTitleSize", Number(e.target.value))}
                  />
                </div>

                <div className="ve-control">
                  <div className="ve-label">
                    <span>Headline Line-Height</span>
                    <strong>{values.heroTitleLh}</strong>
                  </div>
                  <input
                    type="range"
                    min="0.9"
                    max="1.3"
                    step="0.02"
                    value={values.heroTitleLh}
                    onChange={(e) => update("heroTitleLh", Number(e.target.value))}
                  />
                </div>

                <div className="ve-control">
                  <div className="ve-label">
                    <span>Script Text Size</span>
                    <strong>{values.heroDescSize}px</strong>
                  </div>
                  <input
                    type="range"
                    min="13"
                    max="28"
                    step="1"
                    value={values.heroDescSize}
                    onChange={(e) => update("heroDescSize", Number(e.target.value))}
                  />
                </div>

                <div className="ve-control">
                  <div className="ve-label">
                    <span>Easel Illustration Width</span>
                    <strong>{values.heroEaselSize}px</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="2"
                    value={values.heroEaselSize}
                    onChange={(e) => update("heroEaselSize", Number(e.target.value))}
                  />
                </div>

                <div className="ve-control">
                  <div className="ve-label">
                    <span>Easel Vertical Position (Top)</span>
                    <strong>{values.heroEaselTop}px</strong>
                  </div>
                  <input
                    type="range"
                    min="260"
                    max="500"
                    step="5"
                    value={values.heroEaselTop}
                    onChange={(e) => update("heroEaselTop", Number(e.target.value))}
                  />
                </div>

                <div className="ve-control">
                  <div className="ve-label">
                    <span>CTA Buttons Vertical Position</span>
                    <strong>{values.heroActionsTop}px</strong>
                  </div>
                  <input
                    type="range"
                    min="420"
                    max="680"
                    step="5"
                    value={values.heroActionsTop}
                    onChange={(e) => update("heroActionsTop", Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {activeTab === "manifesto" && (
              <>
                <div className="ve-control">
                  <div className="ve-label">
                    <span>Text Column Left Offset</span>
                    <strong>{values.manifestoLeft}%</strong>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="1"
                    value={values.manifestoLeft}
                    onChange={(e) => update("manifestoLeft", Number(e.target.value))}
                  />
                </div>

                <div className="ve-control">
                  <div className="ve-label">
                    <span>Body Text Size</span>
                    <strong>{values.manifestoFontSize}px</strong>
                  </div>
                  <input
                    type="range"
                    min="9"
                    max="18"
                    step="0.5"
                    value={values.manifestoFontSize}
                    onChange={(e) => update("manifestoFontSize", Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {activeTab === "header" && (
              <>
                <div className="ve-control">
                  <div className="ve-label">
                    <span>Header Logo / Monogram Size</span>
                    <strong>{values.logoSize}px</strong>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="72"
                    step="2"
                    value={values.logoSize}
                    onChange={(e) => update("logoSize", Number(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>

          <div className="ve-footer">
            <button className="ve-copy-btn" onClick={copyConfig}>
              {copied ? <Check size={14} color="#2e7d32" /> : <Copy size={14} />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Values to Chat"}</span>
            </button>
            <p className="ve-hint">When you like the look, click Copy and paste it in chat to make it permanent!</p>
          </div>
        </div>
      )}
    </aside>
  );
}
