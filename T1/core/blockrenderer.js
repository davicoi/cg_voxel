import * as THREE from  '../../build/three.module.js';
import Position from './position.js';
import Core from './core.js';
import Chunk from './chunk.js';
import Conf from './conf.js';
import { binaryIndexOf } from '../other/binarysearch.js';


export default class BlockRenderer {
    optimizeBlocks = false;
    optimizeSides = false;
    chunkActive = false;
    chunkCount = 2;

    /** @type {Core} */
    core;

    /** @type {[Chunk]} */
    chunkList = [];
    recalcRect = {minX: -1, minZ: -1, maxX: -1, maxZ: -1};



    /**
     * 
     * @param {THREE.Scene} scene 
     */
    constructor(scene) {
        this.core = Core.getInstance();
        //this.optimizeBlocks = true;
    }

    init() {
        const count = Math.ceil(this.core.mapData.getSize() / Conf.CHUNK_SIZE);
        this.clear();
    }

    optimize(enable) {
        this.optimizeBlocks = enable;
    }

    clear() {
        if (!this.core.mapData)
            return;

        this.chunkList.forEach(chunk => {
            chunk.clear();
        });
        this.chunkList = [];
        
        if (!this.chunkActive) {
            const size = this.core.mapData.getSize();
            for (let z = 0 ; z < size ; z += Conf.CHUNK_SIZE) {
                for (let x = 0 ; x < size ; x += Conf.CHUNK_SIZE) {
                    this.chunkList.push(new Chunk(x, z));
                }            }
        } else {
            this.updateChunk(true);
        }
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
        return this.core.mapData.get(pos);
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
            if (chunk)
                chunk.setVisibility(p, this.core.mapData.countNeighbors(p) < 6);
        });
    }

    /** recreate all blocks */
    redraw() {
        this.clear();
        this.chunkList.forEach(chunk => {
            chunk.redraw();
        });
    }

    adjustChunkRect(x, z, gridSize, mapSize) {
        if (!this.chunkActive || gridSize >= mapSize) {
            return { x: 0, z: 0, maxX: mapSize, maxZ: mapSize };
        }
        
        const chunkSize = Conf.CHUNK_SIZE;
        mapSize = Math.ceil(mapSize / chunkSize) * chunkSize;
        x = parseInt(x - gridSize/2);
        z = parseInt(z - gridSize/2);
    
        if (x + gridSize > mapSize)
            x = mapSize - gridSize;
        if (x < 0)
            x = 0;
        
        if (z + gridSize > mapSize)
            z = mapSize - gridSize;
        if (z < 0)
            z = 0;

        x = parseInt(x / chunkSize) * chunkSize;
        z = parseInt(z / chunkSize) * chunkSize;
    
        return { x, z, maxX: x + gridSize, maxZ: z + gridSize }
    }
    
    generateChunkCoordinates(x, z, gridCount) {
        const size = Core.getInstance().mapData.getSize();
        const gridSize = (1 + gridCount * 2) * Conf.CHUNK_SIZE;

        const rect = this.adjustChunkRect(x, z, gridSize, size);

        const centerX = (rect.x + rect.maxX) / 2;
        const centerZ = (rect.z + rect.maxZ) / 2;

        // area that the user can move without having to recalculate the chunks
        const recalcRect = {
            minX: centerX - Conf.CHUNK_SIZE * 0.75,
            minZ: centerZ - Conf.CHUNK_SIZE * 0.75, 
            maxX: centerX + Conf.CHUNK_SIZE * 0.75,
            maxZ: centerZ + Conf.CHUNK_SIZE * 0.75
        }

        // coordinates of all visible chunks
        const list = [];
        let i, ref;
        for (let j = rect.z ; j < rect.maxZ ; j += Conf.CHUNK_SIZE) {
            for (i = rect.x ; i < rect.maxX ; i += Conf.CHUNK_SIZE) {
                ref = Chunk.refFrom(i, j);
                list.push({x: i, z: j, ref});
            }
        }
    
        return {
            recalcRect,
            rect,
            list
        }
    }

    chunkPendingUpdate() {
        if (!this.chunkActive)
            return false;

        const pos = this.core.camControl.getPlanePosition();
            
        return (pos && (pos.x < this.recalcRect.minX || pos.x >= this.recalcRect.maxX ||
                pos.z < this.recalcRect.minZ || pos.z >= this.recalcRect.maxZ));
    }

    update(delta) {
        if (this.chunkActive)
            this.updateChunk();
    }

    updateChunk(force = false) {
        if (!force && !this.chunkPendingUpdate())
            return;
        
        const pos = this.core.camControl.getPlanePosition();
        if (!pos)
            return;
        const grids = this.generateChunkCoordinates(pos.x, pos.z, this.chunkCount);
        this.recalcRect = grids.recalcRect;

        // remove chunks
        for (let i = 0 ; i < this.chunkList.length ; i++) {
            if (binaryIndexOf(grids.list, this.chunkList[i].ref, (val, b) => val - b.ref) >= 0)
                continue;

            this.chunkList[i].clear();
            this.chunkList[i] = null;
        }
        this.chunkList = this.chunkList.filter(chunk => chunk !== null);

        // add chunks
        let chunk;
        for (let i = 0 ; i < grids.list.length ; i++) {
            if (binaryIndexOf(this.chunkList, grids.list[i].ref, (val, b) => val - b.ref) >= 0)
                continue;

            chunk = new Chunk(grids.list[i].x, grids.list[i].z)
            chunk.redraw();
            this.chunkList.push(chunk);
        }
        this.chunkList.sort((a, b) => a.ref - b.ref);
    }

    enableChunk(enable) {
        enable = enable == true;

        if (this.chunkActive != enable) {
            this.chunkActive = enable;
            this.updateChunk(true);
            this.redraw();
        }
    }
};
