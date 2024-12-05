import * as THREE from    '../../build/three.module.js';
import { initCamera } from "../../libs/util/util.js";
import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import Core from './core.js';
import Conf from './conf.js';

import OrbitCtl from './orbit.js';
import FirstPersonCtl from './firstperson.js';

export default class CameraControls {
    /** @type {OrbitCtl|FirstPersonCtl} */
    active;
    orbit;
    firstPerson;
    
    speed = 5;
    gravityActive = true;
    gravitySpeed = 7.5;
    gravityCurrentSpeed = 0;
    gravity = 20;
    
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

    

    constructor(renderer) {
        this.core = Core.getInstance();
    }

    init(x, y, z) {
        this.camera = initCamera(new THREE.Vector3(x, y, z));
        return this.camera;
    }

    initOrbit(x, y, z) {
        this.orbit = new OrbitCtl(x, y, z);
        if (!this.active) {
            this.active = this.orbit;
            this.orbit.enable(true);
        }
    }

    initFirstPerson(x, y, z) {
        this.firstPerson = new FirstPersonCtl(x, y, z);
        if (!this.active) {
            this.active = this.firstPerson;
            this.firstPerson.enable(true);
        }
    }

    save() {
        this.active.save();
    }

    restorePosition() {
        this.active.restore();
    }

    setTarget(x, y, z) {
        if (this.active && this.active == this.orbit)
            this.orbit.setTarget(x, y, z);
    }

    update(delta) {
        if (!this.active)
            return;

        this.updateGravity(delta);
        this.active.update(delta, this.speed);
    }

    updateKeys(keyboard, delta) {
        this.active.updateKeys(keyboard, delta);
    }

    setPosition(x, y, z) {
        this.active.setPosition(x, y, z);
    }

    isOrbit() {
        return (this.active && this.active == this.orbit);
    }

    isFirstPerson() {
        return (this.active && this.active == this.firstPerson);
    }

    useOrbit() {
        if (this.orbit && this.firstPerson && this.active != this.orbit) {
            if (this.isLocked())
                this.unlock();

            this.active.enable(false);
            this.active = this.orbit;
            this.orbit.enable(true);
        }
    }

    useFirstPerson() {
        if (this.orbit && this.firstPerson && this.active != this.firstPerson) {
            this.active.enable(false);
            this.active = this.firstPerson;
            this.firstPerson.enable(true);
        }
    }

    toggle() {
        if (this.orbit && this.firstPerson) {
            if (this.active === this.orbit) {
                this.core.blockRender.enableFog(true);
                this.useFirstPerson();
            } else {
                this.core.blockRender.enableFog(false);
                this.useOrbit();
            }
        }
    }

    center() {
        this.active.center();
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
        if (!this.gravityActive || !this.isFirstPerson())
            return;

        const camAddY = Conf.CUBE_SIZE / 3 * 2;

        //const pos = this.camToPosition();
        const pos = this.active.getPosition();
        while (this.core.mapData.get(pos) > 0) {
            pos.y++;
            this.camera.position.y += Conf.CUBE_SIZE;
        }
        pos.y--;

        // minimum height at which the player can stand
        const isGround = this.core.mapData.get(pos) > 0;
        let minY = !isGround ? camAddY : (pos.y + 1) * Conf.CUBE_SIZE + camAddY;

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

    getPlanePosition() {
        return this.active ? this.active.getPlanePosition() : null;
    }

    lock() {
        if (this.isFirstPerson)
            this.firstPerson.lock();
    }

    unlock() {
        if (this.isFirstPerson)
            this.firstPerson.unlock();
    }

    isLocked() {
        return this.isFirstPerson() && this.firstPerson.isLocked() == true;
    }
}
