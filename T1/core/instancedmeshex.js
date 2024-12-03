import * as THREE from '../../build/three.module.js';

export default class InstancedMeshEx {
    static refs = {};
    /** {THREE.InstancedMesh} */
    list = [];
    //refs = [];
    tmpMatrix = new THREE.Matrix4();

    constructor(geometry, material, scene, id) {
        this.geometry = geometry;
        this.material = material;
        this.scene = scene;
        this.id = id;
    }

    /**
       * @returns {THREE.InstancedMesh}
       */
    addMesh() {
        const mesh = new THREE.InstancedMesh(this.geometry, this.material, 1000);
        mesh.count = 0;
        this.list.push(mesh);
        this.scene.add(mesh);
//        mesh.frustumCulled = false;
        return mesh;
    }

    /**
       * @returns {THREE.InstancedMesh}
       */
    getMesh() {
        const mesh = this.list.find(mesh => mesh.count < 1000);
        return mesh ? mesh : this.addMesh();
    }

    getMeshId() {
        for (let i = 0 ; i < this.list.length; i++) {
            if (this.list[i].count < 1000)
                return i;
        }
        this.addMesh();
        return this.list.length - 1;
    }

    add(pos, ref) {
        const meshId = this.getMeshId();
        const mesh = this.list[meshId];
        // const mesh = this.getMesh();
        const idx = mesh.count
        const matrix = new THREE.Matrix4();
        matrix.setPosition(pos.x, pos.y, pos.z);
        mesh.setMatrixAt( idx, matrix );
        mesh.count++;
        mesh.instanceMatrix.needsUpdate = true;

        // id do mesh instance
        // id da lista
        // id do item
        InstancedMeshEx.refs[ref] = [idx, meshId, this.id];
    }

    remove(ref) {
        const info = InstancedMeshEx.refs[ref];
        if (!info)
            return;

        const idx = info[0];
        const meshId = info[1];
        this.removeByIdx(this.list[meshId], idx);
        delete InstancedMeshEx.refs[ref];
    }

    removeByIdx(mesh, idx) {
        if (idx < 0 || idx >= mesh.count)
            return;

        if (idx < mesh.count - 1) {
            mesh.getMatrixAt(mesh.count - 1, this.tmpMatrix);
            mesh.setMatrixAt(idx, this.tmpMatrix);
        }

        mesh.count--;
        mesh.instanceMatrix.needsUpdate = true;
    }

    removeAll() {
        this.list.forEach(mesh => {
            mesh.count = 0;
            mesh.instanceMatrix.needsUpdate = true;
        });
    }
}
