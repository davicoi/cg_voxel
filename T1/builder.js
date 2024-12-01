import { InfoBox } from "../libs/util/util.js";

import NavigateBlock from './builder/navigateblock.js';
import BuilderMouseMove from './builder/buildermousemove.js';
import BuilderMenu from './builder/buildermenu.js';
import KeyControl from './builder/keycontrol.js'
import Core from './core/core.js';
import Conf from "./core/conf.js";
import Tool from "./core/tool.js";

/**
 * init ThreeJS
 */
const core = new Core(Conf.DEFAULT_BUILDER_SIZE, 0, 25, 20, false);
core.blockRender.optimize(false);

const centerPos = core.mapData.getSize() / 2 * Conf.CUBE_SIZE;
core.camControl.initOrbit(centerPos, 25, 20 + centerPos);


// workspace
const workspace = core.workspace;


// navigation block
const navigate = new NavigateBlock(core.scene, workspace);
navigate.setPos(workspace.centerPos.x, 0, workspace.centerPos.z);

// menu
const mouseMove = new BuilderMouseMove(core.camera, navigate, core.blockRender);
const menu = new BuilderMenu(workspace, mouseMove);
menu.createMenu();

// centers the camera whenever a model is created/loaded
function centerCamera() {
    const size = workspace.getModelData().getSize();
    const centerPos = parseInt(size / 2) * workspace.cubeSize;
    
    core.camControl.setTarget(centerPos, 0, centerPos);

    core.camera.position.x = centerPos;
    core.camera.position.z = 15 + centerPos;
    core.camera.position.y = 15;
    core.camControl.update();
}

workspace.setOnLoad(() => {
    centerCamera();
});
centerCamera();


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



/**
 * init mouse and keyboard
 */
mouseMove.register();

KeyControl.init(navigate, mouseMove, () => {});

window.addEventListener('click', (event) => {
    const pos = mouseMove.getAddPos();
    if (pos) {
        workspace.set(Tool.getInstance().getActive(), pos);
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

    core.renderer.render(core.scene, core.camera);
}
