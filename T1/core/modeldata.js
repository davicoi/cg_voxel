import BlockRenderer from './blockrenderer.js';
import { hexToUint8, trimmedUint8ToHex } from '../other/uint8conv.js';
import Position from './position.js';
import WorldLimit from './worldlimit.js';

export default class ModelData {
    /** @type {Uint8Array} */
    data;
    size = 0;
    height = 0;
    highestBlock = 0;
    /** @type {Position} */
    center = new Position();

    /** @type {BlockRenderer} Block rendere instance, needs to have updateList function */
    blockRender;


    /**
     * Constructor
     * @param {number} size workspace size (10 = 10x10x10)
     */
    constructor(size, height = 0) {
        if (!size || size < 0 || size > WorldLimit.MAX_SIZE || height < 0 || height > WorldLimit.MAX_DEPTH)
            throw new RangeError(`Invalid ModelData size. (Max: ${WorldLimit.MAX_WIDTH}x${WorldLimit.MAX_HEIGHT}x${WorldLimit.MAX_DEPTH})`);

        height = height || size;
        if (height >= WorldLimit.MAX_DEPTH)
            height = WorldLimit.MAX_DEPTH;

        this.size = parseInt(size);
        this.height = parseInt(height);
        this.highestBlock = 0;
        this.center = new Position(this.size / 2, 0, this.size / 2);

        this.data = new Uint8Array(size*size*this.height);
    }

    /** Create a new model */
    static create(size) {
        const model = new ModelData(size);
    }

    getSize() {
        return this.size;
    }

    getHeight() {
        return this.height;
    }

    /** recreate all blocks */
    reloadBlocks() {
        this.blockRender.clear();

        this.forEachBlock((id, x, y, z) => {
            this.getAndSet(x, y, z);
        });
    }

    // FIXME: refactor to block renderer
    getAndSet(x, y, z) {
        const pos = {x, y, z};
        const idx = this.indexOf(pos)
        const ref = Position.refFrom(x, y, z);

        this.blockRender.updateList({ add: [
            {id: this.data[idx], pos, ref}
        ], remove: []});
    }

    /** Load model from json */
    static load(jsonOrString) {
        const info = typeof jsonOrString != 'string' ? jsonOrString : JSON.parse(jsonOrString);
        const model = new ModelData(info.size, info.height || info.size);
        const uint8 = hexToUint8(info.data);

        for (let i = 0 ; i < uint8.length ; i++) {
            model.data[i] = uint8[i];
        }
        model.highestBlock = info.highestBlock;
        return model;
    }

    /** Dump data to json */
    dump() {
        const info = {
            size: this.size,
            height: this.height,
            highestBlock: this.highestBlock,
            data: trimmedUint8ToHex(this.data)
        }

        return JSON.stringify(info, null, 2);
    }

    /**
     * Check if a block position is valid
     * @param {Position} pos 
     */
    checkPos(pos) {
        return !(pos.y < 0 || pos.y >= this.height ||
                 pos.x < 0 || pos.x >= this.size ||
                 pos.z < 0 || pos.z >= this.size);
    }

    /**
     * Returns the index of block in the array, -1 otherwise
     * @param {Position} pos 
     */
    indexOf(pos) {
        if (!this.checkPos(pos))
            return -1;

        const size = this.size;
        return pos.y * size * size +
               pos.z * size +
               pos.x;
    }

    /**
     * Set the id of block of a specified position
     * @param {number} id blockId 
     * @param {Position} pos 
     */
    set(id, pos) {
        const idx = this.indexOf(pos);
        if (idx < 0 || this.data[idx] == id)
            return;

        if (pos.y > this.highestBlock && id)
            this.highestBlock = pos.y;

        this.data[idx] = id;

        // FIXME: refactor to block renderer
        if (this.blockRender) {
            const ref = Position.refFrom(pos.x, pos.y, pos.z);
            this.blockRender.updateList({ add: [
                {id, pos, ref}
            ], remove: []});
        }
    }

    /**
     * id of a block at a specific position
     * @param {Position} pos 
     */
    get(pos) {
        const idx = this.indexOf(pos)
        return idx < 0 ? 0 : this.data[idx];
    }

    /**
     * Set block rendered, update blocks in batch
     * obj.updateList ({ add: [{id, x, y, z, ref}], remove: [{id, x, y, z, ref}] });
     * @param {*} renderObj 
     */
    // FIXME: add > 1 && remove
    setBlockRender(renderObj) {
        this.blockRender = renderObj;
    }

    // /** calculate the maximum height where there is a block */
    // calcHighestBlock() {
    //     let p = this.data.length - 1;
    //     for (; p >= 0 && !this.data[p] ; p--);
    //     p += this.size * this.size - 1;
    //     return p / (this.size * this.size) | 0;
    // }   

    /**
     * Iterate over existing blocks
     * @param {function} callback - callback(id, x, y, z)
     */
    forEachBlock(callback) {
        const pos = new Position(0, 0, 0);
        const height = this.highestBlock;

        let id;
        for (pos.y = 0 ; pos.y < height ; pos.y++) {
            for (pos.z = 0 ; pos.z < this.size ; pos.z++) { 
                for (pos.x = 0 ; pos.x < this.size ; pos.x++) {
                    id = this.get(pos);
                    if (!id)
                        continue;
                    callback(this.get(pos), pos.x, pos.y, pos.z);
                }
            }
        }
    }
}
