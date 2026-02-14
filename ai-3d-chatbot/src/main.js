import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ===== GEMINI =====
const API_KEY = "YOUR_MF_API_KEY"; // ⚠️ chỉ test local
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: "Trả về JSON: { \"text\": \"...\", \"emotion\": \"happy/sad/angry/relaxed/surprised\" }"
});

// ===== THREE SETUP =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.4, 2.0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('app').appendChild(renderer.domElement);

scene.add(new THREE.DirectionalLight(0xffffff, 1.2));
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

// ===== LOAD VRM 0.0 =====
let currentVrm = null;
let avatarState = "idle"; // idle | talking
let currentEmotion = "relaxed";
let oneShotAction = null; // 'jump' | 'dance' | 'surprised'
let actionUntil = 0;
let basePose = null;

const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

loader.load('/AI_Assistant_vrm0.vrm', (gltf) => {
  currentVrm = gltf.userData.vrm;
  scene.add(currentVrm.scene);
  currentVrm.scene.rotation.set(0, Math.PI, 0); // nếu quay lưng, đổi 0 <-> Math.PI
  if (currentVrm.lookAt) currentVrm.lookAt.target = camera;

  // Lưu pose gốc để reset sau action
  const hips = currentVrm.humanoid.getBoneNode('hips');
  const lUpper = currentVrm.humanoid.getBoneNode('leftUpperArm');
  const rUpper = currentVrm.humanoid.getBoneNode('rightUpperArm');
  const neck = currentVrm.humanoid.getBoneNode('neck');
  currentVrm.scene.position.y = 0.25;
  basePose = {
    hipsY: hips ? hips.position.y : 0,
    lUpperRot: lUpper ? lUpper.rotation.clone() : null,
    rUpperRot: rUpper ? rUpper.rotation.clone() : null,
    neckRot: neck ? neck.rotation.clone() : null,
  };

  document.getElementById('status').innerText = "Model sẵn sàng!";
}, undefined, (e) => console.error('Load VRM error:', e));

// ===== WEBCAM =====
const video = document.getElementById('webcam-video');
(async function enableWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();
  } catch (e) {
    console.error('Webcam error:', e);
  }
})();

// ===== HELPERS =====
function applyEmotion(vrm, emotion, strength = 0.9) {
  const emotions = ['happy','sad','angry','relaxed','surprised','neutral'];
  emotions.forEach(e => vrm.expressionManager?.setValue(e, 0));
  const map = { happy:'happy', sad:'sad', angry:'angry', relaxed:'neutral', surprised:'surprised' };
  vrm.expressionManager?.setValue(map[emotion] || 'neutral', strength);
}

function idleMotion(vrm, t) {
  const spine = vrm.humanoid.getBoneNode('spine');
  const chest = vrm.humanoid.getBoneNode('chest');
  const neck  = vrm.humanoid.getBoneNode('neck');
  if (spine) spine.rotation.x = Math.sin(t * 1.2) * 0.02;
  if (chest) chest.rotation.x = Math.sin(t * 1.2) * 0.01;
  if (neck)  neck.rotation.y = Math.sin(t * 0.6) * 0.05;
}

function talkingMotion(vrm, t) {
  vrm.expressionManager?.setValue('aa', Math.sin(t * 14) * 0.45 + 0.45);
  const neck = vrm.humanoid.getBoneNode('neck');
  if (neck) neck.rotation.x = Math.sin(t * 3) * 0.05;
  const lUpper = vrm.humanoid.getBoneNode('leftUpperArm');
  const rUpper = vrm.humanoid.getBoneNode('rightUpperArm');
  const gesture = Math.sin(t * 4) * 0.05;
  if (lUpper) lUpper.rotation.x = 0.15 + gesture;
  if (rUpper) rUpper.rotation.x = 0.15 - gesture;
}

function jumpMotion(vrm, t, startTime) {
  const hips = vrm.humanoid.getBoneNode('hips');
  if (!hips || !basePose) return;
  const duration = 900;
  const p = Math.min(1, (performance.now() - startTime) / duration);
  const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const height = Math.sin(ease * Math.PI) * 0.12;
  hips.position.y = basePose.hipsY + height;
  if (p >= 1) hips.position.y = basePose.hipsY;
}

function danceMotion(vrm, t) {
  const hips = vrm.humanoid.getBoneNode('hips');
  const spine = vrm.humanoid.getBoneNode('spine');
  const neck = vrm.humanoid.getBoneNode('neck');
  if (hips) hips.rotation.y = Math.sin(t * 6) * 0.4;
  if (spine) spine.rotation.x = Math.sin(t * 5) * 0.15;
  if (neck) neck.rotation.z = Math.sin(t * 8) * 0.2;
}

function surprisedMotion(vrm, t, startTime) {
  if (!basePose) return;
  const lUpper = vrm.humanoid.getBoneNode('leftUpperArm');
  const rUpper = vrm.humanoid.getBoneNode('rightUpperArm');
  const neck = vrm.humanoid.getBoneNode('neck');
  const duration = 800;
  const p = Math.min(1, (performance.now() - startTime) / duration);
  const raise = Math.sin(p * Math.PI) * 0.8;

  if (lUpper && basePose.lUpperRot) lUpper.rotation.x = basePose.lUpperRot.x - raise;
  if (rUpper && basePose.rUpperRot) rUpper.rotation.x = basePose.rUpperRot.x - raise;
  if (neck && basePose.neckRot) neck.rotation.x = basePose.neckRot.x - Math.sin(p * Math.PI) * 0.25;

  vrm.expressionManager?.setValue('surprised', 1.0);

  if (p >= 1) {
    if (lUpper && basePose.lUpperRot) lUpper.rotation.copy(basePose.lUpperRot);
    if (rUpper && basePose.rUpperRot) rUpper.rotation.copy(basePose.rUpperRot);
    if (neck && basePose.neckRot) neck.rotation.copy(basePose.neckRot);
    vrm.expressionManager?.setValue('surprised', 0);
  }
}

// ===== CONTROLS =====
document.getElementById('controls')?.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn || !currentVrm) return;
  const action = btn.dataset.action;

  if (['happy','sad','angry','relaxed'].includes(action)) {
    currentEmotion = action;
    applyEmotion(currentVrm, action, 1.0);
    avatarState = "idle";
    return;
  }

  if (action === 'surprised') {
    oneShotAction = 'surprised';
    actionUntil = performance.now() + 800;
    return;
  }

  if (action === 'idle') {
    avatarState = "idle";
    applyEmotion(currentVrm, 'relaxed', 0.4);
    oneShotAction = null;
    return;
  }

  if (action === 'jump') {
    oneShotAction = 'jump';
    actionUntil = performance.now() + 900;
  }

  if (action === 'dance') {
    oneShotAction = 'dance';
    actionUntil = performance.now() + 2500;
  }
});

// ===== ANIMATE =====
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const t = clock.elapsedTime;

  if (currentVrm) {
    currentVrm.update(delta);

    // ÉP HẠ TAY SAU UPDATE (fix T-pose)
    const lUpper = currentVrm.humanoid.getBoneNode('leftUpperArm');
    const rUpper = currentVrm.humanoid.getBoneNode('rightUpperArm');
    const lLower = currentVrm.humanoid.getBoneNode('leftLowerArm');
    const rLower = currentVrm.humanoid.getBoneNode('rightLowerArm');
    if (lUpper) lUpper.rotation.z = 1.15;
    if (rUpper) rUpper.rotation.z = -1.15;
    if (lLower) lLower.rotation.x = 0.35;
    if (rLower) rLower.rotation.x = 0.35;

    if (oneShotAction && performance.now() < actionUntil) {
      const startTime =
        oneShotAction === 'jump' ? actionUntil - 900 :
        oneShotAction === 'surprised' ? actionUntil - 800 :
        actionUntil - 2500;

      if (oneShotAction === 'jump') jumpMotion(currentVrm, t, startTime);
      if (oneShotAction === 'dance') danceMotion(currentVrm, t);
      if (oneShotAction === 'surprised') surprisedMotion(currentVrm, t, startTime);
    } else {
      oneShotAction = null;
      if (avatarState === "idle") {
        idleMotion(currentVrm, t);
        currentVrm.expressionManager?.setValue('aa', 0);
      } else if (avatarState === "talking") {
        talkingMotion(currentVrm, t);
      }
    }
  }

  renderer.render(scene, camera);
}
animate();

// ===== CHAT =====
async function handleChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentVrm) return;

  document.getElementById('status').innerText = "Đang suy nghĩ...";
  input.disabled = true;

  try {
    const result = await model.generateContent(text);
    const raw = await result.response.text();
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

    currentEmotion = json.emotion || 'relaxed';
    applyEmotion(currentVrm, currentEmotion, 0.9);

    const ut = new SpeechSynthesisUtterance(json.text);
    ut.lang = 'en-US'; 

    ut.pitch = 1.8;  
    ut.rate = 1.25;

    ut.onstart = () => { avatarState = "talking"; };
    ut.onend   = () => {
      avatarState = "idle";
      applyEmotion(currentVrm, 'relaxed', 0.4);
    };

    speechSynthesis.speak(ut);
    input.value = "";
  } catch (e) {
    console.error(e);
    document.getElementById('status').innerText = "Lỗi chat (xem console)";
  } finally {
    input.disabled = false;
    document.getElementById('status').innerText = "Sẵn sàng!";
  }
}

document.getElementById('sendBtn').onclick = handleChat;
document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleChat();
});

// ===== RESIZE =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});