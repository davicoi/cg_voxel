import BuilderBlockRenderer from '../builder/builderblockrender.js';
import { hexToUint8, trimmedUint8ToHex } from '../other/uint8conv.js';
import Position from './position.js';
import WorldLimit from './worldlimit.js';

export default class ModelData {
    /** @type {Uint8Array} */
    data;
    size = 0;
    height = 0;

    /** @type {BuilderBlockRenderer} Block rendere instance, needs to have updateList function */
    blockRender;

    /**
     * Constructor
     * @param {*} size workspace size (10 = 10x10x10)
     */
    constructor(size) {
        if (!size || size < 0 || size > WorldLimit.MAX_SIZE)
            throw new RangeError(`Invalid ModelData size. (Max: ${WorldLimit.MAX_WIDTH}x${WorldLimit.MAX_HEIGHT}x${WorldLimit.MAX_DEPTH})`);

        this.size = size;
        this.height = Math.min(size, WorldLimit.MAX_DEPTH);
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

        let x, y, z;
        for (x = 0 ; x < this.size ; x++) {
            for (z = 0 ; z < this.size ; z++) {
                for (y = 0 ; y < this.height ; y++) {
                    this.getAndSet(x, y, z);
                }
            }
        }
    }

    getAndSet(x, y, z) {
        const pos = {x, y, z};
        const idx = this.indexOf(pos)
        const ref = Position.refFrom(x, y, z);

        this.blockRender.updateList({ add: [
            {id: this.data[idx], pos, ref}
        ]});
    }



    /** Load model from json */
    // FIXME: trimmed data
    static loadData(jsonOrString) {
        const info = typeof jsonOrString != 'string' ? jsonOrString : JSON.parse(jsonOrString);
        const model = new ModelData(info.size);
        const uint8 = hexToUint8(info.data);

        for (let i = 0 ; i < uint8.length ; i++) {
            model.data[i] = uint8[i];
        }
        //this.reloadBlocks(model);
        return model;
    }

    /** Dump data to json */
    // FIXME: trimmed data
    dump() {
        const info = {
            size: this.size,
            data: trimmedUint8ToHex(this.data)
        }

        return JSON.stringify(info, null, 2);
    }

    /**
     * Check if a block position is valid
     * @param {Position} pos 
     */
    checkPos(pos) {
        return !(pos.y < 0 || pos.y >= this.size ||
                 pos.x < 0 || pos.x >= this.size ||
                 pos.z < 0 || pos.z >= this.height);
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

        const rem = this.data[idx];
        this.data[idx] = id;
        
        if (this.blockRender) {
            const ref = Position.refFrom(pos.x, pos.y, pos.z);
            this.blockRender.updateList({ add: [
                {id, pos, ref}
            ]});
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
}
