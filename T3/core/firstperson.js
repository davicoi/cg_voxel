import * as THREE from '../../build/three.module.js';
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import Conf from './conf.js';
import Core from './core.js';
import Position from './position.js';
import CamCollision from './camcollision.js';
import Gravity from './gravity.js';
import BlockCollision from './blockcollision.js';

// https://codepen.io/Fyrestar/pen/zYqjNOL

/*
    init(x, y, z)
    enable(status)

    save()
    restore()
    center()
    
    setPosition(x, y, z)
    getPosition()
    getPlanePosition()
    
    update(delta)
    updateKeys(keyboard, delta)
*/



export default class FirstPersonCtl {
    _enable = false;
    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;
    headPosY = 1.78;

    /** @type {PointerLockControls} */
    firstPerson;
    /** @type {Core} */
    core;
    lastPosition = new THREE.Vector3();
    lookAtVector = new THREE.Vector3();
    oldPos = new THREE.Vector3();

    /** @type {CamCollision} */
    camCollision;
    /** @type {Gravity} */
    gravity;

    hangle = 270;
    vangle = 30;
    dist = 7;
    yDirMult = 1;
    sensivity = Conf.MOUSE_SENSIVITY;
    onlyLockedMov = true;

    constructor(x, y, z) {
        this.core = Core.getInstance();
        this.camCollision = new CamCollision();

        this.init(x, y, z);

        this.gravity = new Gravity(this.core.camera, this.headPosY);
    }

    init(x, y, z) {
        this.firstPerson = new PointerLockControls(this.core.camera, this.core.renderer.domElement);
        this.lastPosition = typeof x !== 'undefined' ? new THREE.Vector3(x, y,z) : this.core.camera.position.clone();
        this.firstPerson.enable = false;

        // show/hide "game cursor"
        this.firstPerson.addEventListener('lock', () => {
            this.core.camControl.showCursor(true);
        });
        this.firstPerson.addEventListener('unlock', () => {
            this.core.camControl.showCursor(false);
        });

        return this.firstPerson;
    }

    enable(status) {
        this._enable = status == true;
        this.firstPerson.enable = this._enable;

        if (status)
            this.restore();
        else
            this.save();
    }

    save() {
        this.lastPosition.copy(this.core.camera.position);
        this.core.camera.getWorldDirection(this.lookAtVector);
    }

    restore() {
        this.core.camera.position.copy(this.lastPosition);
        this.core.camera.lookAt(this.lookAtVector);
    }

    center() {
        const size = this.core.mapData.getSize();
        const centerX = parseInt(size / 2);
        const centerZ = parseInt(size / 2);
        const centerY = this.core.mapData.firstEmptyFrom(centerX, centerZ);
    
        this.core.camControl.setPosition(centerX, centerY + 2, centerZ);
    }

    // center position used by the chunk system
    cam2Pos(x, y, z) {
        if (x === undefined) {
            x = this.core.camera.position.x;
            y = this.core.camera.position.y;
            z = this.core.camera.position.z;
        }
        return new Position(x, y - this.headPosY, z);
    }

    getRealPos() {
        return {
            x: this.core.camera.position.x,
            y: this.core.camera.position.y,
            z: this.core.camera.position.z
        }
    }

    setPosition(x, y, z) {
        this.core.camera.position.set(x, y, z);
    }

    getPosition() {
        return this.cam2Pos(this.core.camera.position.x, this.core.camera.position.y, this.core.camera.position.z);
    }

    getPlanePosition() {
        return this.getPosition();
    }

    update(delta, speed) {
        if (!this._enable)
            return;

        this.oldPos.copy(this.core.camera.position);

        const obj = this.core.camera;
        let oldX = obj.position.x;
        let oldZ = obj.position.z;


        if (this.moveForward)           this.firstPerson.moveForward(speed * delta);
        else if (this.moveBackward)     this.firstPerson.moveForward(speed * -1 * delta);
    
        if (this.moveRight)             this.firstPerson.moveRight(speed * delta);
        else if (this.moveLeft)         this.firstPerson.moveRight(speed * -1 * delta);


        // collision
        let y = Math.round(obj.position.y - this.headPosY);
        if (BlockCollision.checkBlockCollision(obj.position.x, y, obj.position.z))
            obj.position.set(oldX, obj.position.y, oldZ);

        //this.updateGravity(delta);
        this.gravity.updateGravity(delta);

        // FIXME: *******
        if (this.core?.playerModel?.obj)
            this.core?.playerModel?.obj.position.set(obj.position.x, obj.position.y - this.headPosY, obj.position.z);
    }

    updateKeys(keyboard, delta) {
        if (!this._enable)
            return;

        if (keyboard.down('Y'))
            this.yDirMult = this.yDirMult == 1 ? -1 : 1;

        const keyList = [
            ['A', 'moveLeft'], ['D', 'moveRight'], ['W', 'moveForward'], ['S', 'moveBackward'],
            ['left', 'moveLeft'], ['right', 'moveRight'], ['up', 'moveForward'], ['down', 'moveBackward'],
            ['']
        ];
        keyList.forEach(([key, varName]) => {
            if (keyboard.down(key))
                this[varName] = true;
            else if (keyboard.up(key))
                this[varName] = false;
        });
    }

    jump() {
        this.gravity.jump();
    }

    lock() {
        this.firstPerson.lock();
    }

    unlock() {
        this.firstPerson.unlock();
    }

    isLocked() {
        return this.firstPerson.isLocked;
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    onMouseMove(deltaX, deltaY) {
/*        if (this.onlyLockedMov && !this.core.camControl.isLocked())
            return;

        if (!this._enable)
            return;

        this.hangle += deltaX * this.sensivity;
        this.hangle %= 360;

        this.vangle += deltaY * this.sensivity * this.yDirMult;
        this.vangle %= 360;
        if (this.vangle < -89)
            this.vangle = -89;
        else if (this.vangle > 89)
            this.vangle = 89;*/
    }

    addDistance(dist) {
        if (!this._enable)
            return;

        this.dist += dist;
        if (this.dist < 5)
            this.dist = 5;
        else if (this.dist > 20)
            this.dist = 20;
    }
}
