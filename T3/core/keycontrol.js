import KeyboardState from '../../libs/util/KeyboardState.js';
import BuilderMouseMove from '../builder/buildermousemove.js';
import NavigateBlock from '../builder/navigateblock.js';
import Core from './core.js';
import { toggleMenu } from './menu.js';
import TemporaryBlock from './temporaryblock.js';


/** @type {KeyboardState} */
let keyboard;
/** @type {NavigateBlock} */
let navigate;
/** @type {BuilderMouseMove} */
let mouseMove;

let funcToggle;
let jumpActive = false;


/**
 * 
 * @param {NavigateBlock} _navigate 
 * @param {BuilderMouseMove} _mouseMove 
 */
function init(_navigate, _mouseMove, callbackToggleBox) {
    const core = Core.getInstance();
    keyboard = core.keyboard;
    navigate = _navigate;
    mouseMove = _mouseMove;
    funcToggle = callbackToggleBox;
}

function getKeyboardState() {
    return keyboard;
}

function keyboardUpdate() {
    keyboard.update();
    const core = Core.getInstance();

    
    // if ( keyboard.down("left") )        navigate.addPos(-1, 0, 0);
    // if ( keyboard.down("right") )       navigate.addPos( 1, 0, 0);
    // if ( keyboard.down("up") )          navigate.addPos(0, 0, -1);
    // if ( keyboard.down("down") )        navigate.addPos(0, 0,    1);
    // if ( keyboard.down("pageup") )      navigate.addPos(0,    1, 0);
    // if ( keyboard.down("pagedown") )    navigate.addPos(0, -1, 0);

    if ( keyboard.down(",") )           core.tool.dec();
    if ( keyboard.down(".") )           core.tool.inc();

    if ( keyboard.down("Q") )           core.workspace.set(core.tool.getActive(), navigate.getPos());
    if ( keyboard.down("E") )           core.workspace.set(0, navigate.getPos());

    if ( keyboard.down("space") )       jumpActive = true;
    if ( keyboard.up("space") )         jumpActive = false;

    if ( keyboard.down("H") )           core.lightControl.toggleHelper();
    if ( keyboard.down("M") )           toggleMenu();



    if ( keyboard.down("delete") ) {
        const pos = mouseMove.getLastBlockPos();
        if (pos) {
            const blockId = core.workspace.get(pos);
            core.workspace.set(0, pos);

            const tempBlock = new TemporaryBlock(pos.x, pos.y, pos.z, blockId, core.scene);
        }
    }

    if (keyboard.down("F") ) {
        core.fog.enableFogSystem(!core.fog.isEnabled());
    }

    if (keyboard.down("Y") ) {
        if((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height))
            document.exitFullscreen();
        else
            document.getElementsByTagName('canvas')[0].requestFullscreen();
    }

    if (funcToggle && keyboard.down("T"))
        funcToggle();       

    if (keyboard.down("C") ) {
        core.camControl.toggle();
    }

    if (jumpActive && core.playerModel) {
        if (core.playerModel)
            core.playerModel.jump();
        if (core.camControl.isFirstPerson())
            core.camControl.firstPerson.jump();
    }
}

function setJump(active) {
    jumpActive = active;
}


export default {
    init,
    getKeyboardState,
    keyboardUpdate,
    setJump
}
