import * as THREE from    '../../build/three.module.js';
import {initRenderer,
        initDefaultBasicLight,
        onWindowResize } from "../../libs/util/util.js";

import BlockModels from "./blockmodels.js";
import BlockRenderer from "./blockrenderer.js";
import Blocks from "./blocks.js";
import ModelData from "./modeldata.js";
import Workspace from "./workspace.js";
import CameraControls from './cameracontrols.js';
import KeyboardState from '../../libs/util/KeyboardState.js';
import WorkGrid from '../builder/workgrid.js';
import WorkPlane from './workplane.js';
import Tool from './tool.js';
import ChunkSystem from './chunksystem.js';
import InstancedDraw from './instancedDraw.js';
import BlockDraw from './blockdraw.js';
import Conf from './conf.js';
import Fog from './fog.js';


/**
 * 
 */
export default class Core {
    static instance = null;
    backgrounColor = 0xd0d0d0;

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
    /** @type {Tool} */
    tool = new Tool();
    /** @type {ChunkSystem} */
    chunkSystem
    /** @type {Fog} */
    fog;

    /** @type {BlockDraw|InstancedDraw} */
    blockDraw;


    camera = null;
    scene;
    renderer;

    workGrid;


    constructor(size, x, y, z, planeOrGrid = true, backgrounColor = 0xd0d0d0) {
        if (Core.instance)
            throw new ReferenceError("ERROR: Only 1 instance of Core() is allowed.");
        Core.instance = this;

        this.backgrounColor = backgrounColor;
        this.clock = new THREE.Clock(true);
        this.blocks = Blocks.getInstance();


        this.initThreeJS();
        this.initCamera(x, y, z);

        if (Conf.INSTANCED_MESH_OPTIMIZATION)
            this.blockDraw = new InstancedDraw(this, this.scene);
        else
            this.blockDraw = new BlockDraw(this, this.scene);
        this.initWorkspace(size, planeOrGrid);
    }

    setModel(model) {
        this.mapData = model;
    }


    /**
     * @returns {Core}
     */
    static getInstance() {
        return Core.instance;
    }

    initThreeJS() {
        this.scene = new THREE.Scene();
        this.renderer = initRenderer(this.backgrounColor);
        this.light = initDefaultBasicLight(this.scene);
    }

    initCamera(x, y, z) {
        this.camControl = new CameraControls(this.renderer);
        this.camera = this.camControl.init(x, y, z);
        window.addEventListener('resize', () => {
            onWindowResize(this.camera, this.renderer);
        }, false);
    }


    initWorkspace(size, planeOrGrid) {
        const workGrid = planeOrGrid ? new WorkPlane(this.scene, false, this.backgrounColor) : new WorkGrid(this.scene, false, this.backgrounColor);

        this.blockRender = new BlockRenderer();
        this.blockModels = new BlockModels();
        this.chunkSystem = new ChunkSystem();

        this.workspace = new Workspace({
            blockRender: this.blockRender,
            workGrid,
            camera: this.camera
        }, null, size);

        this.mapData = this.workspace.getModelData();

        this.blockRender.init();
        this.fog = new Fog();
    }
}
