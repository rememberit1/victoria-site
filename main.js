import * as THREE from './assets/three.module.js';
const CAPTURE = new URLSearchParams(location.search).has('capture');
window.CAPTURE = CAPTURE;
gsap.registerPlugin(ScrollTrigger);
let vt = 0;                        // virtual seconds (capture mode)
const realStart = performance.now();
const now = () => CAPTURE ? vt : (performance.now() - realStart) / 1000;
const dateBase = Date.now();
const nowDate = () => CAPTURE ? dateBase + vt * 1000 : Date.now();

/* ---------- split title text ---------- */
const big = document.getElementById('bigTitle');
big.innerHTML = [...big.textContent].map((c, i) => `<span class="ch" style="animation-delay:${-i * 0.25}s">${c}</span>`).join('');
const sub = document.getElementById('subTitle');
sub.innerHTML = sub.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');

/* ---------- THREE background ---------- */
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: CAPTURE });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
camera.position.z = 22;
scene.add(new THREE.AmbientLight(0xffffff, 1.1));
const key = new THREE.DirectionalLight(0xfff1e0, 2.2); key.position.set(6, 10, 12); scene.add(key);
const rim = new THREE.PointLight(0xff3d8b, 60, 60); rim.position.set(-10, -4, 10); scene.add(rim);

const hs = new THREE.Shape();
hs.moveTo(5, 5); hs.bezierCurveTo(5, 5, 4, 0, 0, 0); hs.bezierCurveTo(-6, 0, -6, 7, -6, 7);
hs.bezierCurveTo(-6, 11, -3, 15.4, 5, 19); hs.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
hs.bezierCurveTo(16, 7, 16, 0, 10, 0); hs.bezierCurveTo(7, 0, 5, 5, 5, 5);
const heartGeo = new THREE.ExtrudeGeometry(hs, { depth: 4, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 1.6, bevelThickness: 1.6, curveSegments: 14 });
heartGeo.center(); heartGeo.rotateZ(Math.PI); heartGeo.scale(0.07, 0.07, 0.07);
const palette = [0xff2e88, 0xff4fa3, 0xff7a59, 0xffc83d, 0xff1f5a, 0xffffff, 0xff9ec7];
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hearts = [];
for (let i = 0; i < 34; i++) {
  const c = palette[i % palette.length];
  const m = new THREE.Mesh(heartGeo, new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: c === 0xffc83d ? 0.25 : 0.08, emissive: c, emissiveIntensity: 0.28 }));
  const s = 0.5 + rnd() * 1.3;
  m.scale.setScalar(s);
  m.userData = { x: (rnd() - 0.5) * 44, y: (rnd() - 0.5) * 70, z: -14 + rnd() * 16, sp: 0.4 + rnd() * 0.8, ph: rnd() * 6.28, rs: (rnd() - 0.5) * 1.6 };
  scene.add(m); hearts.push(m);
}
// confetti
const CONF = 420;
const confGeo = new THREE.PlaneGeometry(0.28, 0.5);
const confMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
const confetti = new THREE.InstancedMesh(confGeo, confMat, CONF);
const confData = [];
const col = new THREE.Color();
for (let i = 0; i < CONF; i++) {
  confData.push({ x: (rnd() - 0.5) * 50, y: rnd() * 60, z: -12 + rnd() * 20, sp: 1 + rnd() * 2.2, ph: rnd() * 6.28, rx: rnd() * 4, ry: rnd() * 4 });
  confetti.setColorAt(i, col.set(palette[i % palette.length]));
}
scene.add(confetti);
// sparkles
const sc = document.createElement('canvas'); sc.width = sc.height = 64;
const g = sc.getContext('2d');
const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(.25, 'rgba(255,240,180,.9)'); grd.addColorStop(1, 'rgba(255,200,80,0)');
g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
g.fillStyle = '#fff'; g.beginPath(); g.moveTo(32, 0); g.lineTo(35, 29); g.lineTo(64, 32); g.lineTo(35, 35); g.lineTo(32, 64); g.lineTo(29, 35); g.lineTo(0, 32); g.lineTo(29, 29); g.fill();
const sparkTex = new THREE.CanvasTexture(sc);
const sparkGroups = [];
for (let k = 0; k < 3; k++) {
  const N = 140, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (rnd() - 0.5) * 50; pos[i * 3 + 1] = (rnd() - 0.5) * 80; pos[i * 3 + 2] = -10 + rnd() * 18; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ map: sparkTex, size: 0.9 + k * 0.35, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: [0xffffff, 0xffe27a, 0xffb3d9][k] }));
  scene.add(p); sparkGroups.push(p);
}
const dummy = new THREE.Object3D();
let mouseX = 0, mouseY = 0;
addEventListener('pointermove', e => { mouseX = e.clientX / innerWidth - 0.5; mouseY = e.clientY / innerHeight - 0.5; });
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

function render3D(t) {
  const sy = scrollY / innerHeight;
  camera.position.x += (mouseX * 3 - camera.position.x) * (CAPTURE ? 1 : 0.05);
  camera.position.y = -sy * 3 + -mouseY * 2;
  camera.lookAt(0, camera.position.y, 0);
  for (const h of hearts) {
    const d = h.userData;
    let y = d.y + t * d.sp + sy * (2 + d.z * 0.1) * 3;
    y = ((y + 35) % 70 + 70) % 70 - 35 + camera.position.y;
    h.position.set(d.x + Math.sin(t * 0.6 + d.ph) * 1.5, y, d.z);
    h.rotation.set(Math.sin(t * 0.8 + d.ph) * 0.4, t * d.rs + d.ph, Math.sin(t * 0.5 + d.ph) * 0.2);
  }
  for (let i = 0; i < CONF; i++) {
    const d = confData[i];
    let y = d.y - t * d.sp;
    y = ((y % 60) + 60) % 60 - 30 + camera.position.y;
    dummy.position.set(d.x + Math.sin(t * 1.3 + d.ph) * 1.2, y, d.z);
    dummy.rotation.set(t * d.rx + d.ph, t * d.ry, d.ph);
    dummy.updateMatrix(); confetti.setMatrixAt(i, dummy.matrix);
  }
  confetti.instanceMatrix.needsUpdate = true;
  sparkGroups.forEach((p, k) => {
    p.material.opacity = 0.45 + 0.55 * Math.abs(Math.sin(t * (1.6 + k * 0.7) + k));
    p.rotation.z = Math.sin(t * 0.1 + k) * 0.05;
    p.position.y = camera.position.y * (0.3 + k * 0.2);
  });
  renderer.render(scene, camera);
}

/* ---------- countdown / counters ---------- */
const target = new Date('2027-02-14T00:00:00').getTime();
const pad = n => String(n).padStart(2, '0');
const $ = id => document.getElementById(id);
function updateCounters(t) {
  let diff = Math.max(0, target - nowDate());
  const d = Math.floor(diff / 864e5); diff -= d * 864e5;
  const h = Math.floor(diff / 36e5); diff -= h * 36e5;
  const m = Math.floor(diff / 6e4); diff -= m * 6e4;
  const s = Math.floor(diff / 1e3);
  $('cd-d').textContent = d; $('cd-h').textContent = pad(h); $('cd-m').textContent = pad(m); $('cd-s').textContent = pad(s);
  const interest = 0.0137 * t + 0.0009 * t * t * 0.05;   // compounding-ish, purely imaginary
  $('interest').textContent = '$' + interest.toFixed(4);
  $('total').textContent = '$' + (20 + interest).toFixed(4);
}

/* ---------- GSAP intro + scroll animations ---------- */
function buildIntro() {
  const tl = gsap.timeline();
  tl.from('.pill', { y: -60, opacity: 0, duration: 0.7, ease: 'back.out(2)' })
    .from('.big .ch', { y: 140, rotationZ: () => gsap.utils.random(-40, 40), scale: 0.2, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'elastic.out(1,0.55)' }, 0.15)
    .from('.sub .w', { y: 40, opacity: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(3)' }, 0.8)
    .from('.hero-anim', { y: 50, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' }, 1.2)
    .from('#bookWrap', { scale: 0.3, rotationY: -180, opacity: 0, duration: 1.4, ease: 'back.out(1.4)' }, 0.5)
    .from('.countdown div', { scale: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(3)' }, 1.6);
  return tl;
}
function buildScroll() {
  gsap.utils.toArray('.reveal').forEach((el, i) => {
    gsap.from(el, { y: 90, opacity: 0, rotation: (i % 2 ? 4 : -4), scale: 0.9, duration: 0.9, ease: 'back.out(1.6)',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } });
  });
  gsap.from('.chat .b', { scale: 0, opacity: 0, transformOrigin: 'left bottom', duration: 0.45, stagger: 0.22, ease: 'back.out(2.5)',
    scrollTrigger: { trigger: '.phone', start: 'top 75%' } });
  const cnt = { v: 0 };
  gsap.to(cnt, { v: 47, duration: 2.4, ease: 'power2.out', onUpdate: () => $('textCount').textContent = Math.round(cnt.v),
    scrollTrigger: { trigger: '.phone', start: 'top 75%' } });
  gsap.utils.toArray('.pol').forEach((el, i) => {
    gsap.from(el, { y: 300, x: (i - 2) * -120, rotationY: 90, rotationZ: (i - 2) * 25, opacity: 0, duration: 1.1, delay: i * 0.12, ease: 'back.out(1.3)',
      scrollTrigger: { trigger: '.polaroids', start: 'top 85%' } });
  });
  gsap.from('.siren-banner', { scaleX: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: '#debt', start: 'top 80%' } });
  gsap.to('.marquee', { x: -120, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.blurb', { y: -60, ease: 'none', scrollTrigger: { trigger: '#story', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.phone', { y: 40, rotation: 3, ease: 'none', scrollTrigger: { trigger: '#story', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------- runaway pay button ---------- */
const payBtn = $('payBtn'), payZone = $('payZone');
let bx = 0, by = 0;            // offset from centre
function dodge(cx, cy) {
  const r = payBtn.getBoundingClientRect();
  const mx = r.left + r.width / 2, my = r.top + r.height / 2;
  const dx = mx - cx, dy = my - cy, dist = Math.hypot(dx, dy);
  if (dist < 150) {
    const z = payZone.getBoundingClientRect();
    const limX = z.width / 2 - r.width / 2, limY = z.height / 2 - r.height / 2;
    bx += (dx / (dist || 1)) * (150 - dist) * 0.9 + (Math.abs(bx) > limX * 0.8 ? -Math.sign(bx) * 160 : 0);
    by += (dy / (dist || 1)) * (150 - dist) * 0.5;
    bx = Math.max(-limX, Math.min(limX, bx)); by = Math.max(-limY, Math.min(limY, by));
    payBtn.style.transform = `translate(calc(-50% + ${bx}px), calc(-50% + ${by}px)) rotate(${bx * 0.03}deg)`;
  }
}
payBtn.style.transition = CAPTURE ? 'none' : 'transform .25s cubic-bezier(.3,1.6,.5,1)';
addEventListener('pointermove', e => dodge(e.clientX, e.clientY));
payBtn.addEventListener('click', () => { payBtn.classList.remove('shake'); void payBtn.offsetWidth; payBtn.classList.add('shake'); payBtn.textContent = 'Nice try 😂'; setTimeout(() => payBtn.textContent = '💸 Pay Ben Back', 1400); });
$('notifyBtn').addEventListener('click', () => { $('notifyMsg').classList.add('show'); gsap.fromTo('#notifyBtn', { scale: 0.85 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' }); });

/* ---------- loops ---------- */
if (!CAPTURE) {
  buildIntro(); buildScroll();
  const loop = () => { const t = now(); updateCounters(t); render3D(t); requestAnimationFrame(loop); };
  loop();
} else {
  gsap.ticker.remove(gsap.updateRoot);
  const fc = $('fakeCursor');
  let base = null, intro = null;
  window.renderAt = (t, y, cursor) => {
    if (base === null) { base = gsap.ticker.time; intro = buildIntro(); intro.pause(); buildScroll(); }
    vt = t;
    window.scrollTo(0, y);
    ScrollTrigger.update();
    gsap.updateRoot(base + t);
    intro.time(t);
    document.getAnimations().forEach(a => { if (a.playState !== 'finished' || a.effect?.getTiming().iterations === Infinity) { a.pause(); a.currentTime = t * 1000; } });
    if (cursor) { fc.style.display = 'block'; fc.style.left = cursor[0] + 'px'; fc.style.top = cursor[1] + 'px'; dodge(cursor[0], cursor[1]); mouseX = cursor[0] / innerWidth - .5; mouseY = cursor[1] / innerHeight - .5; }
    else fc.style.display = 'none';
    updateCounters(t);
    render3D(t);
    const r = payBtn.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  };
  window.sectionTops = () => Object.fromEntries(['hero', 'story', 'gallery', 'reviews', 'debt', 'notify'].map(id => [id, document.getElementById(id).offsetTop]).concat([['max', document.documentElement.scrollHeight - innerHeight]]));
}
