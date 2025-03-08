import * as THREE from    '../../build/three.module.js';
import {GLTFLoader} from '../../build/jsm/loaders/GLTFLoader.js';

const MODELS_PATH = 'assets/models/';

const modelList = {
    'player': 'steve.glb'       // y+0.4, scale=1.85/3.6
}

// Async models loader
export default class ModelsLoader {
    list = {};

    constructor() {
        if (ModelsLoader.instance)
            throw new ReferenceError("ERROR: Only 1 instance of ModelsLoader() is allowed.");
        ModelsLoader.instance = this;

        this.loadAll();
    }

    static getInstance() {
        if (!ModelsLoader.instance)
            ModelsLoader.instance = new ModelsLoader();
        return ModelsLoader.instance;
    }

    /** Load a model */
    load(name, filename) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(MODELS_PATH + filename, (gltf) => {
                const obj = gltf.scene;
                obj.traverse((child) => {
                    child.castShadow = true;
                });

                this.list[name] = gltf;
                console.info(`Model ${name} loaded`);
                resolve(gltf);

            }, undefined, (err) => {
                console.error(err);
                reject(err);
            });
        });
    }

    /** Load all models */
    loadAll() {
        const list = [];
        for (const name in modelList) {
            list.push(this.load(name, modelList[name]));
        }
        return Promise.all(list);
    }

    /** Get a cached model by name */
    get(name) {
        return this.list[name] || null;
    }

    /** Wait for a model to be loaded */
    wait(name, timeout = 0) {
        const init = Date.now();

        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (this.list[name]) {
                    clearInterval(interval);
                    resolve(this.list[name]);
                } else if (timeout > 0) {
                    if (Date.now() - init > timeout) {
                        clearInterval(interval);
                        reject(new Error(`Model ${name} not loaded`));
                    }
                }

            }, 100);
        });
    }

    setCastShadow(enable) {
        for (const mname in this.list) {
            const glft = this.list[mname];
            const obj = glft.scene;
            obj.traverse((child) => {
                child.castShadow = enable;
            });
        }
    }
}
