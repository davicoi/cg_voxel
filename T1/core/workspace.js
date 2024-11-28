
import * as THREE from  '../../build/three.module.js';
import BlockRenderer from './blockrenderer.js';
import Conf from './conf.js';
import ModelData from './modeldata.js';
import Position from './position.js';
import WorkGrid from '../builder/workgrid.js';
import WorldModel from './worldmodel.js';
import Core from './core.js';




export default class Workspace {
    cubeSize = Conf.CUBE_SIZE;
    gridSize = 0;   // workspace in blocks (10 = 10x10x10)
    addPos = 0;     // adjust the height of all meshes
    centerPos = new Position(0, 0, 0);  // central position of workspace
    selectedBlock = 1;

    funcOnLoad;

    /** @type {ModelData} */
    modelData;
    /** @type {BlockRenderer} */
    blockRender;
    /** @type {WorkGrid} */
    workGrid;
    /** @type {WorldModel} */
    wordModel;

    /** @type {THREE.PerspectiveCamera} */
    camera;

    /**
     */
    constructor({blockRender, workGrid, camera}, model, size) {

        this.wordModel = new WorldModel();
        this.camera = camera;
        this.workGrid = workGrid;
        this.setBlockRender(blockRender);

        if (model)
            this.setModelData(model);
        else
            this.newModel(size);

        this.workGrid.setGridSize(size);
    }

    setOnLoad(callback) {
        this.funcOnLoad = callback;
    }

    newModel(size) {
        const model = new ModelData(size);
        this.setModelData(model);
    }

    loadModel(data) {
        const model = ModelData.load(data);
        this.setModelData(model);
    }

    /**
     * 
     * @param {*} id 
     * @param {Position} pos 
     */
    set(id, pos) {
        this.modelData.set(id, pos);
    }

    /**
     * 
     * @param {*} id 
     * @param {Position} pos 
     */
    get(id, pos) {
        return this.modelData.get(pos);
    }


    /**
     * 
     * @param {BlockRenderer} blockRender 
     */
    setBlockRender(blockRender) {
        this.blockRender = blockRender;
        blockRender.setWorkspace(this);
    }


    /**
     * 
     * @returns {ModelData}
     */
    setModelData(modelData) {
        const core = Core.getInstance();
        core.setModel(modelData);

        this.wordModel.setModel(modelData);

        const newSize = this.gridSize != modelData.size;
        this.modelData = modelData;
        this.gridSize = modelData.size;
        this.calcModelInfo();

        if (newSize && this.workGrid.grid) {
            this.workGrid.setGridSize(this.gridSize);
        }

        if (this.blockRender) {
            this.modelData.setBlockRender(this.blockRender);
            this.modelData.reloadBlocks();
        }

        if (this.funcOnLoad)
            this.funcOnLoad(this);
    }

    calcModelInfo() {
        this.addPos = this.gridSize % 2 != 0 ? 0 : parseInt(this.cubeSize / 2);
        const center = parseInt(this.gridSize / 2);
        this.centerPos.set(center, 0, center);
    }

    /**
     * 
     * @returns {ModelData}
     */
    getModelData() {
        return this.modelData;
    }

    /**
     * add a model to map
     * @param {ModelData} model 
     * @param {Position} pos 
     */
    addModel(model, pos) {
        if (!model)
            return;

        const p = new Position();
        pos = pos.clone();
        pos.add(model.center.x, model.center.y, model.center.z);


        model.forEachBlock((id, x, y, z) => {
            p.set(pos.x + x, pos.y + y, pos.z + z);
            this.set(id, p);
        });
    }
}
