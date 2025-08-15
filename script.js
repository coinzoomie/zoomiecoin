// Three.js background + 3D coin
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0,0,6);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(3,4,5); scene.add(dir);

const pGeom = new THREE.BufferGeometry();
const pCount = 2400;
const positions = new Float32Array(pCount*3);
for(let i=0;i<pCount*3;i++){ positions[i] = (Math.random()-0.5)*40; }
pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const pMat = new THREE.PointsMaterial({ size: 0.035, transparent:true });
const points = new THREE.Points(pGeom, pMat); scene.add(points);

const orbs = new THREE.Group();
for(let i=0;i<12;i++){
  const g = new THREE.SphereGeometry(0.15 + Math.random()*0.25, 24, 24);
  const m = new THREE.MeshStandardMaterial({emissive: new THREE.Color().setHSL(Math.random(), 0.8, 0.5), emissiveIntensity: 1, metalness: 0.1, roughness: 0.3});
  const orb = new THREE.Mesh(g, m);
  orb.position.set((Math.random()-0.5)*12, (Math.random()-0.5)*7, (Math.random()-0.5)*-6);
  orbs.add(orb);
}
scene.add(orbs);

// 3D coin in offscreen canvas
const coinCanvas = document.createElement('canvas');
coinCanvas.width = 600; coinCanvas.height = 600;
const coinRenderer = new THREE.WebGLRenderer({canvas: coinCanvas, alpha:true, antialias:true});
coinRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
coinRenderer.setSize(600, 600);
const coinScene = new THREE.Scene();
const coinCam = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
coinCam.position.set(0,0,6);
coinScene.add(new THREE.AmbientLight(0xffffff, 0.8));
const coinLight = new THREE.DirectionalLight(0xffffff, 1.2);
coinLight.position.set(3,4,5); coinScene.add(coinLight);

const coinGroup = new THREE.Group();
const coinBody = new THREE.CylinderGeometry(1.8, 1.8, 0.35, 96, 1, true);
const coinMat = new THREE.MeshStandardMaterial({color: 0xffc94a, metalness: 0.8, roughness: 0.25});
coinGroup.add(new THREE.Mesh(coinBody, coinMat));
const coinCapsMat = new THREE.MeshStandardMaterial({color: 0xffe28a, metalness: 0.9, roughness: 0.2});
const cap1 = new THREE.CircleGeometry(1.8, 96);
const cap2 = new THREE.CircleGeometry(1.8, 96);
const capMesh1 = new THREE.Mesh(cap1, coinCapsMat); capMesh1.rotation.x = -Math.PI/2; capMesh1.position.y = 0.175;
const capMesh2 = new THREE.Mesh(cap2, coinCapsMat); capMesh2.rotation.x = Math.PI/2; capMesh2.position.y = -0.175;
coinGroup.add(capMesh1, capMesh2);

const texCanvas = document.createElement('canvas');
texCanvas.width = 512; texCanvas.height = 512;
const ctx = texCanvas.getContext('2d');
ctx.fillStyle = '#fff3cc'; ctx.fillRect(0,0,512,512);
ctx.fillStyle = '#ffcf5f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
ctx.font = 'bold 220px Poppins, Arial'; ctx.fillText('ZOO', 256, 256);
const letterTex = new THREE.CanvasTexture(texCanvas); letterTex.anisotropy = 8;
const capMatWithMap = new THREE.MeshStandardMaterial({map: letterTex, metalness: 0.9, roughness: 0.2});
const capMesh1Map = new THREE.Mesh(new THREE.CircleGeometry(1.76, 96), capMatWithMap);
capMesh1Map.rotation.x = -Math.PI/2; capMesh1Map.position.y = 0.181;
const capMesh2Map = new THREE.Mesh(new THREE.CircleGeometry(1.76, 96), capMatWithMap);
capMesh2Map.rotation.x = Math.PI/2; capMesh2Map.position.y = -0.181;
coinGroup.add(capMesh1Map, capMesh2Map);
coinScene.add(coinGroup);
document.getElementById('coin3d').appendChild(coinCanvas);

const clock = new THREE.Clock();
function animate(){
  const t = clock.getElapsedTime();
  points.rotation.y = t*0.04;
  pMat.color = new THREE.Color().setHSL((t*0.07)%1, 0.8, 0.6);
  orbs.children.forEach((o,i)=>{ o.position.y += Math.sin(t + i)*0.0025; });
  coinGroup.rotation.x = Math.sin(t*0.7)*0.25;
  coinGroup.rotation.y = t*0.8;
  renderer.render(scene, camera);
  coinRenderer.render(coinScene, coinCam);
  requestAnimationFrame(animate);
}
animate();

addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let targetX = 0, targetY = 0;
addEventListener('mousemove', (e)=>{
  const x = (e.clientX/innerWidth - 0.5)*2;
  const y = (e.clientY/innerHeight - 0.5)*2;
  targetX = x*0.6; targetY = -y*0.4;
});
(function parallax(){
  camera.position.x += (targetX - camera.position.x)*0.05;
  camera.position.y += (targetY - camera.position.y)*0.05;
  requestAnimationFrame(parallax);
})();

const end = new Date(Date.now() + 21*24*60*60*1000);
const pad = n => n.toString().padStart(2,'0');
function tick(){
  const now = new Date();
  let sec = Math.max(0, Math.floor((end - now)/1000));
  const d = Math.floor(sec/86400); sec -= d*86400;
  const h = Math.floor(sec/3600); sec -= h*3600;
  const m = Math.floor(sec/60); sec -= m*60;
  document.getElementById('d').textContent = pad(d);
  document.getElementById('h').textContent = pad(h);
  document.getElementById('m').textContent = pad(m);
  document.getElementById('s').textContent = pad(sec);
}
setInterval(tick, 1000); tick();

document.querySelectorAll('.card-3d').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const cx = x / r.width - 0.5;
    const cy = y / r.height - 0.5;
    card.style.transform = `rotateX(${ -cy * 8 }deg) rotateY(${ cx * 10 }deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});
