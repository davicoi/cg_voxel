import * as THREE from    '../../build/three.module.js';
import Core from './core/core.js';
import MouseMove from './core/mousemove.js';
import KeyControl from './core/keycontrol.js'
import PreviewBlock from './core/previewblock.js';
import MapGenerator from './core/mapgenerator.js';
import FloatingBox from './other/floatingbox.js';
import Conf from './core/conf.js';




/**
 * init Builder
 */
const core = new Core(Conf.DEFAULT_SIZE, 0, 25, 35, true);

const centerPos = core.mapData.getSize() / 2 * Conf.CUBE_SIZE;
core.camControl.initPointerLock(centerPos, 8, centerPos);
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
    const pos = mouseMove.getAddPos();
    if ((!core.camControl.isPointerLock() || core.camControl.pointerLock.isLocked) && pos) {
        workspace.set(workspace.selectedBlock, pos);
        mouseMove.clearPos();
    }

    if (core.camControl.isPointerLock())
        core.camControl.pointerLock.lock();
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
    core.camControl.updateKeys(core.keyboard);
    mouseMove.update(workspace);

    core.camControl.updateControl(delta);

    core.blockRender.update(delta);

    core.renderer.render(core.scene, camera);
}


async function main() {
    await core.blockModels.loadAll();
    createFPSBox();

    let seed = Math.random() * 65535 | 0;
    //MapGenerator.create(workspace.getModelData(), 4, 10, seed);
    MapGenerator.createByPerc(workspace.getModelData(), 16, seed);

    core.blockRender.enableChunk(true);
    workspace.redraw();

    core.camControl.centerCamera();

    render();
}
main();
