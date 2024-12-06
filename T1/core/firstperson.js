import * as THREE from '../../build/three.module.js';
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import Conf from './conf.js';
import Core from './core.js';
import Position from './position.js';
import CamCollision from './camcollision.js';

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

    /** @type {PointerLockControls} */
    firstPerson;
    core = Core.getInstance();
    lastPosition = new THREE.Vector3();
    lookAtVector = new THREE.Vector3();
    oldPos = new THREE.Vector3();

    camCollision = new CamCollision();

    constructor(x, y, z) {
        this.init(x, y, z);
    }

    init(x, y, z) {
        this.firstPerson = new PointerLockControls(this.core.camera, this.core.renderer.domElement);
        this.lastPosition = typeof x !== 'undefined' ? new THREE.Vector3(x, y,z) : this.core.camera.position.clone();
        //this.core.scene.add(this.pointerLock.getObject());
        
        this.firstPerson.enable = false;

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
        const centerX = parseInt(size / 2) * Conf.CUBE_SIZE;
        const centerZ = parseInt(size / 2) * Conf.CUBE_SIZE;
        const centerY = this.core.mapData.firstEmptyFrom(centerX, centerZ) * Conf.CUBE_SIZE;
    
        this.core.camControl.setPosition(centerX, centerY + Conf.CUBE_SIZE * 2, centerZ);
    }

    cam2Pos(x, y, z) {
        const camAddY = Conf.CUBE_SIZE / 3 * 2;
        const pos = new Position(
            x / Conf.CUBE_SIZE + 0.001,
            (y - camAddY) / Conf.CUBE_SIZE + 0.001,
            z / Conf.CUBE_SIZE + 0.001,
        );
        return pos;
    }

    getRealPos() {
        const camAddY = Conf.CUBE_SIZE / 3 * 2;
        return {
            x: this.core.camera.position.x / Conf.CUBE_SIZE,
            y: (this.core.camera.position.y - camAddY) / Conf.CUBE_SIZE,
            z: this.core.camera.position.z / Conf.CUBE_SIZE
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

        if (this.moveForward)           this.firstPerson.moveForward(speed * delta);
        else if (this.moveBackward)     this.firstPerson.moveForward(speed * -1 * delta);
    
        if (this.moveRight)             this.firstPerson.moveRight(speed * delta);
        else if (this.moveLeft)         this.firstPerson.moveRight(speed * -1 * delta);


        if (this.camCollision.horizontalCheck(this.getRealPos())) {
            this.core.camera.position.x = this.oldPos.x;
            //this.core.camera.position.y = pos.y;
            this.core.camera.position.z = this.oldPos.z;
        }

        // // "TEMPORARY colission detection"
        // const pos = this.getPosition();
        // const mapModel = this.core.workspace.getModelData();
        // if (mapModel.get(pos) >= 1) {
        //     this.core.camera.position.x = this.oldPos.x;
        //     //this.core.camera.position.y = pos.y;
        //     this.core.camera.position.z = this.oldPos.z;
        // }
    }

    updateKeys(keyboard, delta) {
        const keyList = [['A', 'moveLeft'], ['D', 'moveRight'], ['W', 'moveForward'], ['S', 'moveBackward']];
        keyList.forEach(([key, varName]) => {
            if (keyboard.down(key))
                this[varName] = true;
            else if (keyboard.up(key))
                this[varName] = false;
        });
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
}
