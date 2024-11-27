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

    set(x, y, z) {
        this.x = x | 0;
        this.y = y | 0;
        this.z = z | 0;
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
        return  x.toString(16).padStart(WorldLimit.WIDTH_BYTES * 2, '0') +
                y.toString(16).padStart(WorldLimit.DEPTH_BYTES * 2, '0') +
                z.toString(16).padStart(WorldLimit.HEIGHT_BYTES * 2, '0');
    }

    static refFrom(x, y, z) {
        return  parseInt(x).toString(16).padStart(WorldLimit.WIDTH_BYTES * 2, '0') +
                parseInt(y).toString(16).padStart(WorldLimit.DEPTH_BYTES * 2, '0') +
                parseInt(z).toString(16).padStart(WorldLimit.HEIGHT_BYTES * 2, '0');
    }
}
