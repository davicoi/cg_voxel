import * as THREE from '../../build/three.module.js';

const INSTANCE_COUNT = 100;

export default class InstancedMeshEx {
    static refs = {};
    /** @type {THREE.InstancedMesh} */
    meshList = [];
    /** @type [[string]] */
    refList = [];
    tmpMatrix = new THREE.Matrix4();
    geometry;
    material;
    scene;
    blockId;



    /**
     * 
     * @param {THREE.BufferGeometry} geometry 
     * @param {THREE.Material} material 
     * @param {THREE.Scene} scene 
     * @param {number} blockId block id
     */
    constructor(geometry, material, scene, blockId) {
        this.geometry = geometry;
        this.material = material;
        this.scene = scene;
        this.blockId = blockId;
    }

    /**
     * @returns {THREE.InstancedMesh}
     */
    addMesh() {
        const mesh = new THREE.InstancedMesh(this.geometry, this.material, INSTANCE_COUNT);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.count = 0;
        this.meshList.push(mesh);
        this.refList.push([]);
        this.scene.add(mesh);
        mesh.frustumCulled = false;     // frustum culling don't work for instanced InstancedMesh
        //mesh.geometry.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );   // INFO: define bounding sphere to use frustum culling
        return mesh;
    }

    /**
     * Get the id of the mesh that has free space or creates a new mesh
     * @returns {THREE.InstancedMesh}
     */
    getMesh() {
        const mesh = this.meshList.find(mesh => mesh.count < INSTANCE_COUNT);
        return mesh ? mesh : this.addMesh();
    }

    /**
     * Get the mesh id with have free space
     * @returns {number}
     */
    getMeshId() {
        for (let i = 0 ; i < this.meshList.length; i++) {
            if (this.meshList[i].count < INSTANCE_COUNT)
                return i;
        }
        this.addMesh();
        return this.meshList.length - 1;
    }

    /**
     * Get the position of the block by ref
     * @returns {THREE.Vector3}
     */
    getPosByRef(ref) {
        if (InstancedMeshEx.refs[ref]) {
            const [idx, meshId, chunkId] = InstancedMeshEx.refs[ref];
            const matrix = new THREE.Matrix4();
            const pos = new THREE.Vector3();
            const vec3 = new THREE.Vector3();
            const quart = new THREE.Quaternion();
            this.meshList[meshId].getMatrixAt(idx, matrix);
            matrix.decompose(pos, quart, vec3);
            return pos;
        }
        return null;
    }

    add(pos, ref) {
        const meshId = this.getMeshId();
        const mesh = this.meshList[meshId];

        // remove the old block if exists
        if (InstancedMeshEx.refs[ref])
            this.remove(ref);

        // new block
        const idx = mesh.count;
        mesh.count++;
        const matrix = new THREE.Matrix4();
        matrix.setPosition(pos.x, pos.y, pos.z);
        mesh.setMatrixAt(idx, matrix);

        mesh.boundingSphere = null;                 // "before raycasting"
        //mesh.computeBoundingSphere();               // BUG: update bounding sphere fails randomly (raycast) "now"
        mesh.instanceMatrix.needsUpdate = true;

        // add ref
        InstancedMeshEx.refs[ref] = [idx, meshId, this.blockId];
        while (this.refList[meshId].length < mesh.count)
            this.refList[meshId].push(null);
        this.refList[meshId][idx] = ref;

        return InstancedMeshEx.refs[ref];
    }

    remove(ref) {
        const info = InstancedMeshEx.refs[ref];
        if (!info)
            return;

        const [idx, meshId, chunkId] = info;
        this.removeByIdx(idx, meshId);
    }

    removeByIdx(idx, meshId) {
        const mesh = this.meshList[meshId];
        const ref = this.refList[meshId][idx];

        // move the last element to the deleted position
        if (idx < mesh.count - 1) {
            mesh.getMatrixAt(mesh.count - 1, this.tmpMatrix);
            mesh.setMatrixAt(idx, this.tmpMatrix);

            const lastRef = this.refList[meshId][mesh.count - 1];

            this.refList[meshId][idx] = lastRef;
            this.refList[meshId][mesh.count - 1] = null;
            InstancedMeshEx.refs[lastRef][0] = idx;
        }

        // remove the last element
        mesh.count--;
        mesh.instanceMatrix.needsUpdate = true;
        this.refList[meshId][mesh.count] = null;
        delete InstancedMeshEx.refs[ref];
    }

    /**
     * Remove all blocks of all meshes (faster than remove 1 by 1)
     */
    removeAll() {
        this.meshList.forEach(mesh => {
            mesh.count = 0;
            mesh.instanceMatrix.needsUpdate = true;
            InstancedMeshEx.refs = {};
            //this.list = [];
        });
    }

    getBlockList() {
        return this.meshList;
    }
}
