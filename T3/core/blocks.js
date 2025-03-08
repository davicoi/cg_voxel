import * as THREE from  'three';
import Conf from "./conf.js"
import MaterialList from "./materiallist.js";
import { blockList } from './blockinfo.js';

import { BoxGeometry } from './boxgeometry.js';
import Textures from './textures.js';
//const BoxGeometry = THREE.BoxGeometry;


// TODO: THREE.BoxBufferGeometry
// https://medium.com/@pailhead011/instancing-with-three-js-36b4b62bc127
// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_interactive_cubes.html

/** Default block list, the first is ALWAYS EMPTY (0 = no block) */
// const blockList = [
//     '',
//     '#6AA84F',  //  1 ground 1
//     '#E69138',  //  2 ground 2
//     '#63462D',  //  3  wood 1
//     '#310e00',  //  4 wood 2
//     '#6F9940',  //  5 leaf 1
//     '#087830',  //  6 leaf 2
//     '#fffafa',  //  7 ground 3 (snow)
//     '#404040',  //  8 ground 3
//     '#555555',  //  9 ground 4
//     '#676767',  // 10 ground 5
//     '#D68130',  // 11 ground 6
//     '#ba6f29',  // 12 ground 7
//     '#945821',  // 13 ground 7
// ];

// instance of Blocks
let blockInst = null;

/**
 * Blocks manager (Singleton)
 */
export default class Blocks {
    blocksCount = 0;
    /** @type {BoxGeometry} */
    cube;
    /** @type {[BoxGeometry]} */
    cache = {};

	static RIGHT = 0x20;
	static LEFT = 0x10;
	static TOP = 0x08;
	static BOTTOM = 0x04;
	static FRONT = 0x02;
	static BACK = 0x01;
	static ALL_SIDES = 0x3F;

    constructor() {
        if (blockInst)
            throw new ReferenceError("ERROR: Only 1 instance of Blocks() is allowed. Use Block.getInstance().")
        this.createCube();
        this.createMaterialList();

        // const last = BoxGeometry.FRONT | BoxGeometry.BACK | BoxGeometry.LEFT | BoxGeometry.RIGHT | BoxGeometry.TOP | BoxGeometry.BOTTOM;
        // for (let i = 0 ; i <= last ; i++) {
        //     this.cache.push(null);
        // }
    }

    static EMPTY = 0;

    /**
     * Get instance
     * @returns {Blocks}
     */
    static getInstance() {
        if (!blockInst)
            blockInst = new Blocks();

        return blockInst;
    }

    cacheName(sides, blockId) {
        sides &= Blocks.ALL_SIDES;
        const cid = (blockId << 6) + sides;
        return `b${cid}`;
    }

    createCube(sides = 0x3F, blockId = 0) {
        // 0x20 = F
        // 0x10 = A
        // 0x08 = T
        // 0x04 = B
        // 0x02 = L
        // 0x01 = R

        // if (!this.cube)
        //     this.cube = new BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE, 0x01);
        sides &= Blocks.ALL_SIDES;
        const cname = this.cacheName(sides, blockId);
        
        if (!this.cache[cname])
            this.cache[cname] = new BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE, sides, 1, 1, 1, blockList[blockId].uv);
        return this.cache[cname];
    }

    /** Create default materials */
    createMaterialList() {
        const materialList = MaterialList.getInstance();
        const textures = Textures.getInstance();

        for (let i = 1 ; i < blockList.length ; i++) {
            materialList.create(`b${i}`, blockList[i].color);
        }
        this.blocksCount = blockList.length - 1;

        materialList.create('blocks', undefined, textures.get('blocks'));
        // for (let i = 1 ; i < blockList.length ; i++) {
        //     materialList.create(`b${i}`, blockList[i]);
        // }
        // this.blocksCount = blockList.length - 1;
    }

    getCube(sides, blockId = 0) {
        const cname = this.cacheName(sides, blockId);
        if (!this.cache[cname])
            this.createCube(sides, blockId);
        return this.cache[cname];
    }

    /**
     * Create a block by id
     * @param {number} id block type id
     * @returns {THREE.Mesh}
     */
    createBlockById(id, sides = 0x3F) {
        if (id < 1 || id >= blockList.length)
            return null;

        const materialList = MaterialList.getInstance();
        //const material = materialList.get(`b${parseInt(id)}`);
        const material = materialList.get(`blocks`);
        const cube = this.getCube(sides, id)
        const mesh = new THREE.Mesh(cube, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        return mesh;
    }

    /** blocks type count */
    count() {
        return this.blocksCount;
    }

    indexOf(blockName) {
        for (let i = 0 ; i < blockList.length ; i++) {
            if (blockList[i].blockName === blockName)
                return i;
        }
        return -1;
    }

    nameOf(idx) {
        if (idx >= 0 && idx < blockList.length)
            return blockList[idx].blockName;
        return null;
    }
}
