import * as THREE from    '../../build/three.module.js';
import {initRenderer,
        initCamera,
        initDefaultBasicLight,
        onWindowResize } from "../../libs/util/util.js";

import BlockModels from "./blockmodels.js";
import BlockRenderer from "./blockrenderer.js";
import Blocks from "./blocks.js";
import ModelData from "./modeldata.js";
import Workspace from "./workspace.js";
import WorkGrid from '../builder/workgrid.js';
import CameraControls from './cameracontrols.js';
import KeyboardState from '../../libs/util/KeyboardState.js';



/**
 * 
 */
export default class Core {
    static instance = null;

    /** @type {Workspace} */
    workspace;
    /** @type {BlockRenderer} */
    blockRender;
    /** @type {ModelData} */
    mapData;
    /** @type {Blocks} */
    blocks;
    /** @type {BlockModels} */
    blockModels;
    /** @type {CameraControls} */
    camControl;
    /** @type {THREE.Clock} */
    clock;
    /** @type {THREE.KeyboardState} */
    keyboard = new KeyboardState();


    camera = null;
    scene;

    workGrid;


    constructor(size, x, y,z) {
        if (Core.instance)
            throw new ReferenceError("ERROR: Only 1 instance of Core() is allowed.");
        Core.instance = this;

        this.clock = new THREE.Clock(true);
        this.blocks = Blocks.getInstance();

        this.initThreeJS();
        this.initCamera(x, y, z);
        this.initWorkspace(size);
    }

    setModel(model) {
        this.model = model;
    }


    static getInstance() {
        return Core.instance;
    }

    initThreeJS() {
        this.scene = new THREE.Scene();
        this.renderer = initRenderer('rgb(150,150,150)');
        this.light = initDefaultBasicLight(this.scene);
    }

    initCamera(x, y, z) {
        this.camControl = new CameraControls(this.renderer);
        this.camera = this.camControl.init(x, y, z);
    }


    initWorkspace(size) {
        const workGrid = new WorkGrid(this.scene, false);

        this.blockRender = new BlockRenderer();
        this.blockModels = new BlockModels();
    
        this.workspace = new Workspace({
            blockRender: this.blockRender,
            workGrid,
            camera: this.camera
        }, null, size);

        this.mapData = this.workspace.getModelData();

        this.blockRender.init();
    }
}
