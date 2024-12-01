import Workspace from './workspace.js';
import KeyboardState from '../../libs/util/KeyboardState.js';
import BuilderMouseMove from '../builder/buildermousemove.js';
import NavigateBlock from '../builder/navigateblock.js';
import Blocks from './blocks.js';
import Core from './core.js';

/** @type {KeyboardState} */
let keyboard;
/** @type {NavigateBlock} */
let navigate;
/** @type {BuilderMouseMove} */
let mouseMove;

let funcToggle;

/** @type {Core} */
let core;

let jumpActive = false;


/**
 * 
 * @param {NavigateBlock} _navigate 
 * @param {BuilderMouseMove} _mouseMove 
 */
export function init(_navigate, _mouseMove, callbackToggleBox) {
    core = Core.getInstance();
    keyboard = core.keyboard;
    navigate = _navigate;
    mouseMove = _mouseMove;
    funcToggle = callbackToggleBox;
}

export function getKeyboardState() {
    return keyboard;
}

export function keyboardUpdate() {
    keyboard.update();

    
    if ( keyboard.down("left") )        navigate.addPos(-1, 0, 0);
    if ( keyboard.down("right") )       navigate.addPos( 1, 0, 0);
    if ( keyboard.down("up") )          navigate.addPos(0, 0, -1);
    if ( keyboard.down("down") )        navigate.addPos(0, 0,    1);
    if ( keyboard.down("pageup") )      navigate.addPos(0,    1, 0);
    if ( keyboard.down("pagedown") )    navigate.addPos(0, -1, 0);

    if ( keyboard.down(",") )           core.tool.dec();
    if ( keyboard.down(".") )           core.tool.inc();

    if ( keyboard.down("Q") )           core.workspace.set(core.tool.getActive(), navigate.getPos());
    if ( keyboard.down("E") )           core.workspace.set(0, navigate.getPos());

    if ( keyboard.down("space") )       jumpActive = true;
    if ( keyboard.up("space") )         jumpActive = false;


    if ( keyboard.down("delete") ) {
        const pos = mouseMove.getLastBlockPos();
        if (pos)
            core.workspace.set(0, pos);
    }

    if (funcToggle && keyboard.down("T"))
        funcToggle();       

    if (keyboard.down("C") ) {
        const core = Core.getInstance();
        core.camControl.toggle();
    }

    if (jumpActive)
        core.camControl.jump();
}


export default {
    init,
    getKeyboardState,
    keyboardUpdate
}
