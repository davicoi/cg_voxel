import * as THREE from  '../../build/three.module.js';
import Conf from './conf.js';
import CoordConverter from './coordconverter.js';


/**
 * Base plane of the world (with grid)
 */
export default class WorkPlane {
    gridSize;
    /** @type {THREE.Scene} */
    scene;
    /** @type {THREE.GridHelper} */
    grid;

    realGrid;

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

    setGridSize(size) {
        this.gridSize = size;
        this.addPos = size % Conf.CUBE_SIZE != 0 ? 0 : Conf.CUBE_SIZE / 2;

        this.destroyAll();
        this.createGrid(this.scene);
        this.createCentralPlane(this.scene);
        this.createInvisiblePlane(this.scene);

        if (this.showAxis)
            this.createAxis(this.scene);
    }

    /**
     * Create grid
     * @param {THREE.scene} scene 
     */
    createGrid(scene) {
        const gridSize = this.gridSize;
        this.realGrid = new THREE.GridHelper(gridSize * Conf.CUBE_SIZE, gridSize, 0xFF0000, 0x00FF00);
        this.realGrid.position.x = gridSize/2 * Conf.CUBE_SIZE - this.addPos;
        this.realGrid.position.y = -Conf.CUBE_SIZE/2;
        this.realGrid.position.z = gridSize/2 * Conf.CUBE_SIZE - this.addPos;
        scene.add(this.realGrid);
    }

    // used to position the OrbitCamera with the Raycaster, it is not rendered
    createInvisiblePlane(scene) {
        const gridSize = this.gridSize + 100;

        const grid = new THREE.GridHelper(gridSize * Conf.CUBE_SIZE, gridSize, 0xFF0000, 0x00FF00);
        grid.position.x = gridSize / 4 * Conf.CUBE_SIZE;
        grid.position.y = -Conf.CUBE_SIZE/2;
        grid.position.z = gridSize / 4 * Conf.CUBE_SIZE;
        this.grid = grid

        //scene.add(this.grid);
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

        const list = [this.grid, this.axisHelper, this.centralPlane, this.realGrid];
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
        this.realGrid = null;
    }
}
