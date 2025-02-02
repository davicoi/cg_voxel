import WorldLimit from "./worldlimit.js";

/**
 * Block position (block position != three js position)
 */
export default class Position {
    x;
    y;
    z;

    /**
     * Position of blocks (non real position)
     */
    constructor(x = 0, y = 0, z = 0) {
        this.set(x, y, z);
    }

    static createFromArray(ar) {
        return new Position(ar.x, ar.y, ar.z);
    }

    set(x, y, z) {
        this.x = Math.round(x);
        this.y = Math.round(y);
        this.z = Math.round(z);
    }

    add(x, y, z) {
        this.x += x;
        this.y += y;
        this.z += z;
    }

    clone() {
        return new Position(this.x, this.y, this.z);
    }

    getRef() {
        const str = this.y.toString(16).padStart(WorldLimit.DEPTH_BYTES * 2, '0') +
                    this.x.toString(16).padStart(WorldLimit.WIDTH_BYTES * 2, '0') +
                    this.z.toString(16).padStart(WorldLimit.HEIGHT_BYTES * 2, '0');
        return str;
    }

    static refFrom(x, y, z) {
        const str = parseInt(y).toString(16).padStart(WorldLimit.DEPTH_BYTES * 2, '0') +
                    parseInt(x).toString(16).padStart(WorldLimit.WIDTH_BYTES * 2, '0') +
                    parseInt(z).toString(16).padStart(WorldLimit.HEIGHT_BYTES * 2, '0');
        return str;
    }
}
