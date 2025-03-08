import * as THREE from  '../../build/three.module.js';
import Conf from './conf.js';
import Core from './core.js';
import Position from './position.js';



export default class CamCollision {
    camBox = new THREE.Box3();
    camSize = new THREE.Vector3(Conf.CUBE_SIZE*0.95, Conf.CUBE_SIZE*0.95, Conf.CUBE_SIZE*0.95);
    camPos = new THREE.Vector3();
    cubeBox = new THREE.Box3();
    cubeSize = new THREE.Vector3(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE);
    cubePos = new THREE.Vector3();
    core;

    constructor() {
        this.core = Core.getInstance();
    }

    setCamPosition(pos) {
        this.camPos.set(pos.x, pos.y, pos.z);
        this.camBox.setFromCenterAndSize(this.camPos, this.camSize);
    }

    setCubePosition(x, y, z) {
        const halfBlock = 0;
        this.cubePos.set(Math.floor(x) - halfBlock, Math.floor(y)  - halfBlock, Math.floor(z) - halfBlock);
        this.cubeBox.setFromCenterAndSize(this.cubePos, this.cubeSize);
    }

    /**
     * Check if camera is colliding with a block
     * @param {*} camPos 
     * @param {*} plane_xz check XZ plane
     * @param {*} bottom check bottom (y - 1)
     * @param {*} top check top (y + 1)
     * @returns 
     */
    check(camPos, plane_xz = true, bottom = true, top = true) {
        // camera position
        if (!camPos)
            return false;
        this.setCamPosition(camPos);

        // neightbors to check
        const pos = new Position(camPos.x, camPos.y, camPos.z);
        const neighborsList = [];
        if (bottom)
            neighborsList.push([pos.x, pos.y - 1, pos.z]);
        if (plane_xz) {
            neighborsList.push(
                [pos.x + 1, pos.y, pos.z], [pos.x - 1, pos.y, pos.z],
                [pos.x, pos.y, pos.z + 1], [pos.x, pos.y, pos.z - 1],
            );
        }
        if (top)
            neighborsList.push([pos.x, pos.y + 1, pos.z]);

        // check each neighbor
        let typeId;
        for (let i = 0; i < neighborsList.length; i++) {
            pos.set(neighborsList[i][0], neighborsList[i][1], neighborsList[i][2]);
            typeId = this.core.mapData.get(pos);
            if (typeId < 1)
                continue;

            this.setCubePosition(neighborsList[i][0], neighborsList[i][1], neighborsList[i][2]);
            if (this.camBox.intersectsBox(this.cubeBox))
                return true;
        }
        return false;
    }

    /** check if camera is colliding with a block on  the XZ plane */
    horizontalCheck(pos) {
        return this.check(pos, true, false, false);
    }

    /** check if camra is colliding with a block on the Y axis */
    verticalCheck(pos) {
        return this.check(pos, false, true, true);
    }
    
    /** check if camera is colliding with "the ground" */
    bottomCheck(pos) {
        return this.check(pos, false, true, false);
    }

    /** get camera position without rounding */
    getCamPosition() {
        if (!this.core.camControl.isFirstPerson())
            return null;

        return this.core.camControl.firstPerson.getRealPos();
    }

    /** convert camera position to block position */
    cam2Pos(pos) {
        return this.core.camControl.firstPerson.cam2Pos(pos.x, pos.y, pos.z);
    }
}
