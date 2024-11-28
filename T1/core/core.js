import * as THREE from    '../../build/three.module.js';
import { OrbitControls } from '../../build/jsm/controls/OrbitControls.js';
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

    camera = null;
    scene;

    workGrid;


    constructor(size) {
        if (Core.instance)
            throw new ReferenceError("ERROR: Only 1 instance of Blocks() is allowed.");
        Core.instance = this;

        this.initThreeJS();
        this.initWorkspace(size);
    }

    setModel(model) {
        this.model = model;
    }


    static getInstance() {
        return Core.instance;
    }

    setModel(model) {
        this.model = model;
    }


    initThreeJS() {
        this.scene = new THREE.Scene();
        /** @type {THREE.WebGLRenderer}; */
        this.renderer = initRenderer('rgb(150,150,150)');
        this.light = initDefaultBasicLight(this.scene);
        
        this.camera = initCamera(new THREE.Vector3(0, 25, 35));
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        
        // change Orbit mouse control, LEFT click is used to add blocks
        this.orbit.mouseButtons = {
            LEFT: '',
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.ROTATE
        };
        
        // Listen window size changes
        window.addEventListener('resize', function() {
            onWindowResize(this.camera, this.renderer)
        }, false);
    }


    initWorkspace(size) {
        const workGrid = new WorkGrid(this.scene, false);

        this.blockRender = new BlockRenderer(this.scene);
        this.blockModels = new BlockModels();
    
        this.workspace = new Workspace({
            blockRender: this.blockRender,
            workGrid,
            camera: this.camera
        }, null, size);

        this.mapData = this.workspace.getModelData();
    }
}
