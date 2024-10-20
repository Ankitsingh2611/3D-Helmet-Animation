import './style.css';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from 'gsap';
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();

//scene
const scene = new THREE.Scene();
//camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

//hdri loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
//  scene.background = texture;
  scene.environment = texture;
});

//gltf loader
const loader = new GLTFLoader();
let model;

loader.load('./DamagedHelmet.gltf', (gltf) => {
  model = gltf.scene;
  scene.add(model);
  
  // Adjust model position if needed
  model.position.set(0, 0, 0);
  
  // Adjust model scale if needed
  model.scale.set(1, 1, 1);
}, undefined, (error) => {
  console.error('An error occurred while loading the GLTF model:', error);
});

//renderer
const renderer = new THREE.WebGLRenderer({
   canvas: document.querySelector('#canvas'),
   antialias: true,
   alpha: true,
   });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

//orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0015;
composer.addPass(rgbShiftPass);



window.addEventListener("mousemove", (e) => {
 if(model){
  const rotationX = (e.clientX / window.innerWidth - 0.5) * Math.PI;
  const rotationY = (e.clientY / window.innerHeight - 0.5) * Math.PI;
  gsap.to(model.rotation, {
    x: rotationY,
    y: rotationX,
    duration: 0.9,
    ease: "power2.out"
  });
 }
});

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  composer.setSize(window.innerWidth, window.innerHeight);
});
//render
function animate() {
  window.requestAnimationFrame(animate);
  if (model) {
    model.rotation.y += 0.001;
  }
 // controls.update();
  composer.render();
}
animate();