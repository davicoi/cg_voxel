import { dynamicBufferAttribute } from "../../build/jsm/nodes/Nodes.js";
import Conf from "./conf.js";
import Core from "./core.js";
import Position from "./position.js";

export default class Chunk {
    static nextChunkId = 0;
    id;
    ref;
    startX;
    startZ;

    /** @type {Core} */
    core;

    /** @type {[THREE.Mesh]} */
    blockMap = {};          // list of blocks indexed by reference

    constructor(startX, startZ) {
        this.id = Chunk.nextChunkId++;
        this.core = Core.getInstance();

        const size = this.core.mapData.getSize();
        this.startX = parseInt(startX / Conf.CHUNK_SIZE) * Conf.CHUNK_SIZE;
        this.startZ = parseInt(startZ / Conf.CHUNK_SIZE) * Conf.CHUNK_SIZE;
        this.ref = Chunk.refFrom(this.startX, this.startZ);
    }

    clear() {
        const entries = Object.keys(this.blockMap).forEach(ref => {
            this.removeBlock(ref, this.blockMap[ref]);
        });
        this.blockMap = {};
    }
    
    clearAll() {
        this.blockMap = {};
    }


    /**
     * 
     * @param {number} id 
     * @param {Position} pos 
     */
    set(id, pos, ignoreRecursion = false) {
        const ble = this.core.mapData.get(pos);
        if (!this.core.mapData.set(id, pos))
            return;

        const ref = pos.getRef();
        if (this.blockMap[ref])
            this.removeBlock(ref);

        if (id >= 1)
            this.createBlock(ref, id, pos);

        if (this.core.blockRender.optimizeBlocks)
            this.core.blockRender.setNeighborsVisibility(pos);
        if (!ignoreRecursion &&this.core.blockRender.optimizeSides)
            this.core.blockRender.recreateNeighbors(pos);
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
            this.core.blockDraw.remove(ref, this.id);
            delete this.blockMap[ref];
            return true;
        }
        return false;
    }

    /** Create a new block */
    createBlock(ref, id, pos) {
        if (id <= 0)
            return;

        // Optimizes the creation of blocks
        let sides = this.core.mapData.ALL_SIDES;
        if (this.core.blockRender.optimizeBlocks || this.core.blockRender.optimizeSides) {
            // remove blocks that are not visible
            const neighbors = this.core.mapData.neighbors(pos);
            if (neighbors == this.core.mapData.ALL_SIDES)
                return;

            // remove sides that are not visible
            if (this.core.blockRender.optimizeSides)
                sides = this.core.mapData.sidesVisibility(neighbors);
        }

        const info = this.core.blockDraw.create(ref, id, pos, this.id, sides);
        this.blockMap[ref] = info;
    }

    /** recreate all blocks */
    redraw() {
        //this.clear();
        let ref, pos = new Position();
        this.core.mapData.forEachBlock(this.startX, this.startZ, Conf.CHUNK_SIZE, Conf.CHUNK_SIZE, (id, x, y, z) => {
            pos = new Position(x, y, z);

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