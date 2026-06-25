/* ============================================================
   TASK 2 — THREE.JS 3D SCENE
   Interactive WebGL scene with orbiting geometry
   ============================================================ */

'use strict';

(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Scene Setup ──
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x08050f, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ── Lighting ──
  const ambientLight = new THREE.AmbientLight(0xa855f7, 0.4);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0xa855f7, 2, 20);
  pointLight1.position.set(4, 4, 4);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xe879f9, 1.5, 20);
  pointLight2.position.set(-4, 2, -3);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xc4b5fd, 1, 15);
  pointLight3.position.set(0, -3, 5);
  scene.add(pointLight3);

  // ── Central Torus Knot ──
  const torusKnotGeo = new THREE.TorusKnotGeometry(1, 0.35, 128, 32);
  const torusKnotMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    emissive: 0x6d28d9,
    emissiveIntensity: 0.3,
    metalness: 0.9,
    roughness: 0.15,
    wireframe: false,
  });
  const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
  scene.add(torusKnot);

  // ── Wireframe Overlay ──
  const wireframeGeo = new THREE.TorusKnotGeometry(1.02, 0.36, 64, 16);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0xe879f9,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const wireframeOverlay = new THREE.Mesh(wireframeGeo, wireframeMat);
  scene.add(wireframeOverlay);

  // ── Orbiting Spheres ──
  const orbiters = [];
  const orbiterColors = [0xa855f7, 0xe879f9, 0xc4b5fd, 0x6d28d9, 0xa855f7, 0xe879f9];

  for (let i = 0; i < 6; i++) {
    const geo = new THREE.SphereGeometry(0.12, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: orbiterColors[i],
      emissive: orbiterColors[i],
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const angle = (i / 6) * Math.PI * 2;
    const radius = 2.2 + Math.random() * 0.5;
    const speed = 0.3 + Math.random() * 0.3;
    const yOffset = (Math.random() - 0.5) * 2;

    orbiters.push({ mesh, angle, radius, speed, yOffset });
    scene.add(mesh);
  }

  // ── Particle Field ──
  const particleCount = 300;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const palette = [
    new THREE.Color(0xa855f7),
    new THREE.Color(0xe879f9),
    new THREE.Color(0xc4b5fd),
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Grid Floor ──
  const gridHelper = new THREE.GridHelper(30, 30, 0x6d28d9, 0x1a0a3e);
  gridHelper.position.y = -3;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.3;
  scene.add(gridHelper);

  // ── Mouse Interaction ──
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // ── Reset Camera Button ──
  const resetBtn = document.getElementById('reset-camera');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      camera.position.set(0, 2, 6);
      camera.lookAt(0, 0, 0);
    });
  }

  // ── Animation Loop ──
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      // Rotate torus knot
      torusKnot.rotation.x = elapsed * 0.15;
      torusKnot.rotation.y = elapsed * 0.25;
      wireframeOverlay.rotation.x = elapsed * 0.15;
      wireframeOverlay.rotation.y = elapsed * 0.25;

      // Floating motion
      torusKnot.position.y = Math.sin(elapsed * 0.8) * 0.15;
      wireframeOverlay.position.y = torusKnot.position.y;

      // Orbiters
      orbiters.forEach((o) => {
        o.angle += o.speed * 0.01;
        o.mesh.position.x = Math.cos(o.angle) * o.radius;
        o.mesh.position.z = Math.sin(o.angle) * o.radius;
        o.mesh.position.y = o.yOffset + Math.sin(elapsed * o.speed + o.angle) * 0.3;
      });

      // Particles drift
      particles.rotation.y = elapsed * 0.02;
      particles.rotation.x = elapsed * 0.01;

      // Camera follows mouse slightly
      targetRotY = mouseX * 0.3;
      targetRotX = mouseY * 0.15;
      camera.position.x += (targetRotY - camera.position.x) * 0.02;
      camera.position.y += (2 + targetRotX - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Lights orbit
      pointLight1.position.x = Math.cos(elapsed * 0.5) * 5;
      pointLight1.position.z = Math.sin(elapsed * 0.5) * 5;
      pointLight2.position.x = Math.cos(elapsed * 0.3 + 2) * 4;
      pointLight2.position.z = Math.sin(elapsed * 0.3 + 2) * 4;
    }

    renderer.render(scene, camera);
  }

  animate();

  // ── Resize Handler ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
