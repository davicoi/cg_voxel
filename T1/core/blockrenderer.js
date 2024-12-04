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
    useFog = false;

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
        //this.optimizeBlocks = true;
    }

    init() {
        const count = Math.ceil(this.core.mapData.getSize() / Conf.CHUNK_SIZE);
        this.clear();
    }

    optimize(enable) {
        this.optimizeBlocks = enable;
    }

    enableFog(enable) {
        const chunkInfo = this.core.chunkSystem.getActive();
        if (!this.useFog || !enable || !chunkInfo) {
            this.core.scene.fog = null;
            return;
        }

        const max = chunkInfo.maxRadius;
        const visible = chunkInfo.alwaysVisible;
        this.core.scene.fog = new THREE.Fog(this.core.backgrounColor, visible - Conf.CHUNK_SIZE, visible);
    }

    fogEnabled() {
        return this.core.scene.fog != null;
    }

    clear() {
        if (!this.core.mapData)
            return;

        this.core.blockDraw.clearAll();

        this.chunkList.forEach(chunk => {
            chunk.clearAll();
        });
        this.chunkList = [];
        
        this.updateChunk(true);
    }

    /** recreate all blocks */
    redraw() {
        this.clear();

        this.chunkList.forEach(chunk => {
            chunk.redraw();
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

    recreateNeighbors(pos) {
        const p = pos.clone();
        const addPos = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]];
        let chunk, id;

        addPos.forEach(([x, y, z]) => {
            p.x = pos.x + x;
            p.y = pos.y + y;
            p.z = pos.z + z;
            id = this.core.mapData.get(p);
            if (id < 1)
                return;

            chunk = this.chunkOf(p);
            if (chunk) {
                chunk.set(id, p, true);
            }
        });
    }

    update(delta) {
        this.updateChunk();
    }

    updateChunk(force = false) {
        // FIXME: map load (without mouse)
        const pos = this.core.camControl.getPlanePosition();
        if (!pos)
            return;

        const newRect = this.core.chunkSystem.getRect(pos.x, pos.z, this.core.mapData.getSize());
        if (!force && this.core.chunkSystem.isEqual(newRect))
            return;

        this.core.chunkSystem.setActive(newRect);
        const list = this.core.chunkSystem.getCoordList();

        // remove chunks
        for (let i = 0 ; i < this.chunkList.length ; i++) {
            if (binaryIndexOf(list, this.chunkList[i].ref, (val, b) => val - b.ref) >= 0)
                continue;

            this.chunkList[i].clear();
            this.chunkList[i] = null;
        }
        this.chunkList = this.chunkList.filter(chunk => chunk !== null);

        // add chunks
        let chunk;
        for (let i = 0 ; i < list.length ; i++) {
            if (binaryIndexOf(this.chunkList, list[i].ref, (val, b) => val - b.ref) >= 0)
                continue;

            chunk = new Chunk(list[i].x, list[i].z)
            chunk.redraw();
            this.chunkList.push(chunk);
        }
        this.chunkList.sort((a, b) => a.ref - b.ref);
    }

    enableChunk(enable) {
        enable = enable == true;

        if (this.core.chunkSystem.isEnabled() != enable) {
            this.core.chunkSystem.setEnable(enable);
            this.updateChunk(true);
            this.redraw();
        }
    }

    isChunkActive() {
        return this.core.chunkSystem.isEnabled();
    }

    setOptimizeBlocks(optimize) {
        if (this.core.blockDraw.supported.optimizationBlocks && optimize)
            this.optimizeBlocks = true;
        else
            this.optimizeBlocks = false;
    }

    setOptimizeSides(optimize) {
        if (this.core.blockDraw.supported.optimizationSides && optimize)
            this.optimizeSides = true;
        else
            this.optimizeSides = false;
    }
};
