import * as THREE from  '../../build/three.module.js';
import Position from '../core/position.js';
import CoordConverter from '../core/coordconverter.js';
import BlockRenderer from '../core/blockrenderer.js';
import NavigateBlock from './navigateblock.js';
import Workspace from '../core/workspace.js';
import Core from '../core/core.js';

export default class BuilderMouseMove {
    /** @type {Position} */
    lastRemovePos = null;
    lastAddPos = null;
    isVisible = true;
    isEnabled = true;

    /** @type {THREE.Raycaster} */
    raycaster;
    /** @type {THREE.Vector2} */
    mouse;
    /** @type {THREE.Camera} */
    camera;
    /** @type {NavigateBlock} */
    navigator;
    /** @type {BlockRenderer} */
    blockRender;
    core;

    tmpMatrix = new THREE.Matrix4();
    tmpPosition = new THREE.Vector3();
    tmpVec3 = new THREE.Vector3();
    tempQuater = new THREE.Quaternion();


    /**
     * Constructor
     * @param {THREE.Camera} camera
     * @param {NavigateBlock} navigator
     * @param {BlockRenderer} blockRender
     */
    constructor(camera, navigator, blockRender) {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.camera = camera;
        this.navigator = navigator;
        this.blockRender = blockRender;
        this.isEnabled = true;
        this.core = Core.getInstance();
    }

    enable(status) {
        this.isEnabled = status == true;
    }

    /** Register onMouseOver event */
    register() {
        window.addEventListener('mousemove', (event) => this.onMouseMove(event), false);
    }

    /** Event handler */
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    /**
     * Update raycaster
     * @param {Workspace} workspace 
     */
    update(workspace) {
        if (!this.isEnabled)
            return;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        //const list = [workspace.workGrid.grid, ...this.blockRender.getBlockList()];
        const list = [workspace.workGrid.grid, ...this.core.blockDraw.getBlockList()];
        const intersects = this.raycaster.intersectObjects(list);

        if (intersects.length > 0) {
            const firstMesh = intersects[0];
            this.isVisible = true;

            if(firstMesh.object == workspace.workGrid.grid)
                this.updateFromGrid(firstMesh);
            else
                this.updateFromMesh(firstMesh);
        } else {
            this.lastRemovePos = null;
            this.addPos = null;

            if (this.isVisible) {
                this.navigator.show(false);
                this.isVisible = false;
            }
        }
    }

    /** Set the selection block position based on the grid */
    updateFromGrid(intersect) {
        const interPos = intersect.point;

        // the grid may be shifted
        const x = interPos.x;
        const y = interPos.y;
        const z = interPos.z;

        const pos = CoordConverter.real2BlockPosition(x, y, z);

        this.navigator.setPos(pos.x, pos.y, pos.z);
        this.lastRemovePos = pos;
        this.addPos = pos;
    }

    /** Set the selection block position based on one of the blocks */
    updateFromMesh(intersect) {
        let pos;
        if (intersect.instanceId !== undefined)
            pos = this.extractPos(intersect.object, intersect.instanceId);
        else
            pos = intersect.object.position;

        // convert real position to block position
        const blockPos = CoordConverter.real2BlockPosition(pos.x, pos.y, pos.z);
        this.lastRemovePos = blockPos.clone();

        // add the normal cood to find out where the block should be inserted
        const normal = intersect.normal;
        blockPos.add(normal.x, normal.y, normal.z);
        this.addPos = blockPos;

        // create the block
        this.navigator.setPos(blockPos.x, blockPos.y, blockPos.z);
    }

    /**
     * 
     * @param {InstancedMesh} mesh 
     * @param {number} instanceId 
     * @returns 
     */
    extractPos(mesh, instanceId) {
        mesh.getMatrixAt(instanceId, this.tmpMatrix);
        this.tmpMatrix.decompose(this.tmpPosition, this.tempQuater, this.tmpVec3);
        return this.tmpPosition;
    }

    /** Get the last block selected with the mouse. */
    getLastBlockPos() {
        return this.lastRemovePos;
    }

    getAddPos() {
        return this.addPos;
    }

    clearPos() {
        this.addPos = null;
        this.lastRemovePos = null;
    }
}
