import * as THREE from  '../../build/three.module.js';
import Conf from './conf.js';
import MaterialList from './materiallist.js';
import Position from './position.js';
import CoordConverter from './coordconverter.js';
import Workspace from './workspace.js';

export default class PreviewBlock {
    /** @type {[THREE.LineSegments]} */
    cube;               // selection cube
    blockPos;           // position of selection cube
    /** @type {[THREE.LineSegments]} */
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

        return true;
    }

    /** Set selection block visibility */
    show(enable) {
        this.cube.visible = enable;
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
}
