import * as THREE from    '../../build/three.module.js';
import { initCamera } from "../../libs/util/util.js";
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import Core from './core.js';
import Conf from './conf.js';
import Position from './position.js';

export default class CameraControls {
    active = null;
    orbitPosition;
    orbitLookAt = new THREE.Vector3();
    pointerLockPosition;
    pointerLookAt = new THREE.Vector3();

    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;
    rotateLeft = false;
    rotateRight = false;
    jumpActive = false;
    speed = 5;

    gravityActive = false;
    gravitySpeed = 5;
    gravityCurrentSpeed = 0;
    gravity = 10;
    
    /** @type {THREE.WebGLRenderer} */
    renderer;
    /** @type {THREE.PerspectiveCamera} */
    camera;
    /** @type {OrbitControls} */
    orbit;
    /** @type {PointerLockControls} */
    pointerLock;
    /** @type {Core} */
    core;

    raycaster = new THREE.Raycaster();
    

    constructor(renderer) {
        this.renderer = renderer;
        this.core = Core.getInstance();
    }

    init(x, y, z) {
        this.camera = initCamera(new THREE.Vector3(x, y, z));
        return this.camera;
    }

    initOrbit(x, y, z) {
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitPosition = typeof x !== 'undefined' ? new THREE.Vector3(x, y ,z) : this.camera.position.clone();
        
        // change Orbit mouse control, LEFT click is used to add blocks
        this.orbit.mouseButtons = {
            LEFT: '',
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.ROTATE
        };

        // target = center of map
        const size = this.core.mapData.getSize();
        const centerPos = parseInt(size / 2) * Conf.CUBE_SIZE;
        this.setTarget(centerPos, 0, centerPos);

        this.orbit.enable = !this.active
        if (!this.active) {
            this.active = this.orbit;
            if (typeof x !== 'undefined')
                this.camera.position.set(x, y, z);
        }
        this.update();
        return this.orbit;
    }

    initPointerLock(x, y, z) {
        this.pointerLock = new PointerLockControls(this.camera, this.renderer.domElement);
        this.pointerLockPosition = typeof x !== 'undefined' ? new THREE.Vector3(x, y,z) : this.camera.position.clone();
        //this.core.scene.add(this.pointerLock.getObject());
        
        if (!this.active) {
            this.active = this.pointerLock;
            this.restorePosition();
        }
    }

    updateKeys(keyboard) {
        if (this.isPointerLock()) {
            const keyList = [['A', 'moveLeft'], ['D', 'moveRight'], ['W', 'moveForward'], ['S', 'moveBackward'], ['J', 'jumpActive']];
            keyList.forEach(([key, varName]) => {
                if (keyboard.down(key))
                    this[varName] = true;
                else if (keyboard.up(key))
                    this[varName] = false;
            });
        }
    }

    savePosition() {
        if (!this.active)
            return;

        if (this.active == this.orbit) {
            this.orbitPosition = this.camera.position.clone();
            this.camera.getWorldDirection(this.orbitLookAt);
        } else if (this.active == this.pointerLock) {
            this.pointerLockPosition = this.camera.position.clone();
            this.camera.getWorldDirection(this.pointerLookAt);
        }
    }

    restorePosition() {
        if (!this.active)
            return;
        
        if (this.active == this.orbit) {
            this.camera.position.copy(this.orbitPosition);
            this.camera.lookAt(this.orbitLookAt);
            this.orbit.update();
        } else if (this.active == this.pointerLock) {
            this.camera.position.copy(this.pointerLockPosition);
            this.camera.lookAt(this.pointerLookAt);
        }
    }

    setTarget(x, y, z) {
        if (this.orbit)
            this.orbit.target.set(x, y, z);
    }

    update() {
        if (this.active && this.active == this.orbit)
            this.active.update();
    }

    updatePointerLock(delta) {
        if (!this.isPointerLock())
            return;

        if (!this.oldPos) {
            this.oldPos = this.camera.position.clone();
            this.oldY = this.core.mapData.firstEmptyFrom(Math.round(this.camera.position.x / Conf.CUBE_SIZE), Math.round(this.camera.position.z / Conf.CUBE_SIZE));
        }

        if (this.moveForward)
            this.pointerLock.moveForward(this.speed * delta);
        else if (this.moveBackward)
            this.pointerLock.moveForward(this.speed * -1 * delta);
    
        if (this.moveRight)
            this.pointerLock.moveRight(this.speed * delta);
        else if (this.moveLeft)
            this.pointerLock.moveRight(this.speed * -1 * delta);

        if (this.jumpActive)
            this.jump();


        // movement in XZ
        const pos = this.camToPosition();
        if (!this.canMove(pos)) {
            //this.camera.position.copy(this.oldPos);
            this.camera.position.x = this.oldPos.x;
            this.camera.position.z= this.oldPos.z;
        } else {
            this.oldPos.copy(this.camera.position);
        }
    }

    updateControl(delta) {
        this.updatePointerLock(delta);
        this.updateGravity(delta);
    }

    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }

    useOrbit() {
        if (this.orbit && this.pointerLock && this.active != this.orbit) {
            this.savePosition();
            this.pointerLock.unlock();
            this.pointerLock.enable = false;
            this.orbit.enable = true;
            this.active = this.orbit;
            this.restorePosition();
        }
    }

    usePointerLock() {
        if (this.pointerLock && this.orbit && this.active != this.pointerLock) {
            this.savePosition();
            this.orbit.enable = false;
            this.pointerLock.enable = true;
            this.active = this.pointerLock;
            this.restorePosition();
            this.pointerLock.lock();
        }
    }

    toggle() {
        if (this.active === this.orbit)
            this.usePointerLock();
        else
            this.useOrbit();
    }

    isOrbit() {
        return (this.orbit && this.active && this.active == this.orbit);
    }

    isPointerLock() {
        return (this.pointerLock && this.active && this.active == this.pointerLock);
    }

    centerCamera() {
        const core = Core.getInstance();
        const size = core.mapData.getSize();
        const centerX = parseInt(size / 2) * Conf.CUBE_SIZE;
        const centerZ = parseInt(size / 2) * Conf.CUBE_SIZE;
        const centerY = core.mapData.firstEmptyFrom(centerX, centerZ) * Conf.CUBE_SIZE;
    
        if (core.camControl.isOrbit()) {
            core.camControl.setTarget(centerX, 0, centerZ);
            core.camControl.setPosition(centerX, 25, 35 + centerZ);
            core.camControl.update();
    
        } else {
            core.camControl.setPosition(centerX, centerY + 2, centerZ);
        }
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

    jump() {
        if (this.gravityCurrentSpeed == 0)
            this.gravityCurrentSpeed = this.gravitySpeed;
    }

    updateGravity(delta) {
        const camAddY = Conf.CUBE_SIZE / 3 * 2;

        const pos = this.camToPosition();
        pos.y--;

        // minimum height at which the player can stand
        const isGround = this.core.mapData.get(pos) > 0;
        const minY = !isGround ? camAddY : (pos.y + 1) * Conf.CUBE_SIZE + camAddY;
        
        // gravity
        let y = this.camera.position.y;
        y += this.gravityCurrentSpeed * delta;
        this.gravityCurrentSpeed -= this.gravity * delta;

        // can't stay below the block
        if (y < minY) {    
            y = minY;
            this.gravityCurrentSpeed = 0;
            this.camera.position.y = minY;
            return;
        }
        this.camera.position.y = y;
    }

    camToPosition() {
        const camAddY = Conf.CUBE_SIZE / 3 * 2;
        const pos = new Position(
            this.camera.position.x / Conf.CUBE_SIZE + 0.01,
            (this.camera.position.y - camAddY) / Conf.CUBE_SIZE + 0.01,
            this.camera.position.z / Conf.CUBE_SIZE + 0.01,
        );
        return pos;
    }

    canMove(pos) {
        return (this.core.mapData.get(pos) == 0)
    }
}
