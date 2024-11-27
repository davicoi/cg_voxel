import * as THREE from    '../build/three.module.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer,
        initCamera,
        initDefaultBasicLight,
        onWindowResize } from "../libs/util/util.js";

import Conf from './core/conf.js';
import WorkSpace from './core/workspace.js';
import BlockRenderer from './core/blockrenderer.js';
import BuilderMouseMove from './builder/buildermousemove.js';
import WorkGrid from './builder/workgrid.js';
import KeyControl from './builder/keycontrol.js'
import PreviewBlock from './core/previewblock.js';
import MapGenerator from './core/mapgenerator.js';
import FloatingBox from './other/floatingbox.js';

/**
 * init ThreeJS
 */
const scene = new THREE.Scene();
/** @type {THREE.WebGLRenderer}; */
const renderer = initRenderer('rgb(150,150,150)');
const light = initDefaultBasicLight(scene);

const camera = initCamera(new THREE.Vector3(0, 25, 35));
const orbit = new OrbitControls( camera, renderer.domElement );

// change Orbit mouse control, LEFT click is used to add blocks
orbit.mouseButtons = {
    LEFT: '',
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE
};

// Listen window size changes
window.addEventListener('resize', function() {
    onWindowResize(camera, renderer)
}, false);




/**
 * init Builder
 */

// workspace
const blockRender = new BlockRenderer(scene);
const workGrid = new WorkGrid(scene, false);
const workspace = new WorkSpace({
    blockRender,
    workGrid,
    camera
}, null, Conf.DEFAULT_SIZE);

// navigation block
const navigate = new PreviewBlock(scene, workspace);
navigate.setPos(workspace.centerPos.x, 0, workspace.centerPos.z);

// menu
const mouseMove = new BuilderMouseMove(camera, navigate, blockRender);


// centers the camera whenever a model is created/loaded
// FIXME: random errors after centering
function centerCamera() {
    const size = workspace.getModelData().getSize();
    const centerX = parseInt(size / 2) * workspace.cubeSize;
    const centerY = parseInt(size / 2) * workspace.cubeSize;
    orbit.target.set(centerX, 0, centerY);

    camera.position.x = centerX;
    camera.position.z = 75 + centerY;
    camera.position.y = 50;
}
workspace.setOnLoad(() => {
    centerCamera();
});
centerCamera();



/**
 * init mouse and keyboard
 */
mouseMove.register();

KeyControl.init(workspace, navigate, mouseMove, null);

window.addEventListener('click', (event) => {
    const pos = mouseMove.getAddPos();
    if (pos) {
        workspace.set(workspace.selectedBlock, pos);
        mouseMove.clearPos();
    }
}, false);


let seed = Math.random() * 65535 | 0;
// 23772, 26457, 48459, 31045, 22946
//seed = 22946;
MapGenerator.create(workspace.getModelData().getSize(), 3, 15, seed);



const info = new FloatingBox('info');

let lastFrame = 0;
setInterval(() => {
    const fps = renderer.info.render.frame - lastFrame;
    lastFrame = renderer.info.render.frame;
    info.setText(`FPS: ${fps}<br/>Calls: ${renderer.info.render.calls}<br/>Triangles: ${renderer.info.render.triangles}`);
}, 1000);

/**
 * main loop
 */
render();
function render()
{
    requestAnimationFrame(render);

    KeyControl.keyboardUpdate();
    mouseMove.update(workspace);

    //console.log(renderer.info.render.calls);
    //console.log(renderer.info.render.triangles);
//    console.log(renderer.info.render.frame);


    renderer.render(scene, camera);
}
