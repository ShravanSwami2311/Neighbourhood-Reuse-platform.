import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const canvas = document.getElementById("hero-scene");
const hero = document.querySelector(".hero-home");

if (canvas && hero) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x718b73, 2.2));
    const keyLight = new THREE.DirectionalLight(0xfff3dc, 3.2);
    keyLight.position.set(-3, 5, 7);
    scene.add(keyLight);

    const stillLife = new THREE.Group();
    scene.add(stillLife);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.045, 16, 120),
      new THREE.MeshStandardMaterial({ color: 0x547c61, roughness: 0.44, metalness: 0.12 })
    );
    ring.rotation.set(0.42, -0.48, -0.22);
    stillLife.add(ring);

    const crate = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 1.45, 1.25),
      new THREE.MeshStandardMaterial({ color: 0xd6ae7d, roughness: 0.82 })
    );
    crate.position.set(0, -0.42, 0);
    stillLife.add(crate);

    const slatMaterial = new THREE.MeshStandardMaterial({ color: 0xf1d5ac, roughness: 0.78 });
    [-0.76, -0.26, 0.26, 0.76].forEach(x => {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.36, 0.07), slatMaterial);
      slat.position.set(x, -0.42, 0.66);
      stillLife.add(slat);
    });

    const bookColors = [0xd47f63, 0xe6c76c, 0x739a83];
    bookColors.forEach((color, index) => {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(1.28 - index * 0.12, 0.22, 0.88),
        new THREE.MeshStandardMaterial({ color, roughness: 0.74 })
      );
      book.position.set(-0.24 + index * 0.07, 0.45 + index * 0.23, 0.08);
      book.rotation.z = index % 2 ? -0.08 : 0.04;
      stillLife.add(book);
    });

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 1.25, 10),
      new THREE.MeshStandardMaterial({ color: 0x52785d, roughness: 0.8 })
    );
    stem.position.set(0.92, 1.06, 0.12);
    stillLife.add(stem);

    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x739878, roughness: 0.67 });
    [[0.68, 1.46, -0.55], [1.13, 1.64, 0.56], [0.73, 1.95, 0.55]].forEach(([x, y, rotation]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 18), leafMaterial);
      leaf.scale.set(0.72, 1.5, 0.38);
      leaf.position.set(x, y, 0.12);
      leaf.rotation.z = rotation;
      stillLife.add(leaf);
    });

    const accents = new THREE.Group();
    scene.add(accents);
    [
      [0.36, 1.55, 0.34, 0xe8c56b],
      [3.25, 0.95, 0.23, 0xd78668],
      [3.42, -1.38, 0.18, 0x8ca58a],
      [0.08, -1.66, 0.14, 0xe5a583]
    ].forEach(([x, y, radius, color]) => {
      const bead = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 24, 18),
        new THREE.MeshStandardMaterial({ color, roughness: 0.48 })
      );
      bead.position.set(x, y, 0.4);
      accents.add(bead);
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let stillLifeBaseY = 0;

    function resizeScene() {
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.x = width < 700 ? 0.15 : 0;
      camera.updateProjectionMatrix();
      stillLife.position.x = width < 560 ? 1.8 : width < 700 ? 0.85 : 2.8;
      stillLifeBaseY = width < 560 ? -1.1 : 0;
      stillLife.scale.setScalar(width < 560 ? 0.42 : width < 700 ? 0.74 : 1);
      accents.position.x = width < 700 ? 1.1 : 1.5;
      accents.scale.setScalar(width < 560 ? 0.72 : 1);
    }

    const observer = new ResizeObserver(resizeScene);
    observer.observe(hero);
    resizeScene();

    if (!reducedMotion) {
      hero.addEventListener("pointermove", event => {
        const bounds = hero.getBoundingClientRect();
        targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.3;
        targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.2;
      });
      hero.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
      });
    }

    const clock = new THREE.Clock();
    function render() {
      const elapsed = clock.getElapsedTime();
      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;
      if (!reducedMotion) {
        stillLife.position.y = stillLifeBaseY + Math.sin(elapsed * 0.7) * 0.1;
        stillLife.rotation.y = Math.sin(elapsed * 0.35) * 0.09 + pointerX;
        stillLife.rotation.x = pointerY;
        ring.rotation.z += 0.0018;
        accents.rotation.z = Math.sin(elapsed * 0.35) * 0.035;
      }
      renderer.render(scene, camera);
      if (!reducedMotion) requestAnimationFrame(render);
    }
    render();
  } catch {
    canvas.hidden = true;
  }
}