import * as THREE from  'three';



/**
 * Materials manager (cache) (Singleton)
 */
export default class MaterialList {
    static instance = null;

    /** @type {THREE.MeshBasicMaterial} - Material list indexex by name */
    materialList = {};

    constructor() {
        if (MaterialList.instance)
            throw new ReferenceError("ERROR: Only 1 instance of MaterialList() is allowed. Use Block.getInstance().")
        MaterialList.instance = this;

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
        if (!MaterialList.instance)
            MaterialList.instance = new MaterialList();
        return MaterialList.instance;
    }

    /**
     * Create a material using the setDefaultMaterial
     * @param {string} name
     * @returns {THREE.MeshBasicMaterial}
     */
    create(name, color, tex) {
        if (!name)
            name = String.toString(color || tex);

        let mat;
        if (tex) {
            mat = new THREE.MeshLambertMaterial({ color, map: tex, transparent: true });
            mat.map.minFilter = THREE.NearestFilter;
            mat.map.magFilter = THREE.NearestFilter;
        } else
            mat = new THREE.MeshLambertMaterial({ color });

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
