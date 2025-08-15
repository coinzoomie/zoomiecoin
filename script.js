// Zoomie 3D — fast & mobile-friendly background
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x090914, 10, 42);
const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 120);
camera.position.set(0, 1.6, 8);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 1.1); dir.position.set(6,8,4); scene.add(dir);

// Starfield (very light)
const starGeom = new THREE.BufferGeometry();
const count = 1500;
const arr = new Float32Array(count*3);
for(let i=0;i<arr.length;i++){ arr[i] = (Math.random()-0.5)*100; }
starGeom.setAttribute('position', new THREE.BufferAttribute(arr, 3));
const starMat = new THREE.PointsMaterial({ size: 0.035, transparent:true });
const stars = new THREE.Points(starGeom, starMat);
scene.add(stars);

// Neon floor + grid
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200,200, 20,20),
  new THREE.MeshStandardMaterial({color:0x0b0b18, metalness:0.2, roughness:0.9})
);
floor.rotation.x = -Math.PI/2; scene.add(floor);
const grid = new THREE.GridHelper(80, 80, 0x66aaff, 0x224499); grid.position.y = 0.01; scene.add(grid);

// Center core
const coreGroup = new THREE.Group();
const core = new THREE.Mesh(
  new THREE.SphereGeometry(1.05, 36, 36),
  new THREE.MeshStandardMaterial({color:0x141426, metalness:0.7, roughness:0.25})
);
coreGroup.add(core);
for(let i=0;i<10;i++){
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 2.4),
    new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(i/10, 0.8, 0.6), metalness:0.6, roughness:0.3})
  );
  const a = (i/10)*Math.PI*2;
  bar.position.set(Math.cos(a)*1.45, Math.sin(a)*1.45, 0);
  bar.rotation.z = a;
  coreGroup.add(bar);
}
coreGroup.position.set(0,1.4,-6);
scene.add(coreGroup);

// Floating coins (simple, cheap)
const coins = new THREE.Group(); scene.add(coins);
for(let i=0;i<10;i++){
  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24,0.24,0.09, 28,1,true),
    new THREE.MeshStandardMaterial({color:0xffc94a, metalness:0.85, roughness:0.25})
  );
  const capA = new THREE.Mesh(new THREE.CircleGeometry(0.23, 28),
    new THREE.MeshStandardMaterial({color:0xffe28a, metalness:0.9, roughness:0.2}));
  const capB = capA.clone();
  capA.rotation.x = -Math.PI/2; capA.position.y = 0.045;
  capB.rotation.x = Math.PI/2;  capB.position.y = -0.045;
  const g = new THREE.Group(); g.add(coin, capA, capB);
  g.position.set((Math.random()-0.5)*14, 0.6 + Math.random()*2.0, -3 - Math.random()*12);
  coins.add(g);
}

// Basic mouse look (no pointer lock; mobile-safe)
let isDrag=false, lastX=0, lastY=0, yaw=0, pitch=0;
addEventListener('mousedown', e=>{isDrag=true; lastX=e.clientX; lastY=e.clientY;});
addEventListener('mouseup',   ()=> isDrag=false);
addEventListener('mousemove', e=>{
  if(!isDrag) return;
  const dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
  yaw -= dx*0.002; pitch -= dy*0.0015;
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
});
addEventListener('touchstart', e=>{ isDrag=true; const t=e.touches[0]; lastX=t.clientX; lastY=t.clientY; });
addEventListener('touchend',   ()=> isDrag=false);
addEventListener('touchmove',  e=>{
  if(!isDrag) return;
  const t=e.touches[0]; const dx=t.clientX-lastX, dy=t.clientY-lastY; lastX=t.clientX; lastY=t.clientY;
  yaw -= dx*0.002; pitch -= dy*0.0015; pitch = Math.max(-1.2, Math.min(1.2, pitch));
});

// Subtle camera hover
let t=0;
function animate(){
  requestAnimationFrame(animate);
  const dt = 0.016;
  t += dt;
  stars.rotation.y += dt*0.05;
  coreGroup.rotation.y += dt*0.6;
  coins.children.forEach((g,i)=>{
    g.rotation.y += dt*1.1;
    g.position.y += Math.sin(t*1.2 + i)*0.003;
  });
  camera.position.x = Math.sin(t*0.25)*0.6;
  camera.position.y = 1.6 + Math.sin(t*0.35)*0.1;
  camera.rotation.set(pitch, yaw, 0);
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Info panel
const panel = document.getElementById('infoPanel');
document.getElementById('openPanel').addEventListener('click', ()=> panel.style.display='flex');
document.getElementById('closePanel').addEventListener('click', ()=> panel.style.display='none');
