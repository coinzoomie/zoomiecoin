/* ZoomieCoin — 3D Interactive Scene (mouse drag + scroll) */
// Renderer
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Scene & Camera
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x06060d, 16, 80);
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 200);
camera.position.set(0, 1.6, 18);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(8, 12, 6);
scene.add(dir);

// ==== Starfield (very light) ====
const starsGeom = new THREE.BufferGeometry();
const STARS = 1500;
const positions = new Float32Array(STARS*3);
for (let i=0;i<positions.length;i++) positions[i] = (Math.random()-0.5)*160;
starsGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const stars = new THREE.Points(starsGeom, new THREE.PointsMaterial({ size: 0.06 }));
scene.add(stars);

// ==== Neon grid floor ====
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(500,500, 50,50),
  new THREE.MeshStandardMaterial({ color: 0x0a0a18, metalness:0.2, roughness:0.95 })
);
floor.rotation.x = -Math.PI/2;
scene.add(floor);
const grid = new THREE.GridHelper(120, 120, 0x6aa8ff, 0x2348aa);
grid.position.y = 0.02;
scene.add(grid);

// ==== Centerpiece (Z-ring + core) ====
const center = new THREE.Group(); scene.add(center);
const coin = new THREE.Mesh(
  new THREE.TorusGeometry(3.2, 0.65, 32, 140),
  new THREE.MeshStandardMaterial({ color: 0xffc84a, metalness: 0.9, roughness: 0.25 })
);
center.add(coin);

const core = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x152245, metalness:0.7, roughness:0.3 })
);
center.add(core);
center.position.set(0, 2.0, -6);

// ==== Floating geometric shards ====
const shards = new THREE.Group(); scene.add(shards);
for (let i=0;i<22;i++){
  const s = new THREE.Mesh(
    new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(0.25,0.6)),
    new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i/22, 0.75, 0.6), metalness:.6, roughness:.35 })
  );
  s.position.set((Math.random()-0.5)*28, Math.random()*6+0.6, -4 - Math.random()*28);
  s.rotation.set(Math.random(), Math.random(), Math.random());
  shards.add(s);
}

// ==== Scroll interaction ====
let scrollY = 0;
function updateScroll(){
  const docH = document.body.scrollHeight - innerHeight;
  const n = docH>0 ? (scrollY / docH) : 0; // 0..1
  // Move camera smoothly on scroll
  camera.position.z = 18 - n * 8;
  camera.position.y = 1.6 + Math.sin(n*Math.PI)*0.6;
  center.rotation.x = n * 0.6;
  center.rotation.y = n * 1.2;
}
addEventListener('scroll', ()=>{ scrollY = window.scrollY || document.documentElement.scrollTop; });

// ==== Mouse / touch drag to orbit ====
let isDrag=false, lastX=0, lastY=0, yaw=0, pitch=0;
addEventListener('mousedown', e=>{isDrag=true; lastX=e.clientX; lastY=e.clientY;});
addEventListener('mouseup', ()=> isDrag=false);
addEventListener('mousemove', e=>{
  if(!isDrag) return;
  const dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
  yaw -= dx*0.002; pitch -= dy*0.0016; pitch = Math.max(-0.9, Math.min(0.9, pitch));
});
addEventListener('touchstart', e=>{isDrag=true; const t=e.touches[0]; lastX=t.clientX; lastY=t.clientY;});
addEventListener('touchend', ()=> isDrag=false);
addEventListener('touchmove', e=>{
  if(!isDrag) return;
  const t=e.touches[0]; const dx=t.clientX-lastX, dy=t.clientY-lastY; lastX=t.clientX; lastY=t.clientY;
  yaw -= dx*0.002; pitch -= dy*0.0016; pitch = Math.max(-0.9, Math.min(0.9, pitch));
});

// ==== Animation loop ====
let t=0;
function animate(){
  requestAnimationFrame(animate);
  t += 0.016;

  stars.rotation.y += 0.0008;
  grid.rotation.z = Math.sin(t*0.07)*0.02;

  coin.rotation.x += 0.01;
  coin.rotation.y += 0.006;
  core.rotation.y -= 0.008;

  shards.children.forEach((m,i)=>{
    m.rotation.x += 0.01 + i*0.0002;
    m.rotation.y -= 0.008 + i*0.00015;
    m.position.y += Math.sin(t*1.2 + i)*0.004;
  });

  // Apply mouse orbit to camera look
  camera.rotation.set(pitch, yaw, 0);

  updateScroll();
  renderer.render(scene, camera);
}
animate();

// Resize
addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
