import * as THREE from  '../../build/three.module.js';
import Conf from '../core/conf.js';
import MaterialList from '../core/materiallist.js';
import Position from '../core/position.js';
import CoordConverter from '../core/coordconverter.js';
import Workspace from '../core/workspace.js';

export default class NavigateBlock {
    /** @type {[THREE.LineSegments]} */
    cube;               // selection cube
    blockPos;           // position of selection cube
    /** @type {[THREE.LineSegments]} */
    infBlock = [];      // cubes displayed below the selection cube
    lastY = 0;          // lastY position os cube

    /** @type {THREE.Scene} */
    scene;
    /** @type {Workspace} */
    workspace;
    
    /**
     * Constructor
     * @param {THREE.Scene} scene
     * @param {Workspace} workspace
     */
    constructor(scene, workspace) {
        this.scene = scene;
        this.workspace = workspace;
        this.createMaterial();
        this.createMainBlock();
        this.blockPos = new Position(0, 0, 0);
    }

    /** Create materials */
    createMaterial() {
        const matList = MaterialList.getInstance();
        if (matList.get('_navigate'))
            return;
    
        const matMain = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const matInf = new THREE.LineBasicMaterial({ color: 0xFFFFFF, linewidth: 2 });
        matList.add('_navigate', matMain);
        matList.add('_infNavigate', matInf);
    }

    /** Create selection block */
    createMainBlock() {
        const matList = MaterialList.getInstance();
        const mat = matList.get('_navigate');

        const geoCube = new THREE.BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE);
        const geo = new THREE.EdgesGeometry(geoCube);
        this.cube = new THREE.LineSegments(geo, mat);
        
        const pos = CoordConverter.block2RealPosition(0, 0, 0);
        this.cube.position.set(pos.x, pos.y, pos.z);
        this.scene.add(this.cube);
        return this.cube;
    }

    /** Set selection block position */
    setPos(x, y, z) {
        const newBlockPos = new Position(x, y, z);
        if (!CoordConverter.checkPos(newBlockPos))
            return false;

        this.blockPos = newBlockPos;
        const pos = CoordConverter.block2RealPosition(newBlockPos.x, newBlockPos.y, newBlockPos.z);
        this.cube.position.set(pos.x, pos.y + 0.001, pos.z);

        this.show(true);

        this.updateInfBlockPos();

        return true;
    }

    /** Set selection block visibility */
    show(enable) {
        this.cube.visible = enable;
        if (!enable)
            this.hideLowerBlocks(enable);
    }
 
    hideLowerBlocks() {
        for (let i = 0 ; i < this.lastY ; i++) {
            this.infBlock[i].visible = false;
        }
    }

    addPos(x, y, z) {
        return this.setPos(
            this.blockPos.x + x,
            this.blockPos.y + y,
            this.blockPos.z + z
        );
    }

    /** Get the selection block position */
    getPos() {
        return this.blockPos.clone();
    }

    /** Creates the blocks displayed below the selection block */
    createLowerBlocks() {
        const matList = MaterialList.getInstance();
        const mat = matList.get('_infNavigate');

        for (let i = this.infBlock.length ; i < this.blockPos.y ; i++) {
            const geoCube = new THREE.BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE, Conf.CUBE_SIZE);
            const geo = new THREE.EdgesGeometry(geoCube);
            const cube = new THREE.LineSegments(geo, mat);
            this.infBlock.push(cube);
            cube.visible = false;
            this.scene.add(cube);
        }
    }

    /** Update the position of "height" blocks */
    updateInfBlockPos() {
        if (this.blockPos.y != this.lastY)
            this.createLowerBlocks();

        const newPos = this.blockPos.clone();
        for (let i = 0 ; i < this.blockPos.y ; i++) {
            newPos.y = i;
            let pos = CoordConverter.block2RealPosition(newPos.x, newPos.y, newPos.z);
            this.infBlock[i].position.set(pos.x, pos.y, pos.z);
        }

        this.updateInfBlockVisibility();
    }

    /** Show only the blocks below to selection block */
    updateInfBlockVisibility() {
        const count = Math.max(this.lastY, this.blockPos.y);
        for (let i = 0 ; i < count ; i++) {
            this.infBlock[i].visible = i < this.blockPos.y;
        }
        this.lastY = this.blockPos.y;
    }
}
