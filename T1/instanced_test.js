import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create a cube
let cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
let cube = new THREE.Mesh(cubeGeometry, material);
// position the cube
cube.position.set(0.0, 2.0, 0.0);
// add the cube to the scene
scene.add(cube);

// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("* Left button to rotate");
  controls.add("* Right button to translate (pan)");
  controls.add("* Scroll to zoom in/out.");
  controls.show();







  let stats;

  let mesh;
  //const amount = parseInt( window.location.search.slice( 1 ) ) || 10;
  const amount = 30;
  const count = Math.pow( amount, 3 );
  console.log (count + " cubes");

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2( 1, 1 );

  const color = new THREE.Color();
  const white = new THREE.Color().setHex( 0xffffff );


  const geometry = new THREE.IcosahedronGeometry( 0.5, 3 );
  //const material = new THREE.MeshPhongMaterial( { color: 0xffffff } );









import InstancedMeshEx from "./core/instancemanager.js";


  //mesh = new THREE.InstancedMesh( geometry, material, count );
  // mesh = new THREE.InstancedMesh( geometry, material, 1000);
  // mesh.count = 0;
  // scene.add( mesh );

  const manager = new InstancedMeshEx(geometry, material, scene);

  //console.log(mesh.count)

  let i = 0;
  const offset = ( amount - 1 ) / 2;

  const matrix = new THREE.Matrix4();

  for ( let x = 0; x < amount; x ++ ) {

    for ( let y = 0; y < amount; y ++ ) {

      for ( let z = 0; z < amount; z ++ ) {
        // matrix.setPosition( offset - x, offset - y, offset - z );
        manager.add({x: offset - x, y: offset - y, z: offset - z}, i);
        // mesh = manager.getMesh();

        // matrix.setPosition( offset - x, offset - y, offset - z );
        // mesh.count = 30;

        // mesh.setMatrixAt( i, matrix );

        //color.setHex( Math.random() * 0xffffff );
        //mesh.setColorAt( i, color );

        i ++;

      }

    }
  }

  setInterval(() => {
    for (let i = 0 ; i < 250 ; i++) {
      // mesh = manager.list[Math.random() * manager.list.length | 0];
      // if (mesh.count > 0)
      //   manager.removeByIdx(mesh, Math.random() * mesh.count | 0);
      manager.remove(Math.random() * count | 0);
    }
  }, 500);

  console.log (manager.list.length + " instancedMeshes");



















render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}