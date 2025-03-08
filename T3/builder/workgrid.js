import * as THREE from  '../../build/three.module.js';
import Conf from '../core/conf.js';
import CoordConverter from '../core/coordconverter.js';


/**
 * Base plane of the world (with grid)
 */
export default class WorkGrid {
    gridSize;
    /** @type {THREE.Scene} */
    scene;
    /** @type {THREE.GridHelper} */
    grid;
    /** @type {THREE.Mesh} */
    centralPlane;
    /** @type {THREE.AxesHelper} */
    axisHelper;
    showAxis = false;
    addPos = 0;

    /**
     * 
     * @param {THREE.Scene} scene 
     * @param {number} gridSize 
     * @param {boolean} showAxis 
     */
    constructor(scene, showAxis = false) {
        this.scene = scene;
        this.gridSize = 10;
        this.showAxis = showAxis;
    }

    setWorkspace(workspace) {
        this.workspace = workspace;
    }

    show(status) {
        if (this.grid)
            this.grid.visible = status;
        if(this.axisHelper)
            this.axisHelper.visible = status;
        if(this.centralPlane)
            this.centralPlane.visible = status;
    }

    setGridSize(size) {
        this.gridSize = size;
        this.addPos = size % Conf.CUBE_SIZE != 0 ? 0 : Conf.CUBE_SIZE / 2;

        this.destroyAll();
        this.createGrid(this.scene);
        this.createCentralPlane(this.scene);

        if (this.showAxis)
            this.createAxis(this.scene);
    }

    /**
     * Create grid
     * @param {THREE.scene} scene 
     */
    createGrid(scene) {
        this.grid = new THREE.GridHelper(this.gridSize * Conf.CUBE_SIZE, this.gridSize, 0xFF0000, 0x00FF00);
        this.grid.position.x = this.gridSize/2 * Conf.CUBE_SIZE - this.addPos;
        this.grid.position.y = -Conf.CUBE_SIZE/2;
        this.grid.position.z = this.gridSize/2 * Conf.CUBE_SIZE - this.addPos;
        scene.add(this.grid);
    }

    /**
     * Create axis
     * @param {THREE.scene} scene 
     */
    createAxis(scene) {
        this.axisHelper = new THREE.AxesHelper( 12 );
        this.axisHelper.position.x = -this.addPos + this.gridSize/2 * Conf.CUBE_SIZE;
        this.axisHelper.position.y = -Conf.CUBE_SIZE/2;
        this.axisHelper.position.z = -this.addPos + this.gridSize/2 * Conf.CUBE_SIZE;
        scene.add(this.axisHelper);
    }

    /**
     * Create a plane to define the central block (pos: 0,0,0)
     * @param {THREE.Scene} scene 
     * @returns {THREE.Mesh}
     */
    createCentralPlane(scene) {
        // material with opacity
        const mat = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
        mat.transparent = true;
        mat.opacity = 0.25;

        // plane
        const geoPlane = new THREE.PlaneGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE);

        // create plane and mesh
        this.centralPlane = new THREE.Mesh(geoPlane, mat);
        this.centralPlane.rotation.x = Math.PI / 2;
        const centerPos = parseInt(this.gridSize / 2);
        const pos = CoordConverter.block2RealPosition(centerPos, 0, centerPos);
        this.centralPlane.position.set(pos.x, pos.y - Conf.CUBE_SIZE/2 + 0.001, pos.z);

        scene.add(this.centralPlane);
    }

    /** Destroy and remove all mesh from scene */
    destroyAll() {
        if (!this.grid)
            return;

        /** @type {THREE.Scene} */
        const scene = this.grid.parent;

        const list = [this.grid, this.axisHelper, this.centralPlane];
        list.forEach(mesh => {
            if (mesh) {
                scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            }
        });

        this.grid = null;
        this.axisHelper = null;
        this.centralPlane = null;
    }
}
