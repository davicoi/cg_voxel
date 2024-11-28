import Core from './core/core.js';
import MouseMove from './core/mousemove.js';
import WorkGrid from './builder/workgrid.js';
import KeyControl from './builder/keycontrol.js'
import PreviewBlock from './core/previewblock.js';
import MapGenerator from './core/mapgenerator.js';
import FloatingBox from './other/floatingbox.js';
import Conf from './core/conf.js';




/**
 * init Builder
 */
const core = new Core(Conf.DEFAULT_SIZE);

// three js
const camera = core.camera;
const orbit = core.orbit;

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
    const size = workspace.getModelData().getSize();
    const centerX = parseInt(size / 2) * Conf.CUBE_SIZE;
    const centerZ = parseInt(size / 2) * Conf.CUBE_SIZE;
    const centerY = core.model.firstEmptyFrom(centerX, centerZ) * Conf.CUBE_SIZE;

    orbit.target.set(centerX, 0, centerZ);

    camera.position.x = centerX;
    camera.position.z = 75 + centerZ;
    camera.position.y = 50 + centerY;
}
workspace.setOnLoad(() => {
    centerCamera();
});


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



function createFPSBox() {
    const info = new FloatingBox('info');

    let lastFrame = 0;
    setInterval(() => {
        const fps = core.renderer.info.render.frame - lastFrame;
        lastFrame = core.renderer.info.render.frame;
        info.setText(`FPS: ${fps}<br/>Calls: ${core.renderer.info.render.calls}<br/>Triangles: ${core.renderer.info.render.triangles}`);
    }, 1000);

    return info;
}

/**
 * main loop
 */
function render()
{
    requestAnimationFrame(render);

    KeyControl.keyboardUpdate();
    mouseMove.update(workspace);

    core.renderer.render(core.scene, camera);
}


async function main() {
    await core.blockModels.loadAll();
    createFPSBox();

    let seed = Math.random() * 65535 | 0;
//    MapGenerator.create(workspace.getModelData(), 3, 15, seed);
    MapGenerator.createByPerc(workspace.getModelData(), 16, seed);

    centerCamera();

    render();
}
main();
