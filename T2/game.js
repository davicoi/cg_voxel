import * as THREE from    '../../build/three.module.js';
import Core from './core/core.js';
import MouseMove from './core/mousemove.js';
import KeyControl from './core/keycontrol.js'
import PreviewBlock from './core/previewblock.js';
import MapGenerator from './core/mapgenerator.js';
import FloatingBox from './other/floatingbox.js';
import Conf from './core/conf.js';
import Tool from './core/tool.js';
import { createMenu } from './core/menu.js';




/**
 * init Builder
 */
const core = new Core(Conf.DEFAULT_SIZE, 0, 25, 35, true, 0xc0c0c0);

const centerPos = core.mapData.getSize() / 2 * Conf.CUBE_SIZE;
core.camControl.initFirstPerson(centerPos, 8, centerPos);
core.camControl.initOrbit(centerPos, 25, 35 + centerPos);
core.camControl.initCursor();


// three js
const camera = core.camera;

// workspace
const workspace = core.workspace;

// navigation block
const navigate = new PreviewBlock(core.scene, workspace);
navigate.setPos(workspace.centerPos.x, 0, workspace.centerPos.z);

// menu
const mouseMove = new MouseMove(camera, navigate, core.blockRender);


// centers the camera whenever a model is created/loaded
// FIXME: random errors after centering
function centerCamera() {
    const size = core.mapData.getSize();
    const centerX = parseInt(size / 2) * Conf.CUBE_SIZE;
    const centerZ = parseInt(size / 2) * Conf.CUBE_SIZE;
    const centerY = core.mapData.firstEmptyFrom(centerX, centerZ) * Conf.CUBE_SIZE;

    if (core.camControl.isOrbit()) {
        core.camControl.setTarget(centerX, 0, centerZ);
        core.camControl.setPosition(centerX, 15, 50);
        core.camControl.update();


    } else {
        core.camControl.setPosition(centerX, centerY, centerZ);
    }

}

workspace.setOnLoad(() => {
//    core.camControl.centerCamera();
    centerCamera();
});


/**
 * init mouse and keyboard
 */
mouseMove.register();

KeyControl.init(navigate, mouseMove, null);

// disasble text selection and context menu
document.oncontextmenu = document.body.oncontextmenu = () => { return false; }
document.onselectstart = () => { return false; }

// left click
window.addEventListener('click', (event) => {
    if (core.camControl.isFirstPerson() && !core.camControl.isLocked()) {
        core.camControl.lock();
        return;
    }

    // TODO: add block
    // const pos = mouseMove.getAddPos();
    // if ((!core.camControl.isFirstPerson() || core.camControl.isLocked()) && pos) {
    //     workspace.set(Tool.getInstance().getActive(), pos);
    //     mouseMove.clearPos();
    // }
}, false);

// right click
window.addEventListener("mousedown", event => {
    if (event.button == 2) {   // right click for mouse
        event.preventDefault();
        event.stopPropagation();
        KeyControl.setJump(true);
    }
});
window.addEventListener("mouseup", event => {
    if (event.button == 2) {   // right click for mouse
        event.preventDefault();
        event.stopPropagation();
        KeyControl.setJump(false);
    }
});


let oldScreenX = 0;
let oldScreenY = 0;
function mouseMoveEvent(event) {
    if (!core.camControl.isFirstPerson())
        return;

    const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    // const deltaX = event.screenX - oldScreenX;
    // const deltaY = event.screenY - oldScreenY;
    // oldScreenX = event.screenX;
    // oldScreenY = event.screenY;
    core.camControl.firstPerson.onMouseMove(deltaX, deltaY);
    
    // console.log(`Delta X/Y: ${deltaX}, ${deltaY}<br/>Client X/Y: ${event.clientX}, ${event.clientY}`);
}

function mouseScrolllEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    core.camControl.firstPerson.addDistance(event.wheelDeltaY < 0 ? 0.5 : -0.5);
}

document.addEventListener("mousemove", mouseMoveEvent);
document.addEventListener("wheel", mouseScrolllEvent);

document.addEventListener('keydown', function(event) {
    if (event.key === 'h' || event.key === 'H') {
        event.preventDefault();
        event.stopPropagation();
    }
});


function createFPSBox() {
    const info = new FloatingBox('info');

    let lastFrame = 0;
    setInterval(() => {
        const fps = core.renderer.info.render.frame - lastFrame;
        lastFrame = core.renderer.info.render.frame;

        let camPos = "";
        // if (core.playerModel && core.playerModel.loaded()) {
        //     const position = core.playerModel.obj.position;
        //     camPos = `p: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`;
        //     const pos = Position.createFromArray(core.playerModel.obj.position);
        //     const col = BlockCollision.checkBlockCollision(core.playerModel.obj.position.x, core.playerModel.obj.position.y, core.playerModel.obj.position.z) ? 'Y' : 'N';
        //     camPos += `<br/>b: ${pos.x}, ${pos.y}, ${pos.z} (collision: ${col})\n`;
        // } else if (core.camControl.active && core.camControl.active.position)
        //     camPos = `c: ${core.camControl.active.position.x}, ${core.camControl.active.position.y}, ${core.camControl.active.position.z}`;
        // else
        //     camPos = `o: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`;
    
        info.setText(`FPS: ${fps}<br/>Calls: ${core.renderer.info.render.calls}<br/>Triangles: ${core.renderer.info.render.triangles}<br/>${camPos}`);
    }, 1000);

    return info;
}



/**
 * main loop
 */
function render()
{
    const delta = core.clock.getDelta();
    requestAnimationFrame(render);

    KeyControl.keyboardUpdate();
    mouseMove.update(workspace);

    core.camControl.updateKeys(core.keyboard, delta);
    core.camControl.update(delta);
    core.blockRender.update(delta);

    if (core.playerModel?.loaded()) {
        core.playerModel.updateKeys(core.keyboard, delta);
    }

    core.characterList.forEach(
        character => character.update(delta)
    );

    window.core = core;

    core.lightControl.updatePosition();
    core.renderer.render(core.scene, camera);
}



async function main() {
    await core.blockModels.loadAll();

    core.blockRender.setOptimizeBlocks(true);
    core.blockRender.setOptimizeSides(true);
    core.chunkSystem.setEnable(true);
    core.chunkSystem.setChunkCount(Conf.DEFAULT_CHUNK_COUNT);
    core.fog.enableFogSystem(Conf.FOG);


    createFPSBox();
    createMenu();

    // FIXME: load befora init
    await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            if (core.playerModel && core.playerModel.loaded()) {
                clearInterval(interval);
                resolve(true);
            }
        }, 50);
    });



    let seed = Math.random() * 65535 | 0;
    //MapGenerator.create(workspace.getModelData(), 4, 10, seed);
    //MapGenerator.createByPerc(workspace.getModelData(), 16, seed);
    //workspace.centerPlayer();

    //const ids = [8, 8, 2, 2, 1, 1, 1, 1, 7, 7];
    const ids = [8, 8, 8, 8, 9, 9, 13, 12, 2, 2, 1, 1, 1, 1, 1, 1, 7, 7, 7, 7];
    MapGenerator.createByAlt(workspace.getModelData(), 30, ids.length, ids, seed);;
    workspace.centerPlayer();

    workspace.redraw();
    core.fog.updateDistance();
    core.fog.enableFogSystem(Conf.FOG);

    core.camControl.centralize();

    render();
}
main();
