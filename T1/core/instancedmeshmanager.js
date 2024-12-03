import InstancedMeshEx from "./instancedmeshex.js";
import Position from "./position.js";
import MaterialList from "./materiallist.js";
import Blocks from "./blocks.js";

export default class InstancedMeshManager {
    /** @type {[InstancedMeshEx]} */
    list = [];
    scene;

    materialList;
    blocks;

    constructor(scene) {
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
        this.list[type] = mesh;
        return mesh;
    }

    addBlock(id, pos, ref = null) {
        if (!ref)
            ref = Position.refFrom(pos.x, pos.y, pos.z);

        const meshEx = this.getMeshByType(id);
        meshEx.add(pos, ref);
    }

    remove(ref) {
        const info = InstancedMeshEx.refs[ref];
        if (!info)
            return;
        
        // const idx = info[0];
        // const meshId = info[1];
        const type = info[2];
        this.list[type].remove(ref);
    }

    removeAll() {
        this.list.forEach(mesh => mesh.removeAll());
        InstancedMeshEx.refs = {};
    }

}