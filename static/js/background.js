/**
 * background.js - Three.js Particle Morphing
 */
import * as THREE from "https://cdn.skypack.dev/three@0.133.1";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 24;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 파티클 텍스처 생성
const canvas = document.createElement('canvas');
canvas.width = 32; canvas.height = 32;
const context = canvas.getContext('2d');
const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
gradient.addColorStop(0, 'rgba(255,255,255,1)');
gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
gradient.addColorStop(1, 'rgba(255,255,255,0)');
context.fillStyle = gradient;
context.fillRect(0, 0, 32, 32);
const particleTexture = new THREE.CanvasTexture(canvas);

const particleCount = 15000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const targetPositions = new Float32Array(particleCount * 3);

// --- 모핑 형상 데이터 생성 함수군 ---
function createGalaxy() {
    for(let i=0; i<particleCount; i++) {
        const r = 6 * Math.cbrt(Math.random()) + (Math.random() * 2); 
        const theta = Math.random() * 2 * Math.PI, phi = Math.acos(2 * Math.random() - 1);
        targetPositions[i*3] = r * Math.sin(phi) * Math.cos(theta);
        targetPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        targetPositions[i*3+2] = r * Math.cos(phi);
    }
}

function createDNA() {
    const height = 30; // DNA 전체 길이
    const loops = 4; // 꼬임 횟수
    const radius = 2.5; // 나선의 넓이
    const numRungs = 45; // 염기쌍(연결 다리)의 개수

    for(let i=0; i<particleCount; i++) {
        const type = Math.random();
        let x, y, z;

        if (type < 0.75) {
            const t = Math.random(); 
            const angle = t * Math.PI * 2 * loops;
            const yPos = (t - 0.5) * height;
            const strandOffset = type < 0.375 ? 0 : Math.PI; // 가닥 1 또는 2
            
            // 약간의 노이즈를 주어 자연스럽게
            const noiseX = (Math.random() - 0.5) * 0.5;
            const noiseY = (Math.random() - 0.5) * 0.5;
            const noiseZ = (Math.random() - 0.5) * 0.5;
            
            x = Math.cos(angle + strandOffset) * radius + noiseX;
            y = yPos + noiseY;
            z = Math.sin(angle + strandOffset) * radius + noiseZ;
        } else {
            // 25%의 파티클은 나선을 연결하는 다리(Rungs) 형성
            const rungIndex = Math.floor(Math.random() * numRungs);
            const t = rungIndex / numRungs;
            
            const angle = t * Math.PI * 2 * loops;
            const yPos = (t - 0.5) * height;
            
            // 다리 사이의 위치
            const posInRung = (Math.random() * 2) - 1; 
            const noise = (Math.random() - 0.5) * 0.2;
            
            x = Math.cos(angle) * (radius * posInRung) + noise;
            y = yPos + noise;
            z = Math.sin(angle) * (radius * posInRung) + noise;
        }
        targetPositions[i*3] = x;
        targetPositions[i*3 + 1] = y;
        targetPositions[i*3 + 2] = z;
    }
}


function createWave() {
    const side = Math.ceil(Math.sqrt(particleCount));
    for(let i=0; i<particleCount; i++) {
        const x = ((i % side) / side) * 24 - 12, z = (Math.floor(i / side) / side) * 24 - 12;
        const y = Math.sin(x * 0.5) * 2 + Math.cos(z * 0.5) * 2;
        const noise = (Math.random() - 0.5) * 0.5;
        targetPositions[i*3] = x + noise;
        targetPositions[i*3+1] = y + noise;
        targetPositions[i*3+2] = z + noise;
    }
}

function createTorus() {
    const R = 6, r = 2;
    for(let i=0; i<particleCount; i++) {
        const u = Math.random() * Math.PI * 2, v = Math.random() * Math.PI * 2;
        const randR = r * Math.sqrt(Math.random());
        targetPositions[i*3] = (R + randR * Math.cos(v)) * Math.cos(u);
        targetPositions[i*3+1] = randR * Math.sin(v);
        targetPositions[i*3+2] = (R + randR * Math.cos(v)) * Math.sin(u);
    }
}

function createGrid() {
    const side = Math.ceil(Math.cbrt(particleCount));
    const step = 12 / side;
    for(let i=0; i<particleCount; i++) {
        const x = (i % side);
        const y = Math.floor((i / side) % side);
        const z = Math.floor(i / (side * side));
        const noise = (Math.random() - 0.5) * 0.5;
        targetPositions[i*3]     = (x * step - 6) + noise;
        targetPositions[i*3 + 1] = (y * step - 6) + noise;
        targetPositions[i*3 + 2] = (z * step - 6) + noise;
    }
}


// 초기화
createGalaxy();
for(let i=0; i<particleCount*3; i++) positions[i] = targetPositions[i];
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

window.particleMaterial = new THREE.PointsMaterial({
    color: 0x00f2fe, size: 0.15, map: particleTexture,
    transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending 
});

const particleCloud = new THREE.Points(geometry, window.particleMaterial);
scene.add(particleCloud);

// 전역 모핑 트리거 함수 (main.js에서 호출)
let mouseX = 0, mouseY = 0;
let currentShapeIdx = 0;
const spotlights = document.querySelectorAll('.spotlight');

// 🌟 추가할 부분: 목표 크기와 위치를 저장할 변수
let targetScale = 1;
let targetOffsetX = 0;
let targetOffsetY = 0;


window.morphToShape = (idx) => {
    currentShapeIdx = idx;
    targetScale = 1;
    if(idx === 0) createGalaxy();
    else if(idx === 1) createDNA();
    else if(idx === 2) createWave();
    else if(idx === 3) {
            // 🌟 Section 3 진입 시 설정
            // 이전 섹션(Wave)의 모양을 그대로 유지하고 싶다면 createTorus() 대신 createWave()를 쓰시면 됩니다!
            createTorus(); 
            targetScale = 2.5;
        }
    else if(idx === 4) {
        createGrid(); 
        targetScale = 1.7;
    }
};


window.addEventListener('mousemove', e => {
    spotlights.forEach(spot => {
        spot.style.setProperty('--x', e.clientX + 'px');
        spot.style.setProperty('--y', e.clientY + 'px');
    });
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});


function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.0003;
    
    // 각 모양에 맞춘 고유 회전값 설정
    if (currentShapeIdx === 0) { // Galaxy
        particleCloud.rotation.y = time * 0.5;
        particleCloud.rotation.z = time * 0.2;
        particleCloud.rotation.x = 0;
    } else if (currentShapeIdx === 1) { // DNA
        particleCloud.rotation.x = 0.2; // 약간 입체감 있게 앞으로 기울임
        particleCloud.rotation.y = time * 0.3; // 나선이 천천히 회전함
        particleCloud.rotation.z = -Math.PI / 4; // 👈 -45도로 눕혀서 사진처럼 대각선으로 만듦
    } else if (currentShapeIdx === 2) { // Wave
        particleCloud.rotation.y = time * 0.2;
        particleCloud.rotation.x = 0.5;
        particleCloud.rotation.z = 0;
    } else if (currentShapeIdx === 3) { // Torus
        particleCloud.rotation.y = time * 0.3;
        particleCloud.rotation.x = time * 0.2;
        particleCloud.rotation.z = 0;
    } else if (currentShapeIdx === 4) { // Grid
        particleCloud.rotation.y = time * 0.2;
        particleCloud.rotation.x = time * 0.1;
        particleCloud.rotation.z = 0;
    }

    // =========================================================
    // 🌟 [딱 여기 3줄만 추가!] 크기(Scale)가 부드럽게 변하는 애니메이션
    particleCloud.scale.x += (targetScale - particleCloud.scale.x) * 0.05;
    particleCloud.scale.y += (targetScale - particleCloud.scale.y) * 0.05;
    particleCloud.scale.z += (targetScale - particleCloud.scale.z) * 0.05;
    // =========================================================

    // Lerp (선형 보간)을 이용한 파티클 모핑 애니메이션
    const pos = particleCloud.geometry.attributes.position.array;
    let needsUpdate = false;
    for(let i = 0; i < particleCount * 3; i++) {
        const diff = targetPositions[i] - pos[i];
        if(Math.abs(diff) > 0.01) {
            pos[i] += diff * 0.04; // 값이 작을수록 변환이 더 부드러워짐
            needsUpdate = true;
        }
    }
    if(needsUpdate) particleCloud.geometry.attributes.position.needsUpdate = true;


    // 마우스 패럴랙스
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});