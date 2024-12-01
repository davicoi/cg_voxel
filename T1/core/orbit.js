import * as THREE from    '../../build/three.module.js';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
import Conf from './conf.js';
import Core from './core.js';
import Position from './position.js';

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
    updateKeys((keyboard, delta)
*/



export default class OrbitCtl {
    _enable = false;

    /** @type {OrbitControls} */
    orbit;
    raycaster = new THREE.Raycaster();
    core = Core.getInstance();
    orbitPosition = new THREE.Vector3();
    lookAtVector = new THREE.Vector3();

    constructor(x, y, z) {
        this.init(x, y, z);
    }

    init(x, y, z) {
        this.orbit = new OrbitControls(this.core.camControl.camera, this.core.renderer.domElement);
        this.orbitPosition = typeof x !== 'undefined' ? new THREE.Vector3(x, y ,z) : this.core.camera.position.clone();
        
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

        this.orbit.enable = false;
        this.orbit.enabled = false;

        return this.orbit;
    }

    setTarget(x, y, z) {
        this.orbit.target.set(x, y, z);
    }

    enable(status) {
        this._enable = status == true;
        this.orbit.enable = this._enable;
        this.orbit.enabled = this._enable;

        if (status)
            this.restore();
        else
            this.save();
    }

    save() {
        this.orbitPosition.copy(this.core.camera.position);
        this.core.camera.getWorldDirection(this.lookAtVector);
    }

    restore() {
        this.core.camera.position.copy(this.orbitPosition);
        this.core.camera.lookAt(this.lookAtVector);
        this.updatePos();
    }

    center() {
        const size = this.core.mapData.getSize();
        const centerX = parseInt(size / 2) * Conf.CUBE_SIZE;
        const centerZ = parseInt(size / 2) * Conf.CUBE_SIZE;

        this.setTarget(centerX, 0, centerZ);
        this.setPosition(centerX, 25, 35 + centerZ);
    }

    cam2Pos(x, y, z) {
        const pos = new Position(
            x / Conf.CUBE_SIZE + 0.01,
            y / Conf.CUBE_SIZE + 0.01,
            z / Conf.CUBE_SIZE + 0.01,
        );
        return pos;
    }

    setPosition(x, y, z) {
        this.core.camera.position.set(x, y, z);
        this.updatePos();
    }

    getPosition() {
        return this.cam2Pos(this.core.camera.position.x, this.core.camera.position.y, this.core.camera.position.z);
    }

    getPlanePosition() {
        this.raycaster.setFromCamera({x: 0, y: 0}, this.core.camera);
        let list = this.raycaster.intersectObject(this.core.workspace.workGrid.grid);
        if (list[0]) {
            return new Position(list[0].point.x / Conf.CUBE_SIZE | 0, 0, list[0].point.z / Conf.CUBE_SIZE | 0);
        } else {
            return null;
        }
    }

    update(delta) {
        if (!this._enable)
            return;
    }

    updatePos() {
        this.orbit.update();
    }

    updateKeys(keyboard, delta) {
    }
}
