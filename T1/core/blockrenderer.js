import * as THREE from  '../../build/three.module.js';
import Workspace from './workspace.js';
import Blocks from './blocks.js';
import CoordConverter from './coordconverter.js';
import Position from './position.js';
import Core from './core.js';

const blocks = Blocks.getInstance();

// TODO: draw non-visible blocks

export default class BlockRenderer {
    /** @type {Core} */
    core = Core.getInstance();
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

    /**
     * 
     * @param {number} id 
     * @param {Position} pos 
     */
    set(id, pos) {
        if (!this.core.model.set(id, pos))
            return;

        const ref = pos.getRef();
        if (this.blockMap[ref])
            this.removeBlock(ref);


        if (id >= 1)
            this.createBlock(ref, id, pos);

        this.setNeighborsVisibility(pos);
    }

    setVisibility(pos, visible) {
        console.log ({...pos, visible});
        const ref = pos.getRef();
        if (!visible) {
            if (this.blockMap[ref])
                this.removeBlock(ref);
        } else if (!this.blockMap[ref]) {
            this.createBlock(ref, this.core.model.get(pos), pos);
        }
    }

    setNeighborsVisibility(pos) {
        const p = pos.clone();
        const addPos = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]];

        console.log('setNeighborsVisibility');
        addPos.forEach(([x, y, z]) => {
            p.x = pos.x + x;
            p.y = pos.y + y;
            p.z = pos.z + z;
            this.setVisibility(p, this.core.model.countNeighbors(p) < 6);
        })
    }

    get(pos) {
        return this.core.model.get(pos);
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

    /** recreate all blocks */
    redraw() {
        this.clear();

        let ref, pos = new Position();
        this.workspace.getModelData().forEachBlock((id, x, y, z) => {
            pos.x = x;
            pos.y = y;
            pos.z = z;

            // don't add non-visible blocks
            if (this.core.model.countNeighbors(pos) == 6)
                return;

            ref = pos.getRef();
            this.createBlock(ref, id, pos);
        })
    }
}
