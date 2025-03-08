import * as THREE from '../../build/three.module.js';
import Position from './position.js';
import Core from './core.js';
import BlockCollision from './blockcollision.js';
import Conf from './conf.js';


export default class Gravity {
    /** @type {THREE.Object3D} */
    obj;
    speed = 4;
    gravityActive = true;
    gravitySpeed = 8.5;
    gravityCurrentSpeed = 0;
    gravity = 20;
    jumping = false;
    addY = 0;

    /**
     * 
     * @param {THREE.Object3D} obj qualquer objet alvo que a propriedade position
     * @param {*} addY valor a ser adicionado no Y para ajustar a altura
     */
    constructor(obj, addY = 0) {
        this.setObj(obj);
        this.addY = addY;
    }

    setObj(obj) {
        this.obj = obj;
    }

    getObj() {
        return this.obj;
    }

    enableGravity(enable) {
        if (enable) {
            this.gravityCurrentSpeed = 0;
            this.gravityActive = true;
        } else {
            this.gravityCurrentSpeed = 0;
            this.gravityActive = false;
        }
    }

    updateGravity(delta) {
        if (!this.gravityActive || !this.obj)
            return;

        const core = Core.getInstance();
        const obj = this.obj;

        const pos = new Position(obj.position.x, obj.position.y, obj.position.z);
        while (core.mapData.get(pos) > 0 && pos.y >= 1) {
            pos.y++;
            obj.position.y += Conf.CUBE_SIZE;
        }
        pos.y--;

        // gravity
        let y = obj.position.y;
        y += this.gravityCurrentSpeed * delta;
        this.gravityCurrentSpeed -= this.gravity * delta;

        // checks if there was any collision with the lower blocks
        let curY = Math.floor(y + 0.0001 - this.addY);
        if (BlockCollision.checkBlockCollision(obj.position.x, curY, obj.position.z)) {
            this.gravityCurrentSpeed = 0;
            y = curY + 1 + this.addY;
            obj.position.y = y < 0 ? 0 : y;
            return;
        }
        obj.position.y = y < 0 ? 0 : y;

        this.jumping = (Math.abs((y - this.addY + 0.0001) % 1) > 0.001);
    }

    jump() {
        if (this.gravityCurrentSpeed == 0)
            this.gravityCurrentSpeed = this.gravitySpeed;
    }
}
