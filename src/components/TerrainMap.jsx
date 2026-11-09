import { useEffect, useRef } from "react";
import * as THREE from "three";
import { landmarks } from "../data/siteData";

// Stylised procedural terrain, not a navigational or survey map.
// Coordinates are illustrative and should be checked before public launch.
const coords = {
  "Leh": [-2.8, 0.05, 1.3],
  "Sham": [-4.0, 0.08, 0.25],
  "Alchi": [-4.8, 0.08, -0.15],
  "Nubra Valley": [-1.2, 0.08, -2.25],
  "Pangong Tso": [2.25, 0.08, -1.0],
  "Nyoma": [3.8, 0.08, 1.35],
  "Chumathang": [1.5, 0.08, 2.0]
};

export default function TerrainMap({ route, selected, onSelect }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const clickRef = useRef(onSelect);
  const selectedRef = useRef(selected);
  const routeRef = useRef(route);
  useEffect(() => { clickRef.current = onSelect; }, [onSelect]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { routeRef.current = route; }, [route]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d9d5c9");
    scene.fog = new THREE.Fog("#d9d5c9", 9, 18);
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 7.5, 8.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#ffffff", 1.45));
    const sun = new THREE.DirectionalLight("#fff5df", 2.1);
    sun.position.set(-4, 8, 5);
    sun.castShadow = true;
    scene.add(sun);

    const geometry = new THREE.PlaneGeometry(11, 7.5, 100, 80);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const ridge = Math.sin(x * 1.15 + Math.cos(y * 1.5)) * 0.36;
      const peaks = Math.pow(Math.max(0, Math.sin(x * 2.4 + y * 1.6)), 2) * 0.9;
      const folds = Math.cos(y * 2.3 - x * 0.6) * 0.25;
      const basin = Math.sin(x * 0.5) * Math.cos(y * 0.7) * 0.2;
      pos.setZ(i, ridge + peaks + folds + basin);
    }
    geometry.computeVertexNormals();
    const terrain = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: "#a9a18e", roughness: 1, metalness: 0, flatShading: true
    }));
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    scene.add(terrain);

    // Subtle contour lines.
    const contourMat = new THREE.LineBasicMaterial({ color: "#e8e1d2", transparent: true, opacity: 0.45 });
    for (let i = 0; i < 9; i++) {
      const points = [];
      for (let j = 0; j <= 80; j++) {
        const x = -5.2 + j * 0.13;
        const z = -3.2 + i * 0.8 + Math.sin(x * 1.4 + i) * 0.18;
        points.push(new THREE.Vector3(x, 0.05 + Math.sin(x * 1.15 + i) * 0.025, z));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), contourMat);
      scene.add(line);
    }

    const markers = [];
    Object.entries(coords).forEach(([name, p]) => {
      const group = new THREE.Group();
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 18, 18),
        new THREE.MeshStandardMaterial({ color: "#a34d34", emissive: "#4b1e12", emissiveIntensity: 0.15 })
      );
      dot.position.set(p[0], 0.24, p[2]);
      dot.userData.landmark = name;
      group.add(dot);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8), new THREE.MeshBasicMaterial({ color: "#6b382a" }));
      stem.position.set(p[0], 0.12, p[2]);
      group.add(stem);
      scene.add(group);
      markers.push(dot);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    function handleClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(markers);
      if (hits.length) clickRef.current(hits[0].object.userData.landmark);
    }
    renderer.domElement.addEventListener("click", handleClick);

    let routeLine;
    function drawRoute(names) {
      if (routeLine) scene.remove(routeLine);
      const pts = names.map(n => coords[n]).filter(Boolean).map(p => new THREE.Vector3(p[0], 0.3, p[2]));
      if (pts.length < 2) return;
      const curve = new THREE.CatmullRomCurve3(pts);
      routeLine = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 120, 0.035, 8, false),
        new THREE.MeshStandardMaterial({ color: "#9b432f", emissive: "#4a1e15", emissiveIntensity: 0.18 })
      );
      scene.add(routeLine);
    }
    drawRoute(routeRef.current);

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!mount.clientWidth) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    sceneRef.current = { drawRoute };
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("click", handleClick);
      geometry.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => { sceneRef.current?.drawRoute(route); }, [route]);

  return <div className="terrain-wrap">
    <div className="map-stamp">LADAKH · FIELD MAP</div>
    <div className="map-instruction">Drag not required · Select a marked place</div>
    <div className="terrain-canvas" ref={mountRef} />
    <div className="map-place-list">
      {route.map((name, i) => <button key={`${name}-${i}`} className={selected === name ? "map-place active" : "map-place"} onClick={() => onSelect(name)}>
        <span>{String(i + 1).padStart(2, "0")}</span>{name}
      </button>)}
    </div>
    <div className="map-disclaimer">Illustrative terrain and route only — not for navigation. Final routes depend on local conditions and permits.</div>
  </div>;
}
