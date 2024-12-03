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
const core = new Core(Conf.DEFAULT_SIZE, 0, 25, 35, true);

const centerPos = core.mapData.getSize() / 2 * Conf.CUBE_SIZE;
core.camControl.initFirstPerson(centerPos, 8, centerPos);
core.camControl.initOrbit(centerPos, 25, 35 + centerPos);


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

window.addEventListener('click', (event) => {
    if (core.camControl.isFirstPerson() && !core.camControl.isLocked()) {
        core.camControl.lock();
        return;
    }

    const pos = mouseMove.getAddPos();
    if ((!core.camControl.isFirstPerson() || core.camControl.isLocked()) && pos) {
        workspace.set(Tool.getInstance().getActive(), pos);
        mouseMove.clearPos();
    }
}, false);



function createFPSBox() {
    const info = new FloatingBox('info');

    let lastFrame = 0;
    setInterval(() => {
        const fps = core.renderer.info.render.frame - lastFrame;
        lastFrame = core.renderer.info.render.frame;

        let camPos;
        if (core.camControl.active && core.camControl.active.position)
            camPos = `c: ${core.camControl.active.position.x}, ${core.camControl.active.position.y}, ${core.camControl.active.position.z}`;
        else
            camPos = `o: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`;
    
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

    core.renderer.render(core.scene, camera);
}


async function main() {
    await core.blockModels.loadAll();

    //core.chunkSystem.setChunkCount(Conf.DEFAULT_CHUNK_COUNT);
    core.chunkSystem.setEnable(true);
    core.chunkSystem.setChunkCount(2);

    core.blockRender.optimizeBlocks = true;
    core.blockRender.optimizeSides = true;

    createFPSBox();
    createMenu();

    let seed = Math.random() * 65535 | 0;
    //MapGenerator.create(workspace.getModelData(), 4, 10, seed);
    //MapGenerator.createByPerc(workspace.getModelData(), 16, seed);

    const ids = [8, 8, 2, 2, 1, 1, 1, 1, 7, 7];
    MapGenerator.createByAlt(workspace.getModelData(), 30, 10, ids, seed);;

    workspace.redraw();

    core.camControl.center();

    render();
}
main();
