import * as THREE from  'three';
import Conf from "./conf.js"
import MaterialList from "./materiallist.js";

import { BoxGeometry } from './boxgeometry.js';
//const BoxGeometry = THREE.BoxGeometry;


// TODO: THREE.BoxBufferGeometry
// https://medium.com/@pailhead011/instancing-with-three-js-36b4b62bc127
// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_interactive_cubes.html

/** Default block list, the first is ALWAYS EMPTY (0 = no block) */
const blockList = [
    '',
    '#6AA84F',  // ground 1
    '#E69138',  // ground 2
    '#63462D',  // wood 1
    '#310e00',  // wood 2
    '#6F9940',  // leaf 1
    '#087830',  // leaf 2
    '#fffafa',  // ground 3 (snow)
    '#676767',  // ground 3
];

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
    cache = [];

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

        const last = BoxGeometry.FRONT | BoxGeometry.BACK | BoxGeometry.LEFT | BoxGeometry.RIGHT | BoxGeometry.TOP | BoxGeometry.BOTTOM;
        for (let i = 0 ; i <= last ; i++) {
            this.cache.push(null);
        }
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

    createCube(sides = 0x3F) {
        // 0x20 = F
        // 0x10 = A
        // 0x08 = T
        // 0x04 = B
        // 0x02 = L
        // 0x01 = R

        // if (!this.cube)
        //     this.cube = new BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE, 0x01);

        if (!this.cache[sides & 0x3F])
            this.cache[sides & 0x3F] = new BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE, sides);
    }

    /** Create default materials */
    createMaterialList() {
        const materialList = MaterialList.getInstance();

        for (let i = 1 ; i < blockList.length ; i++) {
            materialList.create(`b${i}`, blockList[i]);
        }
        this.blocksCount = blockList.length - 1;
    }

    getCube(sides) {
        sides &= 0x3F;
        if (!this.cache[sides])
            this.createCube(sides);
        return this.cache[sides];
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
        const material = materialList.get(`b${parseInt(id)}`);
        const cube = this.getCube(sides)
        const mesh = new THREE.Mesh(cube, material);
        return mesh;
    }

    /** blocks type count */
    count() {
        return this.blocksCount;
    }
}
