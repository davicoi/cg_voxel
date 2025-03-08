import * as THREE from    '../../build/three.module.js';
import { initCamera, onWindowResize } from "../../libs/util/util.js";
import Core from './core.js';

import OrbitCtl from './orbit.js';
import FirstPersonCtl from './firstperson.js';
import Cursor from './cursor.js';

export default class CameraControls {
    /** @type {OrbitCtl|FirstPersonCtl} */
    active;
    /** @type {OrbitCtl} */
    orbit;
    /** @type {FirstPersonCtl} */
    firstPerson;
    /** @type {number} */
    cursor;
    
    speed = 5;
    
    /** @type {THREE.WebGLRenderer} */
    renderer;
    /** @type {THREE.PerspectiveCamera} */
    camera;
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

    initCursor() {
        this.cursor = new Cursor();
        this.showCursor(false);
    }

    showCursor(enable) {
        if (this.cursor)
            this.cursor.show(enable);
    }

    resize() {
        onWindowResize(this.core.camera, this.core.renderer);
        if (this.cursor)
            this.cursor.centralize();
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
        if (this.active === this.orbit) {
            this.useFirstPerson();
            this.core.fog.enable(true);
        } else {
            this.useOrbit();
            this.core.fog.enable(false);
        }
    }

    centralize() {
        this.active.center();
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
