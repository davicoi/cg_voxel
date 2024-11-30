import * as THREE from  '../../build/three.module.js';
import Position from './position.js';
import Core from './core.js';
import Chunk from './chunk.js';
import Conf from './conf.js';


export default class BlockRenderer {
    optimizeBlocks = true;

    /** @type {Core} */
    core;

    /** @type {[Chunk]} */
    chunkList = [];



    /**
     * 
     * @param {THREE.Scene} scene 
     */
    constructor(scene) {
        this.core = Core.getInstance();
        this.optimizeBlocks = true;
    }

    init() {
        const count = Math.ceil(this.core.mapData.getSize() / Conf.CHUNK_SIZE);
        
        
        for (let z = 0 ; z < count ; z++) {
            for (let x = 0 ; x < count ; x++) {
                this.chunkList.push(new Chunk(x * Conf.CHUNK_SIZE, z * Conf.CHUNK_SIZE));
            }
        }
    }

    optimize(enable) {
        this.optimizeBlocks = enable;
    }

    clear() {
        this.chunkList.forEach(chunk => {
            chunk.clear();
        });
    }

    /** Returns a list of all blocks */
    getBlockList() {
        const list = [];
        this.chunkList.forEach(chunk => {
            list.push(...chunk.blockList);
        });
        return list;
    }

    getBlockByPos(pos) {
        const chunk = this.chunkOf(pos);
        if (chunk)
            return chunk.getMeshByPos(pos);
    }
    
    chunkOf(pos) {
        const ref = Chunk.refFrom(pos.x, pos.z);
        const chunk = this.chunkList.find(chunk => chunk.ref == ref);
        return chunk;
    }

    /**
     * 
     * @param {number} id 
     * @param {Position} pos 
     */
    set(id, pos) {
        const chunk = this.chunkOf(pos);
        if (chunk)
            chunk.set(id, pos);
    }
    get(pos) {
        console.log ('blex');
        return this.core.model.get(pos);
    }

    setNeighborsVisibility(pos) {
        const p = pos.clone();
        const addPos = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]];
        let chunk;

        addPos.forEach(([x, y, z]) => {
            p.x = pos.x + x;
            p.y = pos.y + y;
            p.z = pos.z + z;
            chunk = this.chunkOf(p);
            chunk.setVisibility(p, this.core.model.countNeighbors(p) < 6);
        })
    }

    /** recreate all blocks */
    redraw() {
        this.chunkList.forEach(chunk => {
            chunk.redraw();
        });
    }
}
