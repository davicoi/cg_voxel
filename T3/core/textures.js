import * as THREE from '../../build/three.module.js';
import { CubeTextureLoaderSingleFile } from '../../libs/util/cubeTextureLoaderSingleFile.js';
import Conf from './conf.js';

const textureList = [
    { name: 'blocks', img: 'blocks.png' },
    { name: 'skybox', img: 'skybox.png', skybox: true }
];

export default class Textures {
    list = {};
    count = 0;
    static instance = null;

    constructor() {
        if (Textures.instance)
            throw new ReferenceError("ERROR: Only 1 instance of Textures() is allowed.");
        Textures.instance = this;

        this.loadAll();
    }

    static getInstance() {
        if (!Textures.instance)
            new Textures();
        return Textures.instance;
    }

    loadSkybox(texId) {
        const info = textureList[texId];
        console.log(`${Conf.TEXTURE_PATH}${info.img}`)
        let skybox = new CubeTextureLoaderSingleFile().loadSingle(`${Conf.TEXTURE_PATH}${info.img}`, 1, (texture) => {
            console.info(`Skybox "${textureList[i].img}" loaded`);
            list[textureList[i].name] = texture;
            this.incCount();
        }, undefined, (err) => {
            console.info(`Skybox "${textureList[i].img}" failed to load`);
            this.incCount();
        });
        skybox.isSkybox = true;
        this.list[info.name] = skybox;
    }

    loadAll() {
        const loader = new THREE.TextureLoader();
        const list = this.list;

        for (let i = 0; i < textureList.length; i++) {
            if (textureList[i].skybox) {
                this.loadSkybox(i);
                continue;
            }

            list[textureList[i].name] = loader.load(`${Conf.TEXTURE_PATH}${textureList[i].img}`, (texture) => {
                console.info(`Texture "${textureList[i].img}" loaded`);
                list[textureList[i].name] = texture;
                this.incCount();
            }, undefined, (err) => {
                console.info(`Texture "${textureList[i].img}" failed to load`);
                this.incCount();
            });
        }
    }

    get(name) {
        return this.list[name] || null;
    }

    incCount() {
        this.count++;
        if (this.count >= textureList.length) {
            // callback
        }
    }

}
