import * as THREE from  'three';
import { setDefaultMaterial } from "../../libs/util/util.js";

let materialsInst = null;

/**
 * Materials manager (cache) (Singleton)
 */
export default class MaterialList {
    /** @type {THREE.MeshBasicMaterial} - Material list indexex by name */
    materialList = {};

    constructor() {
        if (materialsInst)
            throw new ReferenceError("ERROR: Only 1 instance of MaterialList() is allowed. Use Block.getInstance().")
    
        this.clear();
    }

    clear() {
        this.materialList = {};
    }
    
    /**
     * Get the instance of object
     * @returns {MaterialList}
     */
    static getInstance() {
        if (!materialsInst)
            materialsInst = new MaterialList();

        return materialsInst;
    }

    /**
     * Create a material using the setDefaultMaterial
     * @param {string} name
     * @returns {THREE.MeshBasicMaterial}
     */
    create(name, color, tex) {
        if (!name)
            name = String.toString(color || tex);

        const mat = setDefaultMaterial(color, tex);
        this.add(name, mat);
        return mat;
    }

    /**
     * Add a material to cache
     * @param {string} name 
     * @param {THREE.MeshBasicMaterial} material 
     */
    add(name, material) {
        this.materialList[name] = material;
    }

    /**
     * Get a cached material by name
     * @param {string} name 
     * @returns {THREE.MeshBasicMaterial | null}
     */
    get(name) {
        if (this.materialList[name])
            return this.materialList[name];
        else
            return null;
    }
}
