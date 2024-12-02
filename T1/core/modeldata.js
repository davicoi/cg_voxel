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

    // Sides
	static RIGHT = 0x20;
	static LEFT = 0x10;
	static TOP = 0x08;
	static BOTTOM = 0x04;
	static FRONT = 0x02;
	static BACK = 0x01;
	static ALL_SIDES = 0x3F;


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
        if (idx < 0)
            return false;

        if (pos.y > this.highestBlock && id)
            this.highestBlock = pos.y;

        this.data[idx] = id;
        return true;
    }

    /**
     * id of a block at a specific position
     * @param {Position} pos 
     */
    get(pos) {
        const idx = this.indexOf(pos)
        return idx < 0 ? -1 : this.data[idx];
    }

    /**
     * Iterate over existing blocks
     * @param {function} callback - callback(id, x, y, z)
     */
    forEachBlock(x, z, width, depth, callback) {
        const pos = new Position(0, 0, 0);
        const height = Math.max(this.highestBlock, this.height);

        width = Math.min(x + width, this.size);
        depth = Math.min(z + depth, this.size);

        let id;
        for (pos.y = 0 ; pos.y < height ; pos.y++) {
            for (pos.z = z ; pos.z < depth ; pos.z++) { 
                for (pos.x = x ; pos.x < width ; pos.x++) {
                    id = this.get(pos);
                    if (id < 1)
                        continue;
                    callback(this.get(pos), pos.x, pos.y, pos.z);
                }
            }
        }
    }

    /**
     * 
     * @param {ModelData} model 
     * @param {Position} pos 
     */
    addModel(model, pos) {
        const destPos = new Position();
        const center = model.center;

        model.forEachBlock(0, 0, model.getSize(), model.getSize(), (id, x, y, z) => {
            destPos.set(pos.x + x - center.x, pos.y + y - center.y, pos.z + z - center.z);
            this.set(id, destPos);
        });
    }

    firstEmptyFrom(x, z) {
        const max = Math.max(this.height, this.highestBlock + 1);
        x = x | 0;
        z = z | 0;
        for (let y = 0 ; y < max ; y++) {
            if (this.get({x, y, z}) == 0)
                return y;
        }
        return -1;
    }

    countNeighbors(pos) {
        let idx = this.indexOf(pos);
        let count = 0;
        const size = this.size;
        const ysize = size * size;

        if (pos.x - 1 < 0 || pos.x - 1 >= size || this.data[idx - 1])
            count++;
        if (pos.x + 1 < 0 || pos.x + 1 >= size || this.data[idx + 1])
            count++;

        if (pos.z - 1 < 0 || pos.z - 1 >= size || this.data[idx - size])
            count++;
        if (pos.z + 1 < 0 || pos.z + 1 >= size || this.data[idx + size])
            count++;

        if (pos.y - 1 < 0 || pos.y - 1 >= this.height || this.data[idx - ysize])
            count++;
        if (pos.y + 1 < 0 || pos.y + 1 >= this.height || this.data[idx + ysize])
            count++;

        return count;
    }

    neighbors(pos) {
        let idx = this.indexOf(pos);
        let sides = 0;
        const size = this.size;
        const ysize = size * size;

        if (pos.x - 1 < 0 || pos.x - 1 >= size || this.data[idx - 1])    
            sides |= ModelData.LEFT;
        if (pos.x + 1 < 0 || pos.x + 1 >= size || this.data[idx + 1])
            sides |= ModelData.RIGHT;

        if (pos.z - 1 < 0 || pos.z - 1 >= size || this.data[idx - size])
            sides |= ModelData.BACK;
        if (pos.z + 1 < 0 || pos.z + 1 >= size || this.data[idx + size])
            sides |= ModelData.FRONT;
        
        if (pos.y - 1 < 0 || pos.y - 1 >= this.height || this.data[idx - ysize])
            sides |= ModelData.BOTTOM;
        if (pos.y + 1 < 0 || pos.y + 1 >= this.height || this.data[idx + ysize])
            sides |= ModelData.TOP;

        return sides;
    }

    sidesVisibility(sides) {
        return ~sides & ModelData.ALL_SIDES;
    }
}
