import Conf from "./conf.js";
import CoordConverter from "./coordconverter.js";
import Core from "./core.js";
import Position from "./position.js";

export default class Chunk {
    ref;
    startX;
    startZ;

    /** @type {Core} */
    core;

    /** @type {[THREE.Mesh]} */
    blockList = [];         // list of all blocks
    blockMap = {};          // list of blocks indexed by reference

    constructor(startX, startZ) {
        this.core = Core.getInstance();

        const size = this.core.mapData.getSize();
        this.startX = parseInt(startX / Conf.CHUNK_SIZE) * Conf.CHUNK_SIZE;
        this.startZ = parseInt(startZ / Conf.CHUNK_SIZE) * Conf.CHUNK_SIZE;
        this.ref = Chunk.refFrom(this.startX, this.startZ);
    }

    clear() {
        const entries = Object.keys(this.blockMap).forEach(ref => {
            this.removeBlock(ref);
        });

        this.blockList = [];
        this.blockMap = {};
    }

    getMeshList() {
        return this.blockList;
    }

    getMeshByPos(pos) {
        const ref = Position.refFrom(pos.x, pos.y, pos.z);
        return this.blockMap[ref] || null;
    }

    /**
     * 
     * @param {number} id 
     * @param {Position} pos 
     */
    set(id, pos) {
        if (!this.core.mapData.set(id, pos))
            return;

        const ref = pos.getRef();
        if (this.blockMap[ref])
            this.removeBlock(ref);

        if (id >= 1)
            this.createBlock(ref, id, pos);

        
        if (this.core.blockRender.optimizeBlocks)
            this.core.blockRender.setNeighborsVisibility(pos);
    }

    setVisibility(pos, visible) {
        const ref = pos.getRef();
        if (!visible) {
            if (this.blockMap[ref])
                this.removeBlock(ref);
        } else if (!this.blockMap[ref]) {
            this.createBlock(ref, this.core.mapData.get(pos), pos);
        }
    }

    get(pos) {
        return this.core.mapData.get(pos);
    }

    /** Remove/destroy a block */
    removeBlock(ref) {
        if (this.blockMap[ref]) {
            const mesh = this.blockMap[ref];
            this.core.scene.remove(mesh);
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

        const cube = this.core.blocks.createBlockById(id);
        const realPos = CoordConverter.block2RealPosition(pos.x, pos.y, pos.z);
        cube.position.set(realPos.x, realPos.y, realPos.z);
        this.core.scene.add(cube);

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

    /** recreate all blocks */
    redraw() {
        this.clear();
        let ref, pos = new Position();
        this.core.mapData.forEachBlock(this.startX, this.startZ, Conf.CHUNK_SIZE, Conf.CHUNK_SIZE, (id, x, y, z) => {
            pos.x = x;
            pos.y = y;
            pos.z = z;

            // don't add non-visible blocks
            if (this.core.blockRender.optimizeBlocks && this.core.mapData.countNeighbors(pos) == 6)
                return;

            ref = pos.getRef();
            this.createBlock(ref, id, pos);
        })
    }    

    static refFrom(x, z) {
        const size = Core.getInstance().mapData.getSize();
        x = parseInt(x / Conf.CHUNK_SIZE);
        z = parseInt(z / Conf.CHUNK_SIZE);
        return parseInt(z * size + x);
    }
}