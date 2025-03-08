import * as THREE from '../../build/three.module.js';
import Blocks from "./blocks.js";
import MaterialList from './materiallist.js';


export default class TemporaryBlock {
    static fadeTimeout = 2;
    static list = [];
    fadeDuration = 2;
    fadeElapsed = 0;
    interval;
    curTime;

    /** @type {THREE.Mesh} */
    mesh;

    constructor(x, y, z, tileId, scene, duration = -1) {
        this.mesh = this.create(x, y, z, tileId, scene);
        this.fadeDuration = duration > 0 ? duration :TemporaryBlock.fadeTimeout;
        this.fadeElapsed = 0;
        this.initTimer();
    }

    static setDefaultFadeTimeout(timeout) {
        TemporaryBlock.fadeTimeout = timeout;
    }

    create(x, y, z, tileId, scene) {
        const blocks = Blocks.getInstance();
        const materialList = MaterialList.getInstance();

        const geometry = blocks.getCube(Blocks.ALL_SIDES, tileId);
        /** @type {THREE.MeshLambertMaterial} */
        const material = materialList.get(`blocks`).clone();
        //material.orde
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 100;
        mesh.position.set(x, y, z);
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        scene.add(mesh);
        TemporaryBlock.list.push(this);

        return mesh;
    }

    initTimer() {
        this.curTime = Date.now();
        this.interval = setInterval(() => {
            let now = Date.now();
            let delta = (now - this.curTime) / 1000;
            this.curTime = now;
            this.update(delta);
        }, 1/20);
    }

    update(delta) {
        this.fadeElapsed += delta;
        if (this.fadeElapsed < TemporaryBlock.fadeTimeout) {
            this.mesh.material.opacity = 1 - (this.fadeElapsed / TemporaryBlock.fadeTimeout);

        } else {
            clearInterval(this.interval);
            this.mesh.parent.remove(this.mesh);
            this.mesh.material.dispose();
            this.mesh = null;
            TemporaryBlock.list.splice(TemporaryBlock.list.indexOf(this), 1);
        }
    }
}
