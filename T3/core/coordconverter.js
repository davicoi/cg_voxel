import Conf from "./conf.js"
import Position from "./position.js";
import WorldModel from "./worldmodel.js";


/**
 * Convert coordinates (Block <-> Real coord) (Static)
 */
export default class CoordConverter {
    constructor() {
        throw new ReferenceError("ERROR: This class is not instantiable. Use your methods statically.")
    }

    /**
     * Checks if a position is valid
     * @param {Position} pos 
     * @returns {boolean}
     */
    static checkPos(pos) {
        return WorldModel.getModel().checkPos(pos);
    }

    /**
     * Convert block position to real position
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {Position}
     */
    static block2RealPosition(x, y, z) {
        const size = Conf.CUBE_SIZE;

        return new Position(
            x * size,
            y * size,
            z * size
        );
    }

    /**
     * Convert real position to block position
     * @param {{x, y, z}} pos 
     * @returns {Position}
     */
    static real2BlockPosition(x, y, z) {
        const size = Conf.CUBE_SIZE;
        
        return new Position(
            x / size | 0,
            y / size | 0,
            z / size | 0
        );
    }
}
