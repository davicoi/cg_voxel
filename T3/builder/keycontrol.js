import KeyboardState from '../../libs/util/KeyboardState.js';
import BuilderMouseMove from './buildermousemove.js';
import NavigateBlock from './navigateblock.js';
import Core from '../core/core.js';
import Position from '../core/position.js';
import { indexOfBlock, nameOfBlock } from '../core/blockinfo.js';

/** @type {KeyboardState} */
let keyboard;
/** @type {NavigateBlock} */
let navigate;
/** @type {BuilderMouseMove} */
let mouseMove;
/** @type {Core} */
let core;

let funcToggle;



/**
 * 
 * @param {NavigateBlock} _navigate 
 * @param {BuilderMouseMove} _mouseMove 
 */
export function init(_navigate, _mouseMove, callbackToggleBox) {
    core = Core.getInstance();
    //keyboard = new KeyboardState();
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

    if ( keyboard.down(",") )           { core.tool.dec(); console.info(nameOfBlock(core.tool.getActive())); }
    if ( keyboard.down(".") )           { core.tool.inc(); console.info(nameOfBlock(core.tool.getActive())); }
    

    if ( keyboard.down("Q") )           core.workspace.set(core.tool.getActive(), navigate.getPos());
    if ( keyboard.down("E") )           core.workspace.set(0, navigate.getPos());

    if ( keyboard.down("space") ) {
        const pos = navigate.getPos();
        core.workspace.set(core.tool.getActive(), pos);
    }

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

    if (keyboard.down("X")) {
        createTemple();
        console.log ("create Temple");
    }
}

function createSquare(x, y, z, size, tileName) {
    const startX = parseInt(x - size / 2);
    const startZ = parseInt(z - size / 2);
    const pos = new Position(x, y, z);


    let tileId = indexOfBlock(tileName);
    for (let i = 0 ; i < size ; i++) {
        // x
        pos.set(i + startX, y, startZ);
        core.workspace.set(tileId, pos);

        pos.set(i + startX, y, startZ + size - 1);
        core.workspace.set(tileId, pos);
    }

    for (let i = 1 ; i < size - 1 ; i++) {
        // z
        pos.set(startX, y, i + startZ);
        core.workspace.set(tileId, pos);

        pos.set(startX + size - 1, y, i + startZ);
        core.workspace.set(tileId, pos);
    }
}

function createTemple() {
    let height = 9;

    let center = core.workspace.getModelData().getSize() / 2 | 0;
    console.log ({center, size: core.workspace.getModelData().getSize()});

    // piramite
    let size = 3;
    for (let y = height ; y >= 0 ; y--) {
        createSquare(center, y, center, size, 'gold');
        size += 2;
    }
    createSquare(center, height, center, 1, 'gold');

    
    // torres
    const sizeQuad = 3 + 8 * 2;
    const sizeq = (center - sizeQuad/2) | 0;
    const startX = parseInt(sizeq);
    const startZ = parseInt(sizeq);
    for (let i = 0 ; i < 8 ; i++) {
        createSquare(startX, i, startZ, 5, 'silver');
        createSquare(startX, i, startZ+sizeQuad + 1, 5, 'silver');

        createSquare(startX+sizeQuad + 1, i, startZ, 5, 'silver');
        createSquare(startX+sizeQuad + 1, i, startZ+sizeQuad + 1, 5, 'silver');
    }
    createSquare(startX, 8, startZ, 3, 'silver');
    createSquare(startX, 8, startZ+sizeQuad + 1, 3, 'silver');
    createSquare(startX+sizeQuad+1, 8, startZ, 3, 'silver');
    createSquare(startX+sizeQuad+1, 8, startZ+sizeQuad + 1, 3, 'silver');

    createSquare(startX, 8, startZ, 1, 'silver');
    createSquare(startX, 8, startZ+sizeQuad + 1, 1, 'silver');
    createSquare(startX+sizeQuad+1, 8, startZ, 1, 'silver');
    createSquare(startX+sizeQuad+1, 8, startZ+sizeQuad + 1, 1, 'silver');

    // porta
    const doorHeight = 5;
    for (let i = 0 ; i < doorHeight ; i++) {
        createSquare(center, i, startZ+sizeQuad, 5, 'diamond');
    }
    createSquare(center, doorHeight-1, startZ+sizeQuad, 3, 'diamond');
    createSquare(center, doorHeight-1, startZ+sizeQuad, 1, 'diamond');

}


export default {
    init,
    getKeyboardState,
    keyboardUpdate
}
