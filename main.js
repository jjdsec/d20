// -------------------------------------
//          IMPORTS
// -------------------------------------
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js'; // Import the STL Loader

// -------------------------------------
//          INITIALIZATION
// -------------------------------------
const container = document.getElementById('scene-container');
const resultText = document.getElementById('result-text');
const rollButton = document.getElementById('roll-button');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

camera.position.z = 5;

// -------------------------------------
//          LIGHTING
// -------------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 3); // Was 1.2
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// -------------------------------------
//          3D OBJECTS (LOADING THE STL)
// -------------------------------------
let die; // We will define the die variable here, but assign it inside the loader
const loader = new STLLoader();

loader.load(
    'd20.stl', // The path to your STL file
    function (geometry) {
        // This function runs when the file is successfully loaded

        // Center the geometry so it rotates around its middle
        geometry.center();

        // Create a material for the die (no texture this time)
        const material = new THREE.MeshStandardMaterial({
            color: 0x880808, // A nice crimson red
            metalness: 0.8,
            roughness: 0.2,
        });

        // Create the mesh (the actual 3D object)
        die = new THREE.Mesh(geometry, material);

        // Scale the model to a good size for the scene
        die.scale.set(0.1, 0.1, 0.1); // You may need to adjust these values
        
        // Add the die to the scene
        scene.add(die);

        // The die is loaded, so enable the roll button
        rollButton.disabled = false;
        resultText.textContent = "Click to Roll!";

    },
    (xhr) => {
        // This function is called while the file is loading
        const percentLoaded = (xhr.loaded / xhr.total) * 100;
        console.log(percentLoaded + '% loaded');
        resultText.textContent = `Loading ${Math.round(percentLoaded)}%...`;
        rollButton.disabled = true; // Disable button until model is ready
    },
    (error) => {
        // This function is called if there is an error loading the file
        console.error('An error happened', error);
        resultText.textContent = "Error loading model!";
    }
);


// -------------------------------------
//          CONTROLS & INTERACTION
// -------------------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;

let isRolling = false;

rollButton.addEventListener('click', () => {
    if (isRolling || !die) return; // Exit if rolling or if the die hasn't loaded yet

    isRolling = true;
    resultText.textContent = "Rolling...";

    // Pick a random result
    const result = Math.ceil(Math.random() * 20);
    
    // Define a random target rotation
    const targetRotation = new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
    );

    // Animate with GSAP
    gsap.to(die.rotation, {
        x: die.rotation.x + Math.random() * 20 + 15, // Wild tumble
        y: die.rotation.y + Math.random() * 20 + 15, // Wild tumble
        z: die.rotation.z + Math.random() * 20 + 15, // Wild tumble
        duration: 2,
        ease: "power2.in",
        onComplete: () => {
            gsap.to(die.rotation, {
                x: targetRotation.x,
                y: targetRotation.y,
                z: targetRotation.z,
                duration: 0.7,
                ease: "power2.out",
                onComplete: () => {
                    resultText.textContent = result; // Display the number
                    isRolling = false;
                }
            });
        }
    });
});

// -------------------------------------
//          ANIMATION LOOP
// -------------------------------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// -------------------------------------
//          WINDOW RESIZING
// -------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});