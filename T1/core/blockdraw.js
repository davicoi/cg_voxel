import CoordConverter from "./coordconverter.js";
import Core from "./core.js";

export default class BlockDraw {
    scene;
    /** @type {Core} */
    core;

    blockMap = {};
    blockList = [];
    blockListCount = 0;

    supported = {
        optimizationBlocks: true,
        optimizationSides: true
    };

    constructor(core, scene) {
        this.scene = scene;
        this.core = core;
    }

    create(ref, typeId, pos, chunkId = 0, sides = 0xFFFF) {
        if (!ref)
            debugger;
        const cube = this.core.blocks.createBlockById(typeId, sides);
        const realPos = CoordConverter.block2RealPosition(pos.x, pos.y, pos.z);
        cube.position.set(realPos.x, realPos.y, realPos.z);
        this.scene.add(cube);

        // FIXME: BUG
        if (this.blockMap[ref])
            this.removeMesh(this.blockMap[ref]);

        this.blockMap[ref] = cube;
        this.addToBlockList(cube);
        return cube;
    }

    remove(ref, chunkId = 0) {
        if (!ref)
            debugger;
        if (!this.blockMap[ref])
            return;

        const mesh = this.blockMap[ref];
        this.removeMesh(mesh);

        this.removeFromBlockList(mesh);
        delete this.blockMap[ref];
    }

    removeMesh(mesh) {
        this.core.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    }

    addToBlockList(mesh) {
        // if (this.blockListCount < this.blockList.length)
        //     this.blockList[this.blockListCount] = mesh;
        // else
            this.blockList.push(mesh);
        // this.blockListCount++;
    }

    removeFromBlockList(mesh) {
        const idx = this.blockList.indexOf(mesh);
        if (idx < 0)
            return;

        this.blockList.splice(idx, 1);
        // this.blockList[idx] = this.blockList[this.blockListCount - 1];
        // this.blockList[this.blockListCount - 1] = null;
        // this.blockListCount--;
    }

    getBlockList() {
        // if (this.blockListCount < this.blockList.length)
        //     this.blockList = this.blockList.slice(0, this.blockListCount);
        return this.blockList;
    }

    clearAll() {
        this.blockList.forEach(mesh => {
            this.removeMesh(mesh);
        })

        this.blockMap = {};
        this.blockList = [];
        this.blockListCount = 0;
    }
}
