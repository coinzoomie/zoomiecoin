// Zoomie 3D — Hybrid Space x Fantasy Animals
// Three.js mini world: stars + neon grid + floating animal sprites + coins + portals

// --- Renderer & Scene ---
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x070717, 12, 42);

const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 8);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 1.1); dir.position.set(5,8,3); scene.add(dir);

// Stars
const starGeom = new THREE.BufferGeometry();
const starCnt = 1600;
const pos = new Float32Array(starCnt*3);
for(let i=0;i<pos.length;i++){ pos[i] = (Math.random()-0.5)*80; }
starGeom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
const starMat = new THREE.PointsMaterial({ size: 0.04, transparent:true });
const stars = new THREE.Points(starGeom, starMat);
scene.add(stars);

// Floor + neon grid
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200,200, 40,40),
  new THREE.MeshStandardMaterial({color:0x0b0b18, metalness:0.2, roughness:0.8})
);
floor.rotation.x = -Math.PI/2; scene.add(floor);
const grid = new THREE.GridHelper(80, 80, 0x66aaff, 0x224499); grid.position.y = 0.01; scene.add(grid);

// --- Fantasy Animal Sprites (procedural textures on planes) ---
function makeAnimalTexture(type, color1, color2){
  const c = document.createElement('canvas'); c.width=256; c.height=256;
  const g = c.getContext('2d');
  g.clearRect(0,0,256,256);
  // gradient bg glow
  const grad = g.createRadialGradient(128,128,20,128,128,120);
  grad.addColorStop(0, color1); grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.beginPath(); g.arc(128,128,120,0,Math.PI*2); g.fill();
  // silhouette
  g.fillStyle = color2;
  g.beginPath();
  if(type==='cat'){
    g.moveTo(60,180); g.quadraticCurveTo(60,120,95,110); // back
    g.quadraticCurveTo(100,80,115,70); // neck
    g.quadraticCurveTo(125,40,145,60); // ear1
    g.quadraticCurveTo(165,40,175,60); // ear2
    g.quadraticCurveTo(185,80,188,100); // forehead
    g.quadraticCurveTo(200,120,180,140); // nose-chin
    g.quadraticCurveTo(160,160,140,155); // chest
    g.quadraticCurveTo(120,152,110,165); // paw
    g.quadraticCurveTo(95,185,80,185); // belly
    g.quadraticCurveTo(60,190,60,180); // tail base
    g.moveTo(60,170); g.quadraticCurveTo(35,135,70,115); // tail
  }else{ // dog
    g.moveTo(60,170); g.quadraticCurveTo(70,140,105,135); // back
    g.quadraticCurveTo(130,120,150,120); // neck
    g.quadraticCurveTo(175,120,190,130); // muzzle
    g.quadraticCurveTo(170,135,160,140); // nose
    g.quadraticCurveTo(155,160,145,165); // chest
    g.quadraticCurveTo(125,175,110,180); // front leg
    g.quadraticCurveTo(95,185,80,180); // belly
    g.quadraticCurveTo(65,175,60,170); // hind
    g.moveTo(60,170); g.quadraticCurveTo(40,140,70,130); // tail
    // ear
    g.moveTo(145,120); g.quadraticCurveTo(135,95,150,90);
  }
  g.fill();
  return new THREE.CanvasTexture(c);
}
const animals = new THREE.Group(); scene.add(animals);
for(let i=0;i<8;i++){
  const type = i%2 ? 'cat' : 'dog';
  const tex = makeAnimalTexture(type, 'rgba(138,198,255,0.35)', 'rgba(255,216,111,0.9)');
  tex.anisotropy = 4;
  const m = new THREE.MeshBasicMaterial({map: tex, transparent:true, depthWrite:false});
  const p = new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6), m);
  p.position.set((Math.random()-0.5)*18, 1.8+Math.random()*2.2, -6 - Math.random()*14);
  p.userData.billboard = true;
  animals.add(p);
}

// --- Portals (open info panels) ---
const portals = [];
const sections = [
  { title:'Roadmap', text:'Phases 1→8: Airdrop, Presale, DEX, Games, Optional Staking, POS & Tickets, Vet Partners, Metaverse City.' , color:0x66ccff},
  { title:'Tokenomics', text:'Total 1B ZOO. Airdrop 5%, Presale 20%, Staking 15%, Liquidity 15%, Charity 10%, Marketing 10%, Team 10%, Metaverse 10%, Burn 5%.' , color:0xffd86f},
  { title:'Charity', text:'On-chain donations for shelters & vet care. Public wallet. Transparent reports.', color:0xff7ee8 },
  { title:'Contest', text:'#ZoomieRun viral challenge — post pet zoomies, tag us, earn ZOO by views.', color:0x8ac6ff }
];
sections.forEach((s,i)=>{
  const g = new THREE.TorusGeometry(1.2, 0.18, 20, 100);
  const m = new THREE.MeshStandardMaterial({color:s.color, emissive:s.color, emissiveIntensity:0.4, metalness:0.4, roughness:0.3});
  const ring = new THREE.Mesh(g, m);
  ring.position.set((i-1.5)*5.2, 1.4, -4 - Math.random()*4);
  ring.rotation.x = Math.PI/2;
  ring.userData.section = s;
  scene.add(ring);
  portals.push(ring);
});

// --- Coins ---
const coins = new THREE.Group(); scene.add(coins);
const coinColor = new THREE.Color(0xffc94a);
for(let i=0;i<10;i++){
  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28,0.28,0.1, 36,1,true),
    new THREE.MeshStandardMaterial({color:coinColor, metalness:0.85, roughness:0.25})
  );
  const capA = new THREE.Mesh(new THREE.CircleGeometry(0.27, 36), new THREE.MeshStandardMaterial({color:0xffe28a, metalness:0.9, roughness:0.2}));
  const capB = capA.clone();
  capA.rotation.x = -Math.PI/2; capA.position.y = 0.05;
  capB.rotation.x = Math.PI/2;  capB.position.y = -0.05;
  const g = new THREE.Group();
  g.add(coin, capA, capB);
  g.position.set((Math.random()-0.5)*14, 0.4 + Math.random()*2.5, -3 - Math.random()*14);
  g.rotation.y = Math.random()*Math.PI;
  coins.add(g);
}

// Central spinning core
const zooCore = new THREE.Group();
const core = new THREE.SphereGeometry(1.1, 40, 40);
const coreMat = new THREE.MeshStandardMaterial({color:0x151525, metalness:0.7, roughness:0.25});
const coreMesh = new THREE.Mesh(core, coreMat); zooCore.add(coreMesh);
for(let i=0;i<10;i++){
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 2.6),
    new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL((i/10), 0.8, 0.6), emissiveIntensity:0.45, metalness:0.6, roughness:0.3})
  );
  const a = (i/10)*Math.PI*2;
  box.position.set(Math.cos(a)*1.5, Math.sin(a)*1.5, 0);
  box.rotation.z = a;
  zooCore.add(box);
}
zooCore.position.set(0,1.4,-6);
scene.add(zooCore);

// --- Input & Movement ---
const keys = {};
addEventListener('keydown', e=> keys[e.code]=true);
addEventListener('keyup',   e=> keys[e.code]=false);

let yaw = 0, pitch = 0;
let isDrag = false, lastX=0, lastY=0;
addEventListener('mousedown', e=>{ isDrag=true; lastX=e.clientX; lastY=e.clientY; });
addEventListener('mouseup',   ()=> isDrag=false);
addEventListener('mousemove', e=>{
  if(!isDrag) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  lastX=e.clientX; lastY=e.clientY;
  yaw  -= dx * 0.0025;
  pitch-= dy * 0.002;
  const lim = Math.PI/2 - 0.05;
  pitch = Math.max(-lim, Math.min(lim, pitch));
});

let vel = new THREE.Vector3();
const speed = 0.07;
const grav = 0.015;
let onGround = true;

function updateMovement(){
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)*-1);
  const right   = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).multiplyScalar(-1);
  let dir = new THREE.Vector3();
  if(keys['KeyW']) dir.add(forward);
  if(keys['KeyS']) dir.add(forward.clone().multiplyScalar(-1));
  if(keys['KeyA']) dir.add(right.clone().multiplyScalar(-1));
  if(keys['KeyD']) dir.add(right);
  if(dir.length()>0) dir.normalize().multiplyScalar(speed);
  vel.x = dir.x; vel.z = dir.z;
  if(keys['Space'] && onGround){ vel.y = 0.25; onGround = False; }
  vel.y -= grav;
  camera.position.add(vel);
  if(camera.position.y <= 1.6){ camera.position.y = 1.6; vel.y = 0; onGround = true; }
  camera.rotation.set(pitch, yaw, 0);
}

// --- Interactions ---
const raycaster = new THREE.Raycaster();
function pickPortal(){
  raycaster.setFromCamera({x:0,y:0}, camera);
  const hits = raycaster.intersectObjects(portals, false);
  if(hits.length){
    const s = hits[0].object.userData.section;
    showPanel(s.title, s.text);
  }
}
addEventListener('click', ()=> pickPortal());

// Coins collection
let score = 0;
const scoreEl = document.getElementById('score');
function updateCoins(dt){
  coins.children.forEach((g,i)=>{
    g.rotation.y += dt*1.2;
    g.position.y += Math.sin(performance.now()*0.001 + i)*0.005;
    if(g.visible && g.position.distanceTo(camera.position) < 1.0){
      g.visible = false; score += 1; scoreEl.textContent = score;
    }
  });
}

// Panel UI
const panel = document.getElementById('infoPanel');
const panelTitle = document.getElementById('panelTitle');
const panelText = document.getElementById('panelText');
document.getElementById('panelClose').addEventListener('click', ()=> panel.style.display = 'none');
function showPanel(title, text){ panelTitle.textContent = title; panelText.textContent = text; panel.style.display = 'flex'; }

// Animate
const clock = new THREE.Clock();
function animate(){
  const dt = clock.getDelta();
  stars.rotation.y += dt*0.05;
  grid.material.opacity = 0.5 + Math.sin(performance.now()*0.001)*0.1;
  animals.children.forEach((p,i)=>{
    p.lookAt(camera.position);
    p.position.y += Math.sin(performance.now()*0.001 + i)*0.003;
  });
  zooCore.rotation.y += dt*0.7;
  portals.forEach((p,i)=> p.rotation.y += dt*(0.5 + i*0.1));
  updateMovement();
  updateCoins(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Resize
addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Pre-open welcome
setTimeout(()=> showPanel('Welcome to Zoomie 3D', 'Move with WASD, drag to look, jump with Space. Collect coins. Step into a glowing ring and click to open info.'), 600);
