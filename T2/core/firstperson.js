import * as THREE from '../../build/three.module.js';
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import Conf from './conf.js';
import Core from './core.js';
import Position from './position.js';
import CamCollision from './camcollision.js';

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
    // moveForward = false;
    // moveBackward = false;
    // moveLeft = false;
    // moveRight = false;

    /** @type {PointerLockControls} */
    firstPerson;
    /** @type {Core} */
    core;
    lastPosition = new THREE.Vector3();
    lookAtVector = new THREE.Vector3();
    oldPos = new THREE.Vector3();

    /** @type {CamCollision} */
    camCollision;

    hangle = 270;
    vangle = 30;
    dist = 7;
    sensivity = Conf.MOUSE_SENSIVITY;
    yDirMult = 1;

    constructor(x, y, z) {
        this.core = Core.getInstance();
        this.camCollision = new CamCollision();

        this.init(x, y, z);
    }

    init(x, y, z) {
        this.firstPerson = new PointerLockControls(this.core.camera, this.core.renderer.domElement);
        this.lastPosition = typeof x !== 'undefined' ? new THREE.Vector3(x, y,z) : this.core.camera.position.clone();
        this.firstPerson.enable = false;

        // show/hide "game cursor"
        this.firstPerson.addEventListener('lock', () => {
            if (this.core.camControl.cursor)
                // this.core.camControl.cursor.show(true);
                this.core.camControl.cursor.show(false);
        });
        this.firstPerson.addEventListener('unlock', () => {
            if (this.core.camControl.cursor)
                this.core.camControl.cursor.show(false);
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
        const p = this.core.playerModel.obj.position;
        return new Position(p.x, p.y, p.z);
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

        // if (this.moveForward)           this.firstPerson.moveForward(speed * delta);
        // else if (this.moveBackward)     this.firstPerson.moveForward(speed * -1 * delta);
    
        // if (this.moveRight)             this.firstPerson.moveRight(speed * delta);
        // else if (this.moveLeft)         this.firstPerson.moveRight(speed * -1 * delta);

        if (!this.core.playerModel?.loaded())
            return;
        const obj = this.core.playerModel.getObject3D();

        const hrad = this.hangle * Math.PI / 180;
        const vrad = this.vangle * Math.PI / 180;

        // vertical camera position
        const y = obj.position.y + Math.sin(vrad) * this.dist;
        const hdist = Math.cos(vrad) * this.dist;

        // horitonzal camera position
        const x = obj.position.x + Math.cos(hrad) * hdist;
        const z = obj.position.z + Math.sin(hrad) * hdist;

        // adjusts position to a fixed distance from the player
        const newPos = new THREE.Vector3(x, y, z);
        const dir = new THREE.Vector3();
        dir.subVectors(newPos, obj.position)
            .normalize()
            .multiplyScalar(this.dist)
            .add(obj.position);

        // camera cannot be below the ground
        const camPos = new Position(dir.x, dir.y, dir.z);
        const minY = this.core.mapData.firstEmptyFrom(camPos.x, camPos.z) + 0.3;
        if (dir.y < minY)
            dir.y = minY;

        this.core.camera.position.copy(dir);
        this.core.camera.lookAt(obj.position);
    }

    updateKeys(keyboard, delta) {
        if (!this._enable)
            return;

        if (keyboard.down('Y'))
            this.yDirMult = this.yDirMult == 1 ? -1 : 1;

        // const keyList = [['J', 'moveLeft'], ['L', 'moveRight'], ['I', 'moveForward'], ['K', 'moveBackward']];
        // keyList.forEach(([key, varName]) => {
        //     if (keyboard.down(key))
        //         this[varName] = true;
        //     else if (keyboard.up(key))
        //         this[varName] = false;
        // });
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
        if (!this._enable)
            return;

        this.hangle += deltaX * this.sensivity;
        this.hangle %= 360;

        this.vangle += deltaY * this.sensivity * this.yDirMult;
        this.vangle %= 360;
        if (this.vangle < -89)
            this.vangle = -89;
        else if (this.vangle > 89)
            this.vangle = 89;
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
