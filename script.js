import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Setup Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// 2. Add Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(pointLight, ambientLight);

// 3. Add Geometric Objects
// A Torus (donut shape)
const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff, wireframe: true });
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
scene.add(torus);

// A simple Box
const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(20, 0, -15);
scene.add(box);

// 4. Add Stars for background
function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
    star.position.set(x, y, z);
    scene.add(star);
}
Array(200).fill().forEach(addStar);

// 5. Add a background texture (Space)
const spaceTexture = new THREE.TextureLoader().load('https://www.solarsystemscope.com/textures/download/2k_stars.jpg');
scene.background = spaceTexture;

// 6. Camera Controls (to "move" in the scene)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Makes the movement smoother

// 7. Scroll Animation
function moveCamera() {
    const t = document.body.getBoundingClientRect().top;
    
    // Rotate objects on scroll
    torus.rotation.x += 0.05;
    torus.rotation.y += 0.075;
    box.rotation.y += 0.05;

    // Move camera on scroll
    camera.position.z = t * -0.01 + 30;
    camera.position.x = t * -0.0002;
    camera.position.y = t * -0.0002;
}
document.body.onscroll = moveCamera;

// 8. Animation Loop (runs on every frame)
function animate() {
    requestAnimationFrame(animate);

    // Continuous rotation for objects
    torus.rotation.x += 0.001;
    torus.rotation.y += 0.0005;
    box.rotation.x += 0.002;

    // Update controls for smooth damping
    controls.update();

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation
animate();
