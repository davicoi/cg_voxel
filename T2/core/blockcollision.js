import Core from "./core.js";


export default class BlockCollision {
    /**
     * List of blocks where a collision can occur (in xz)
     * @param {number*} realX 
     * @param {number} realZ 
     * @returns {[{x: number, z: number}]}
     */
    static listXZ(realX, realZ) {
        let minX = Math.floor(realX);
        let maxX = minX == realX ? minX : Math.ceil(realX);
        let minZ = Math.floor(realZ);
        let maxZ = minZ == realZ ? minZ : Math.ceil(realZ);

        const list = [];
        for (let z = minZ ; z <= maxZ ; z++) {
            for (let x = minX ; x <= maxX ; x++) {
                list.push({x, z});
            }
        }

        return list;
    }


    /**
     * List of blocks where a collision can occur (in xyz)
     * @param {number} realX 
     * @param {number} realY 
     * @param {number} realZ 
     * @param {number} sizeY
     * @returns {[{x: number, y: number, z: number}]}
     */
    static listXYZ(realX, realY, realZ, sizeY = 1) {
        const xzList = BlockCollision.listXZ(realX, realZ);

        let y = Math.floor(realY);
        let maxY = Math.ceil(realY + sizeY);
        const list = [];
        
        for (; y < maxY ; y++) {
            xzList.forEach(xz => {
                list.push({x: xz.x, y: y, z: xz.z});
            });
        }

        return list;
    }


    /**
     * Check if a block is colliding
     * @param {*} realX 
     * @param {*} realY 
     * @param {*} realZ 
     * @param {*} sizeY 
     * @returns {boolean}
     */
    static checkBlockCollision(realX, realY, realZ, sizeY = 1) {
        const list = BlockCollision.listXYZ(realX, realY, realZ, sizeY);
        const map = Core.getInstance().mapData;
        if (!map)
            return;

        for (let i = 0 ; i < list.length ; i++) {
            if (map.get({x: list[i].x, y: list[i].y, z: list[i].z}) != 0)
                return true;
        }
        return false;
    }
}
