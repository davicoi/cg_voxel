import * as THREE from  'three';
import Conf from "./conf.js"
import MaterialList from "./materiallist.js";


/** Default block list, the first is ALWAYS EMPTY (0 = no block) */
const blockList = [
    '',
    '#6AA84F',  // ground 1
    '#E69138',  // ground 2
    '#63462D',  // wood 1
    '#310e00',  // wood 2
    '#6F9940',  // leaf 1
    '#087830',  // leaf 2
];

// instance of Blocks
let blockInst = null;

/**
 * Blocks manager (Singleton)
 */
export default class Blocks {
    blocksCount = 0;

    constructor() {
        if (blockInst)
            throw new ReferenceError("ERROR: Only 1 instance of Blocks() is allowed. Use Block.getInstance().")
        this.createMaterialList();
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

    /** Create default materials */
    createMaterialList() {
        const materialList = MaterialList.getInstance();

        for (let i = 1 ; i < blockList.length ; i++) {
            materialList.create(`b${i}`, blockList[i]);
        }
        this.blocksCount = blockList.length - 1;
    }

    /**
     * Create a block by id
     * @param {number} id block type id
     * @returns {THREE.Mesh}
     */
    createBlockById(id) {
        if (id < 1 || id >= blockList.length)
            return null;

        const materialList = MaterialList.getInstance();
        const material = materialList.get(`b${parseInt(id)}`);
        const cube = new THREE.BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE);
        const mesh = new THREE.Mesh(cube, material);
        return mesh;
    }

    /** blocks type count */
    count() {
        return this.blocksCount;
    }
}
