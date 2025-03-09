import * as THREE from  '../../build/three.module.js';
import Conf from './conf.js';
import MaterialList from './materiallist.js';
import Position from './position.js';
import CoordConverter from './coordconverter.js';

const EXTRA_SIZE = 0.001;

export default class PreviewBlock {
    /** @type {[THREE.LineSegments]} */
    cube;               // selection cube
    blockPos;           // position of selection cube
    addPos;

    /**
     * Constructor
     * @param {THREE.Scene} scene
     * @param {Workspace} workspace
     */
    constructor(scene, workspace) {
        this.createMaterial(scene);
        this.createMainBlock(scene);
        this.blockPos = new Position(0, 0, 0);
    }

    /** Create materials */
    createMaterial() {
        const matList = MaterialList.getInstance();
        if (matList.get('_navigate'))
            return;
    
        const matMain = new THREE.LineBasicMaterial({ color: 0xFF00FF, linewidth: 2 });
        matList.add('_navigate', matMain);
    }

    /** Create selection block */
    createMainBlock(scene) {
        const matList = MaterialList.getInstance();
        const mat = matList.get('_navigate');

        const geoCube = new THREE.BoxGeometry(Conf.CUBE_SIZE, Conf.CUBE_SIZE + EXTRA_SIZE, Conf.CUBE_SIZE);
        const geo = new THREE.EdgesGeometry(geoCube);
        this.cube = new THREE.LineSegments(geo, mat);
        
        const pos = CoordConverter.block2RealPosition(0, 0, 0);
        this.cube.position.set(pos.x, pos.y, pos.z);
        scene.add(this.cube);
        return this.cube;
    }

    /** Set selection block position */
    setPos(x, y, z, addx, addy, addz) {
        const pos = new Position(x, y, z);
        this.blockPos = pos;
        this.addPos = new Position(addx, addy, addz);
        this.cube.position.set(pos.x, pos.y + EXTRA_SIZE, pos.z);

        return true;
    }

    /** Set selection block visibility */
    show(enable) {
        this.cube.visible = enable;
    }

    isVisible() {
        return this.cube.visible;
    }
 
    addPos(x, y, z) {
        return this.setPos(
            this.blockPos.x + x,
            this.blockPos.y + y,
            this.blockPos.z + z
        );
    }

    /** Get the selection block position */
    getPos(getAddPos = false) {
        return !getAddPos ? this.blockPos.clone() : this.addPos.clone();
    }
}
