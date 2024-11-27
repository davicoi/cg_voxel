import * as THREE from  'three';
import Conf from "./conf.js"
import MaterialList from "./materiallist.js";


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
];

// instance of Blocks
let blockInst = null;

/**
 * Blocks manager (Singleton)
 */
export default class Blocks {
    blocksCount = 0;
    /** @type {THREE.BoxGeometry} */
    cube;

    constructor() {
        if (blockInst)
            throw new ReferenceError("ERROR: Only 1 instance of Blocks() is allowed. Use Block.getInstance().")
        this.createCube();
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

    createCube() {
        if (!this.cube)
            this.cube = new THREE.BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE);
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
        const mesh = new THREE.Mesh(this.cube, material);
        return mesh;
    }

    /** blocks type count */
    count() {
        return this.blocksCount;
    }
}
