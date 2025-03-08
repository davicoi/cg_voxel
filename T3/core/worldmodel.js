import ModelData from './modeldata.js';

// instance of Blocks
/** @type {WorldModel} */
let instWorldModel = null;

/**
 * ModelData of the World (Singleton)
 */
export default class WorldModel {
    /** @type {ModelData} */
    model;

    constructor() {
        if (instWorldModel)
            throw new ReferenceError("ERROR: Only 1 instance of Blocks() is allowed.")
        instWorldModel = this;
    }

    /**
     * Set ModelData for the world
     * @param {ModelData} model 
     */
    setModel(model) {
        this.model = model;
    }

    /**
     * Get model of the world
     * @param {*} modeldata 
     * @returns {ModelData}
     */
    static getModel() {
        return instWorldModel.model;
    }

    /**
     * Size of de world
     * @returns {number}
     */
    static getSize() {
        return instWorldModel.model.getSize();
    }

    /**
     * Height of de world
     * @returns {number}
     */
    static getSize() {
        return instWorldModel.model.getHeight();
    }
}
