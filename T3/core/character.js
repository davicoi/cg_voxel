import * as THREE from    '../../build/three.module.js';
import BlockCollision from './blockcollision.js';
import Conf from './conf.js';
import Core from "./core.js";
import Position from './position.js';

// TODO: gravity
// TODO: keys for main character

export default class Character {
    speed = 4;
    modelName;
    gravityActive = true;
    gravitySpeed = 8.5;
    gravityCurrentSpeed = 0;
    gravity = 20;
    jumping = false;
    enabled = true;

    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;

    /** @type {THREE.Object3D} */
    obj;
    model;
    /** @type {THREE.AnimationMixer} */
    mixer;

    center = {x: 0, y: 0, z: 0};

    /** @type {Core} */
    core;

    constructor(modelName) {
        this.core = Core.getInstance();

        this.scale = 1;
        this.addPos = new THREE.Vector3(0, 0, 0);
    }

    static async create(modelName) {
        const core = Core.getInstance();
        const model = await core.models.wait(modelName);

        const character = new Character(modelName);
        character.modelName = modelName;

        character.model = model;
        character.obj = model.scene;
        character.calcCenter();

        character.mixer = new THREE.AnimationMixer(character.obj);
        character.mixer.clipAction(model.animations[0]).play();
        
        return character;
    }

    show() {
        this.obj.visible = true;
        this.enabled = true;
    }
    hide() {
        this.obj.visible = false;
        this.enabled = false;
        this.moveLeft = this.moveRight = this.moveForward = this.moveBackward = false;
    }
    isEnabled() {
        return this.enabled;
    }

    calcCenter() {
        const box = new THREE.Box3().setFromObject(this.obj);
        const center = box.getSize(new THREE.Vector3());
        center.x = -center.x/2;
        center.y = 0;
        center.z = -center.z/2;
        this.center.x = center.x;
        this.center.y = center.y;
        this.center.z = center.z;
    }

    getModel() {
        return this.model;
    }

    /**
     * @returns {THREE.Object3D}
     */
    getObject3D() {
        return this.obj;
    }

    loaded() {
        return this.obj ? true : false;
    }

    async wait() {
        return await core.models.wait(this.modelName);
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
        if (!this.gravityActive || !this.loaded())
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
        let curY = Math.floor(y + 0.0001 - this.center.y);
        if (BlockCollision.checkBlockCollision(obj.position.x, curY, obj.position.z)) {
            this.gravityCurrentSpeed = 0;
            y = curY + 1 + this.center.y;
            obj.position.y = y < 0 ? 0 : y;
            return;
        }
        obj.position.y = y < 0 ? 0 : y;

        this.jumping = (Math.abs((y - this.center.y + 0.0001) % 1) > 0.001);
    }

    jump() {
        if (this.gravityCurrentSpeed == 0 && this.isEnabled())
            this.gravityCurrentSpeed = this.gravitySpeed;
    }

    updateKeys(keyboard, delta) {
        if (!this.isEnabled())
            return;

        const keyList = [
            ['A', 'moveLeft'], ['D', 'moveRight'], ['W', 'moveForward'], ['S', 'moveBackward'],
            ['left', 'moveLeft'], ['right', 'moveRight'], ['up', 'moveForward'], ['down', 'moveBackward']
        ];
        keyList.forEach(([key, varName]) => {
            if (keyboard.down(key))
                this[varName] = true;
            else if (keyboard.up(key))
                this[varName] = false;
        });
    }

    // FIXME: main player's movement angle, create generic version
    update(delta) {
        if (!this.isEnabled())
            return;

        // model
        this.modelRotation();

        const obj = this.obj;
        let x = obj.position.x;
        let z = obj.position.z;

        // movement relative to camera
        if (this.moveForward || this.moveBackward || this.moveRight || this.moveLeft) {
            const rad = obj.rotation.y + Math.PI / 2;
            x += -Math.cos(rad) * this.speed * delta;
            z += Math.sin(rad) * this.speed * delta;
        }

        // animation
        let deltaDir = delta;
        if (this.moveForward || this.moveBackward || this.moveRight || this.moveLeft || this.jumping) {
            if (this.jumping)
                deltaDir *= 4;
            this.mixer.update(deltaDir);
        }

        // collision
        let y = Math.round(obj.position.y - this.center.y);
        if (!BlockCollision.checkBlockCollision(x, y, z))
            obj.position.set(x, obj.position.y, z);

        this.updateGravity(delta);
    }

    modelRotation() {
        if (!this.moveForward && !this.moveBackward && !this.moveRight && !this.moveLeft)
            return;

        let xDeg = 0, yDeg = 0;
        if (this.moveRight)                  xDeg = 270;
        else if (this.moveLeft)              xDeg = 90;
        if (this.moveForward)                yDeg = 0;
        else if (this.moveBackward)          yDeg = 180;

        const rotX = this.moveRight || this.moveLeft;
        const rotY = this.moveForward || this.moveBackward;

        
        let deg = xDeg + yDeg;
        if (rotX && rotY)
            deg /= 2;

        if (this.moveForward && this.moveRight)
            deg = 315;

        // add camera angle
        const camAngle = this.core.angleCameraPlayer().deg;
        deg += camAngle - 180;
        deg %= 360;

        if (deg < 0)
            deg += 360;
        this.obj.rotation.y = THREE.MathUtils.degToRad(deg);
    }

    getPosition() {
        let y = Math.round(this.obj.position.y - this.center.y);
        return {x: this.obj.position.x, y, z: this.obj.position.z};
    }

    getY() {
        return Math.round(this.obj.position.y - this.center.y);
    }
}
