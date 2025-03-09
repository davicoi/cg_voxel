import * as THREE from    '../build/three.module.js';
import {ARjs}    from  '../libs/AR/ar.js';
import { initAR,
         createSourceChangerInterface} from "../libs/util/utilAR.js"
import {initDefaultSpotlight,
        initRenderer} from "../libs/util/util.js";
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';



let scene, camera, renderer;
renderer = initRenderer();
   renderer.setClearColor(new THREE.Color('lightgrey'), 0)
   renderer.antialias = true;
scene	= new THREE.Scene();
camera = new THREE.Camera();
   scene.add(camera);
initDefaultSpotlight(scene, new THREE.Vector3(25, 30, 20), 4000); // Use default light


let ravModel = null;
let ravObj = null;


function modelLoader() {
   const loader = new GLTFLoader();
   loader.load('./assets/models/rav.glb', (gltf) => {
      /** @type {THREE.Object3D} */
      const obj = gltf.scene;
      const objScale = 0.05;
      obj.scale.set(objScale, objScale, objScale);
      obj.position.set(-0.58, objScale, -0.58);
      obj.traverse((child) => {
         child.castShadow = true;
      });

      ravModel = gltf;
      ravObj = obj;
      scene.add(obj);
      obj
      console.info(`Model "rav.glb" loaded`);

   }, undefined, (err) => {
      console.error(err);
   });
}
modelLoader();


//----------------------------------------------------------------------------
// Set AR Stuff
let AR = {
   source: null,
   context: null,
}
initAR(AR, renderer, camera);
setARStuff();
createSourceChangerInterface('./assets/AR/kanjiScene.jpg', './assets/AR/kanjiScene.mp4', 'image')
render();

function render()
{
   updateAR();      
   requestAnimationFrame(render);
   renderer.render(scene, camera) // Render scene
}

function updateAR()
{
	if( AR.source.ready === false )	return
	AR.context.update( AR.source.domElement )
	scene.visible = camera.visible   
}



function setARStuff()
{
   //----------------------------------------------------------------------------
   // initialize arToolkitContext
   AR.context = new ARjs.Context({
      cameraParametersUrl: '../libs/AR/data/camera_para.dat',
      detectionMode: 'mono',
   })

   // initialize it
   AR.context.init(function onCompleted(){
      camera.projectionMatrix.copy( AR.context.getProjectionMatrix() );
   })

   //----------------------------------------------------------------------------
   // Create a ArMarkerControls
   let markerControls;
   markerControls = new ARjs.MarkerControls(AR.context, camera, {	
      type : 'pattern',
      patternUrl : '../libs/AR/data/patt.kanji',
      changeMatrixMode: 'cameraTransformMatrix' 
   })
   // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
   scene.visible = false
}