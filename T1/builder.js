import * as THREE from    '../build/three.module.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer,
        initCamera,
        initDefaultBasicLight,
        InfoBox,
        onWindowResize } from "../libs/util/util.js";

import Conf from './core/conf.js';
import WorkSpace from './core/workspace.js';
import BuilderBlockRenderer from './builder/builderblockrender.js';
import NavigateBlock from './builder/navigateblock.js';
import BuilderMouseMove from './builder/buildermousemove.js';
import BuilderMenu from './builder/buildermenu.js';
import WorkGrid from './builder/workgrid.js';
import KeyControl from './builder/keycontrol.js'

/**
 * init ThreeJS
 */
const scene = new THREE.Scene();
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

// help screen (auto hides in 5 secs)
let infoBox = new InfoBox();
    infoBox.add("Builder -> T to show/hide");
    infoBox.addParagraph();
    infoBox.add("Use mouse to interact:");
    infoBox.add("* Q/Left button to create a block");
    infoBox.add("* E/Delete button to remove a block");
    infoBox.add("* Middle button to translate (pan)");
    infoBox.add("* Right button to translate (rotate)");
    infoBox.add("* Scroll to zoom in/out."); 
    infoBox.add("* ,/. to select a block."); 
    infoBox.show();

function toggleInfoBox() {
    infoBox.infoBox.style.display = infoBox.infoBox.style.display == '' ? 'none' : '';
}

setTimeout(() => {
    infoBox.infoBox.style.display = 'none';
}, 5000);


/**
 * init Builder
 */

// workspace
const blockRender = new BuilderBlockRenderer(scene);
const workGrid = new WorkGrid(scene, false);
const workspace = new WorkSpace({
    blockRender,
    workGrid,
    camera
}, null, Conf.DEFAULT_BUILDER_SIZE);

// navigation block
const navigate = new NavigateBlock(scene, workspace);
navigate.setPos(workspace.centerPos.x, 0, workspace.centerPos.z);

// menu
const mouseMove = new BuilderMouseMove(camera, navigate, blockRender);
const menu = new BuilderMenu(workspace, mouseMove);
menu.createMenu();


// centers the camera whenever a model is created/loaded
// FIXME: random errors after centering
function centerCamera() {
    const size = workspace.getModelData().getSize();
    const centerX = parseInt(size / 2) * workspace.cubeSize;
    const centerY = parseInt(size / 2) * workspace.cubeSize;
    orbit.target.set(centerX, 0, centerY);

    camera.position.x = centerX;
    camera.position.z = 25 + centerY;
    camera.position.y = 20;
}
workspace.setOnLoad(() => {
    centerCamera();
});
centerCamera();



/**
 * init mouse and keyboard
 */
mouseMove.register();

KeyControl.init(workspace, navigate, mouseMove, toggleInfoBox);

window.addEventListener('click', (event) => {
    const pos = mouseMove.getAddPos();
    if (pos) {
        workspace.set(workspace.selectedBlock, pos);
        mouseMove.clearPos();
    }
}, false);




/**
 * main loop
 */
render();
function render()
{
    requestAnimationFrame(render);

    KeyControl.keyboardUpdate();
    mouseMove.update(workspace);

    renderer.render(scene, camera);
}
