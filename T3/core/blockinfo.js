/*
const blockList = [
    '',
    '#6AA84F',  //  1 ground 1
    '#E69138',  //  2 ground 2
    '#63462D',  //  3  wood 1
    '#310e00',  //  4 wood 2
    '#6F9940',  //  5 leaf 1
    '#087830',  //  6 leaf 2
    '#fffafa',  //  7 ground 3 (snow)
    '#404040',  //  8 ground 3
    '#555555',  //  9 ground 4
    '#676767',  // 10 ground 5
    '#D68130',  // 11 ground 6
    '#ba6f29',  // 12 ground 7
    '#945821',  // 13 ground 7
];
*/

import Conf from "./conf.js";

/**
 * 
 * @param {*} blockName 
 * @param {*} color 
 * @param {*} textureId 
 * @returns {{blockName: string, color: string, textureId: number|number[]}}
 */
function create(blockName, color, textureId = 0, transparent = false) {
    if (Array.isArray(textureId)) {
        if (textureId.length < 6) {
            const lastId = textureId[textureId.length - 1];
            for (let i = 0; i < 6 - textureId.length; i++)
                textureId.push(lastId);
        }
    }
    return {
        blockName,
        color,
        uv: textureId,
        transparent
    }
}

function tileUV(x, y) {
    const size = Conf.BLOCK_ATLAS_SIZE / Conf.BLOCK_TEXTURE_SIZE;
    const m = 1 / size;
    return [x * m, (size - y - 1) * m, m, m];
}

// @type {blockName: string, color: string, uv: number[]|number[][]}[]
const solidBlocks = [];
const blockList = [
    create('empty', '', [0, 0, 1, 1], true),
    create('grass', '#6AA84F', [tileUV(1, 4), tileUV(1, 6), tileUV(1, 5)]),
    create('ground', '#E69138', tileUV(1, 6)),  //  2 ground 2
    create('wood1', '#63462D', [tileUV(0, 29), tileUV(0, 29), tileUV(0, 30)]),  //  3  wood 1
    create('wood2', '#310e00', [tileUV(1, 29), tileUV(1, 29), tileUV(1, 31)]),  //  4 wood 2

    create('leaf1', '#6F9940', tileUV(0, 28), true),  //  5 leaf 1
    create('leaf2', '#087830', tileUV(4, 28), true),  //  6 leaf 2

    create('snow1', '#fffafa', tileUV(0, 2)),    //  7 ground 3 (snow)
    create('ground2', '#404040', tileUV(4, 3)),  //  8 ground 4
    create('ground3', '#555555', tileUV(0, 3)),  //  9 ground 5
    create('ground4', '#676767', tileUV(7, 2)),  // 10 ground 6
    create('ground5', '#D68290', tileUV(6, 5)),  // 11 ground 7
    create('ground6', '#ba6f29', tileUV(7, 3)),  // 12 ground 8
    create('ground7', '#945821', tileUV(4, 7)),  // 13 ground 9];

    create('wood3', '#63462D', [tileUV(2, 29), tileUV(2, 29), tileUV(2, 30)]),  // wood 3
    create('wood4', '#310e00', [tileUV(3, 29), tileUV(3, 29), tileUV(3, 31)]),  // wood 4
    create('wood5', '#63462D', [tileUV(4, 29), tileUV(4, 29), tileUV(4, 30)]),  // wood 5
    create('wood6', '#310e00', [tileUV(5, 29), tileUV(5, 29), tileUV(5, 31)]),  // wood 6
    create('wood7', '#63462D', [tileUV(6, 29), tileUV(6, 29), tileUV(6, 30)]),  // wood 7
    create('wood8', '#310e00', [tileUV(5, 29), tileUV(7, 29), tileUV(7, 31)]),  // wood 8

    create('leaf3', '#6F9940', tileUV(1, 28), true),  //  leaf 3
    create('leaf4', '#087830', tileUV(2, 28), true),  //  leaf 4
    create('leaf5', '#6F9940', tileUV(3, 28), true),  //  leaf 5
    create('leaf6', '#6F9940', tileUV(5, 28), true),  //  leaf 6
    create('leaf7', '#087830', tileUV(6, 28), true),  //  leaf 7
    create('leaf8', '#087830', tileUV(7, 28), true),  //  leaf 8

    create('gold', '#DDDD00', tileUV(5, 0), true),
    create('diamond', '#0000DD', tileUV(6, 0), true),
    create('silver', '#909090', tileUV(7, 0), true),
    create('ruby', '#FF0000', tileUV(4, 0), true),

    create('gold2', '#FFFF00', tileUV(5, 1), true),
    create('diamond2', '#0000FF', tileUV(6, 1), true),
    create('silver2', '#c0c0c0', tileUV(7, 1), true),
    create('ruby2', '#FF0000', tileUV(4, 1), true),

];

function updateSolidBlocksList() {
    solidBlocks.splice(0, solidBlocks.length);
    for (let i = 0; i < blockList.length; i++) {
        solidBlocks.push(!blockList[i].transparent);
    }
}

function getSolidBlocksStatus() {
    if (solidBlocks.length == 0)
        updateSolidBlocksList();
    return solidBlocks;
}

function blocksCount() {
    return blockList.length;
}

function nameOfBlock(blockIdx) {
    if (blockIdx >= 0 && blockIdx < blockList.length)
        return blockList[blockIdx].blockName;
    return null;
}

function indexOfBlock(blockName) {
    for (let i = 0; i < blockList.length; i++) {
        if (blockList[i].blockName === blockName)
            return i;
    }
    return -1;
}

export {
    blockList,
    blocksCount,
    nameOfBlock,
    indexOfBlock,
    getSolidBlocksStatus
}
