/* ZoomieCoin — 3D Neon Tunnel + Golden Coin
   - Drag (mouse/touch) to orbit
   - Scroll to boost tunnel speed
   - Mobile/Desktop optimized
*/
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x06060d, 20, 120);

// Camera
const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 400);
camera.position.set(0, 1.6, 14);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(6, 10, 4);
scene.add(dir);

// ===== Neon Tunnel (instanced rings for performance) =====
const RING_COUNT = 48;
const RADIUS = 8;
const RING_SEGMENTS = 64;

const ringGeo = new THREE.RingGeometry(RADIUS*0.78, RADIUS, RING_SEGMENTS);
ringGeo.rotateX(Math.PI/2);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0x66ccff,
  wireframe: true,
  transparent: true,
  opacity: 0.85
});

const rings = [];
for (let i=0; i<RING_COUNT; i++){
  const ring = new THREE.Mesh(ringGeo, ringMat.clone());
  ring.material.color.setHSL((i/RING_COUNT), 0.8, 0.6);
  ring.position.z = -i*3.2;
  ring.position.y = 1.1;
  scene.add(ring);
  rings.push(ring);
}

// ===== Golden Coin (centerpiece) =====
const coinGroup = new THREE.Group();
const coinEdge = new THREE.CylinderGeometry(1.8, 1.8, 0.28, 64, 1, true);
const edgeMat  = new THREE.MeshStandardMaterial({ color: 0xffc84a, metalness: 0.9, roughness: 0.25 });
const edge = new THREE.Mesh(coinEdge, edgeMat);
coinGroup.add(edge);

const capMat = new THREE.MeshStandardMaterial({ color: 0xffe08a, metalness: 0.95, roughness: 0.2 });
const capA = new THREE.Mesh(new THREE.CircleGeometry(1.79, 64), capMat);
const capB = new THREE.Mesh(new THREE.CircleGeometry(1.79, 64), capMat.clone());
capA.rotation.x = -Math.PI/2; capA.position.y = 0.14;
capB.rotation.x =  Math.PI/2; capB.position.y = -0.14;
coinGroup.add(capA, capB);

coinGroup.rotation.x = Math.PI/2;
coinGroup.position.set(0, 1.6, -6);
scene.add(coinGroup);

// ===== Floating shards =====
const shards = new THREE.Group(); scene.add(shards);
for (let i=0;i<26;i++){
  const m = new THREE.Mesh(
    new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(0.22,0.55)),
    new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i/26, 0.75, 0.55), metalness:.6, roughness:.35 })
  );
  m.position.set((Math.random()-0.5)*10, 0.9 + Math.random()*2.2, -3 - Math.random()*14);
  shards.add(m);
}

// ===== Interaction: drag orbit + scroll speed =====
let isDrag=false, lastX=0, lastY=0, yaw=0, pitch=0;
addEventListener('mousedown', e=>{isDrag=true; lastX=e.clientX; lastY=e.clientY;});
addEventListener('mouseup',   ()=> isDrag=false);
addEventListener('mousemove', e=>{
  if(!isDrag) return;
  const dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
  yaw -= dx*0.002; pitch -= dy*0.0014; pitch = Math.max(-0.8, Math.min(0.8, pitch));
});
addEventListener('touchstart', e=>{isDrag=true; const t=e.touches[0]; lastX=t.clientX; lastY=t.clientY;}, {passive:true});
addEventListener('touchend',   ()=> isDrag=false);
addEventListener('touchmove',  e=>{
  if(!isDrag) return;
  const t=e.touches[0]; const dx=t.clientX-lastX, dy=t.clientY-lastY; lastX=t.clientX; lastY=t.clientY;
  yaw -= dx*0.002; pitch -= dy*0.0014; pitch = Math.max(-0.8, Math.min(0.8, pitch));
}, {passive:true});

let scrollBoost = 0; // will increase with scroll
addEventListener('scroll', ()=>{
  const doc = document.documentElement;
  const y = (doc.scrollTop || window.scrollY || 0);
  const max = (doc.scrollHeight - innerHeight) || 1;
  const n = Math.min(1, Math.max(0, y / max));
  scrollBoost = 0.5 + n*3.0; // 0.5 .. 3.5
});

// ===== Animate =====
let t=0;
function animate(){
  requestAnimationFrame(animate);
  t += 0.016;

  // Move rings forward; recycle them
  for (let i=0;i<rings.length;i++){
    const r = rings[i];
    r.rotation.z += 0.002 + (i*0.00005);
    r.position.z += (0.15 + Math.sin(t*0.5)*0.05) * scrollBoost;
    if (r.position.z > 6){
      r.position.z -= RING_COUNT*3.2;
    }
  }

  // Coin & shards motion
  coinGroup.rotation.y += 0.02;
  shards.children.forEach((m,i)=>{
    m.rotation.x += 0.01 + i*0.0002;
    m.rotation.y -= 0.008 + i*0.00015;
    m.position.y += Math.sin(t*1.2 + i)*0.003;
  });

  // Camera look
  camera.rotation.set(pitch, yaw, 0);

  renderer.render(scene, camera);
}
animate();

// Resize
addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
