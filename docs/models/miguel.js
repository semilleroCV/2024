

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

let scene, camera, renderer;

function init(filename) {



const container = document.getElementById('canvas');


scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

camera = new THREE.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 1, 5000);
camera.rotation.y = 45/180*Math.PI;
camera.position.x = 800;
camera.position.y = 100;
camera.position.z = 1000;

var hlight = new THREE.AmbientLight (0x404040, 1);
console.log(hlight)
scene.add(hlight);

//Adding directional lights
var directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(0,1,1);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xff9000, 3)
scene.add(pointLight)
pointLight.position.set(1, 0, -0.7)

const pointLight2 = new THREE.PointLight(0xffffff, 2)
scene.add(pointLight2)
pointLight2.position.set(1, 0, 1.3)



var box = container.getBoundingClientRect();
console.log(box.width, box.height);

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth * 0.5 ,  window.innerHeight * 0.5);
renderer.toneMapping = THREE.ACESFilmicToneMapping 

console.log(container)


//set pos camera
camera.position.set(0, 0, 2.6); // Adjust x, y, z as needed

// Orient the camera to look at the origin of the scene

camera.aspect = window.innerWidth / window.innerHeight;

camera.updateProjectionMatrix()


function render() {

renderer.render( scene, camera );

}

// set renderer to 50% of window width/height, set the style
container.appendChild(renderer.domElement);


const controls = new OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render ); // use if there is no animation loop
controls.minDistance = 1;
controls.maxDistance = 2;
controls.autoRotate = true;
controls.target.set( 0, 0, 1 );
controls.update();
window.addEventListener( 'resize', onWindowResize );



let loader = new GLTFLoader();
loader.load(filename, async function(gltf){
//Reduce the Car size by half
const model = gltf.scene;

await renderer.compileAsync( model, camera, scene );

model.position.set(-0.3, -0.3, 1.3);

scene.add( model );

render();
});
      
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

render();

function onWindowResize() {

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();


renderer.setSize( window.innerWidth * 0.5, window.innerHeight * 0.5 );

render();

}



}


    
    
  


init('raw/miguel.glb');
