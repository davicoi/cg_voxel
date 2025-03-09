import * as THREE from    '../../build/three.module.js';
import Core from './core.js';

export default class Water {
    isUnderwater = false;
    colo = 0x1e90ff;
    boxEnable = false;
    waterHeight = 5;
    waterOpacity = 0.7;

    /** @type {THREE.Mesh} */
    water;
    /** @type {THREE.Mesh} */
    waterBox;

    /**
     * 
     * @param {THREE.Camera} camera 
     * @param {THREE.Scene} scene
     */
    constructor(camera, scene, height, size, opacity = 0.7, color = 0x1e90ff) {
        this.isUnderwater = false;
        this.color = color;
        this.waterHeight = height;
        this.waterOpacity = opacity;

        this.createWater(camera, scene, height, size);
        this.createWaterEffect(camera, scene);
    }

    createWater(camera, scene, height, size) {
        const waterMaterial = new THREE.MeshBasicMaterial({
            color: 0x1e90ff,
            opacity: this.waterOpacity,
            transparent: true
        });
    
        const waterGeometry = new THREE.PlaneGeometry(size, size);
    
        // Mesh da água
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water = water;

        const waterPosition = {
            x: 0,
            y: height,
            z: 0
        };
        water.rotateX(-Math.PI / 2);
        water.renderOrder = 200;
        water.position.set(waterPosition.x, waterPosition.y, waterPosition.z);
    
        scene.add(water);
    }
    
    // era para ser um shader, mas como não sei qual a configuração onde será testado...
    createWaterEffect(camera, scene) {
        const material = new THREE.MeshBasicMaterial({
            color: 0x1e90ff,
            opacity: this.waterOpacity,
            transparent: true,
            side: THREE.DoubleSide
        });
    
        const geometry = new THREE.BoxGeometry(1.05, 1.05, 1.05);
        const mesh = new THREE.Mesh(geometry, material);
        this.waterBox = mesh;
        mesh.renderOrder = 200;
        mesh.position.set(camera.position.x, camera.position.y, camera.position.z);
        mesh.visible = false;
    
        scene.add(mesh);
    }

    update(delta) {
        const core = Core.getInstance();

        const boxStatus = core.camControl.isFirstPerson() && core.camera.position.y <= this.waterHeight;
        if (boxStatus)
            this.waterBox.position.set(core.camera.position.x, core.camera.position.y, core.camera.position.z);

        if (this.waterBox.visible != boxStatus)
            this.waterBox.visible = boxStatus;
    }
}
