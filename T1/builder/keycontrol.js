import Workspace from '../core/workspace.js';
import KeyboardState from '../../libs/util/KeyboardState.js';
import BuilderMouseMove from './buildermousemove.js';
import NavigateBlock from './navigateblock.js';
import Core from '../core/core.js';

/** @type {KeyboardState} */
let keyboard;
/** @type {NavigateBlock} */
let navigate;
/** @type {Workspace} */
let workspace;
/** @type {BuilderMouseMove} */
let mouseMove;
/** @type {Core} */
let core;

let funcToggle;



/**
 * 
 * @param {Workspace} _workspace 
 * @param {NavigateBlock} _navigate 
 * @param {BuilderMouseMove} _mouseMove 
 */
export function init(_workspace, _navigate, _mouseMove, callbackToggleBox) {
    core = Core.getInstance();
    //keyboard = new KeyboardState();
    keyboard = core.keyboard;
    navigate = _navigate;
    workspace = _workspace;
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
    if ( keyboard.down("E") )           workspace.set(0, navigate.getPos());

    if ( keyboard.down("space") ) {
        const pos = navigate.getPos();
        workspace.set(core.tool.getActive(), pos);
    }

    if ( keyboard.down("delete") ) {
        const pos = mouseMove.getLastBlockPos();
        if (pos)
            workspace.set(0, pos);
    }

    if (funcToggle && keyboard.down("T"))
        funcToggle();       

    if (keyboard.down("C") ) {
        const core = Core.getInstance();
        core.camControl.toggle();
    }
}


export default {
    init,
    getKeyboardState,
    keyboardUpdate
}
