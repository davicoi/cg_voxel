import * as THREE from  '../../build/three.module.js';
import Workspace from './workspace.js';
import Blocks from './blocks.js';
import CoordConverter from './coordconverter.js';

const blocks = Blocks.getInstance();

export default class BlockRenderer {
    /** @type {THREE.Scene} */
    scene;
    /** @type {Workspace} */
    workspace;

    /** @type {[THREE.Mesh]} */
    blockList = [];         // list of all blocks
    blockMap = {};          // list of blocks indexed by reference

    /**
     * 
     * @param {THREE.Scene} scene 
     */
    constructor(scene) {
        this.scene = scene;
    }

    setWorkspace(workspace) {
        this.workspace = workspace;
    }

    clear() {
        const entries = Object.keys(this.blockMap).forEach(ref => {
            this.removeBlock(ref);
        });

        this.blockList = [];
        this.blockMap = {};
    }

    /** Returns a list of all blocks */
    getBlockList() {
        return this.blockList;
    }

    /** Change block */
    set(ref, id, pos) {
        if (this.blockMap[ref])
            this.removeBlock(ref);
        this.createBlock(ref, id, pos);
    }

    /** Remove/destroy a block */
    removeBlock(ref) {
        if (this.blockMap[ref]) {
            const mesh = this.blockMap[ref];
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();

            this.removeFromBlockList(mesh);
            this.blockMap[ref] = undefined;
            return true;
        }
        return false;
    }

    /** Create a new block */
    createBlock(ref, id, pos) {
        if (id <= 0)
            return;

        const cube = blocks.createBlockById(id);
        const realPos = CoordConverter.block2RealPosition(pos.x, pos.y, pos.z);
        cube.position.set(realPos.x, realPos.y, realPos.z);
        this.scene.add(cube);

        this.blockMap[ref] = cube;
        this.blockList.push(cube);
    }

    /**
     * Remove mesh from mesh list
     * @param {THREE.Mesh} mesh 
     */
    removeFromBlockList(mesh) {
        const idx = this.blockList.indexOf(mesh);
        if (idx >= 0)
            this.blockList.splice(idx, 1);
    }

    /** Update rendered blocks in batch */
    updateList(list) {
        list.add.forEach(item => {
            this.set(item.ref, item.id, item.pos);
        });
    }
}
