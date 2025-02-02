import InstancedMeshEx from "./instancedmeshex.js";
import Position from "./position.js";
import MaterialList from "./materiallist.js";
import Blocks from "./blocks.js";



export default class InstancedDraw {
    /** @type {[InstancedMeshEx]} */
    list = [];
    scene;
    core;

    materialList;
    blocks;

    supported = {
        optimizationBlocks: true,
        optimizationSides: false
    };


    constructor(core, scene) {
        this.core = core;
        this.scene = scene;
        this.materialList = MaterialList.getInstance();
        this.blocks = Blocks.getInstance();
    }

    /**
     * @param {number} type
     * returns {InstancedMeshEx}
     */
    getMeshByType(type) {
        if (this.list[type])
            return this.list[type];

        for (let i = this.list.length; i < type ; i++) {
            this.list.push(null);
        }

        const geometry = this.blocks.getCube(Blocks.ALL_SIDES);
        const material = this.materialList.get(`b${type}`);
        const mesh = new InstancedMeshEx(geometry, material, this.scene, type);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.list[type] = mesh;
        return mesh;
    }

    // addBlock(id, pos, ref = null) {
    //     if (!ref)
    //         ref = Position.refFrom(pos.x, pos.y, pos.z);

    //     const meshEx = this.getMeshByType(id);
    //     meshEx.add(pos, ref);
    // }
    create(ref, typeId, pos, chunkId = 0, sides = 0xFFFF) {
        // if (InstancedMeshEx.refs[ref])
        //     this.remove(ref, chunkId);
        const meshEx = this.getMeshByType(typeId);
        return meshEx.add(pos, ref);
    }

    getBlockList() {
        const list = [];
        this.list.forEach(mesh => {
            if (mesh)
                list.push(...mesh.getBlockList())
        });
        return list;
    }


    remove(ref, chunkId = 0) {
        const info = InstancedMeshEx.refs[ref];
        if (!info)
            return;
        
        // const idx = info[0];
        // const meshId = info[1];
        const type = info[2];
        this.list[type].remove(ref);
    }

    clearAll() {
        this.list.forEach(mesh => {
            if (mesh) mesh.removeAll();
        });
        InstancedMeshEx.refs = {};
    }

}