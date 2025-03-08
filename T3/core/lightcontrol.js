import * as THREE from    '../../build/three.module.js';
import Conf from './conf.js';
import Core from './core.js';


export default class LightControl {
    static instance;

    /** @type {THREE.DirectionalLight} */
    light;
    /** @type {THREE.AmbientLight} */
    light2;
    /** @type {THREE.CameraHelper} */
    shadowHelper = null;
    helperVisible = false;

    /** @type {number} */
    intervalLight = 0;
    lightAngle = 45;

    /**
     * 
     * @param {{THREE.Scene} scene 
     */
    constructor(scene) {
        if (LightControl.instance)
            throw new ReferenceError("ERROR: Only 1 instance of Light() is allowed.");
        LightControl.instance = this;

        this.init(scene);
    }

    static getInstance() {
        return LightControl.instance;
    }

    init(scene) {
        /** @type {THREE.HemisphereLight}  */
        //this.light = initDefaultBasicLight(scene);

        // directional light
        const dirLight = new THREE.DirectionalLight("rgb(255,255,255)", 0.8);
        this.light = dirLight;
        dirLight.position.copy(new THREE.Vector3(5, 40, 1));
        dirLight.castShadow = true;

        this.light.shadow.autoUpdate = Conf.LIGHT_AUTOUPDATE;
        this.setShadowMapSize(Conf.LIGH_SHADOW_MAP_SIZE);

        //dirLight.shadow.bias = 0.002;
        dirLight.shadow.normalBias = 0.08;

        scene.add(dirLight);
        scene.add(dirLight.target);

        // light 2
        this.light2 = new THREE.AmbientLight(0x909090, 0.8);
        this.light2.position.set(new THREE.Vector3(1,1,1));
        scene.add(this.light2);


        const core = Core.getInstance();
        core.light = this.light;
        core.light2 = this.light2;
        core.shadowHelper = this.shadowHelper;
    }

    setShadowMapSize(size) {
        size = parseInt(size);

        if (this.light.shadow.mapSize && this.light.shadow.map) {
            this.light.shadow.mapSize.set(size, size);
            this.light.shadow.map.setSize(size, size);
        } else {
            this.light.shadow.mapSize.width = size;
            this.light.shadow.mapSize.height = size;
        }
    }

    getShadowMapSize() {
        return this.light.shadow.mapSize.width;
    }


    updatePosition() {
        const core = Core.getInstance();
        if (!core.playerModel || !core.playerModel.loaded())
            return;

        // hourt to radian angles
        this.lightAngle = ((360/24*core.lightHour + 270) % 360)
        const rad = this.lightAngle/180.0*Math.PI;

        // position of the light
        const x = Math.cos(rad) * Conf.LIGHT_DISTANCE;
        const y = Math.sin(rad) * Conf.LIGHT_DISTANCE;
        const playerPos = core.playerModel.obj.position;
        this.light.position.set(playerPos.x +x, playerPos.y + y, playerPos.z - 5);
//        this.light2.position.set(playerPos.x +x, playerPos.y + y, playerPos.z - 3);

        if (this.shadowHelper)
            this.shadowHelper.update();
    }

    setAutoUpdate(enable) {
        if (!enable) {
            this.light.shadow.autoUpdate = false;
            this.light.shadow.needsUpdate = true;

            if (!this.intervalLight) {
                this.intervalLight = setInterval(() => {
                    this.light.shadow.needsUpdate = true;
                }, Conf.LIGHT_REFRESH_INTERVAL);
            }

        } else {
            this.light.shadow.autoUpdate = true;
            
            if (this.intervalLight) {
                clearInterval(this.intervalLight);
                this.intervalLight = 0;
            }
        }

        Core.getInstance().models.setCastShadow(enable);

        return this.light.shadow.autoUpdate;
    }

    updateArea() {
        const core = Core.getInstance();
        if (!core.chunkSystem || !this.light)
            return;

        const info = core.chunkSystem.getActive();
        if (!info)
            return;
//        const width = (info.rect.maxX - info.rect.x) / 2;
//        const height = (info.rect.maxZ - info.rect.z) / 2;
        const width = info.maxRadius;
        const height = info.maxRadius;

        const dirLight = this.light;
        dirLight.shadow.camera.near = .1;
        dirLight.shadow.camera.far = Conf.LIGHT_DISTANCE * 2;   // FIXME: max depth from map
        dirLight.shadow.camera.left = -width; 
        dirLight.shadow.camera.right = width; 
        dirLight.shadow.camera.bottom = -height;
        dirLight.shadow.camera.top = height;
        if (!dirLight.shadow.autoUpdate)
            dirLight.shadow.needsUpdate = true;

        this.setAutoUpdate(Conf.LIGHT_AUTOUPDATE);
        this.createShadowHelper();
    }

    createShadowHelper() {
        this.removeShadowHelper();
        if (!this.helperVisible)
            return;

        const core = Core.getInstance();
        this.shadowHelper = new THREE.CameraHelper(this.light.shadow.camera);
        core.scene.add(this.shadowHelper);
    }

    removeShadowHelper() {
        if (this.shadowHelper) {
            const core = Core.getInstance();
            core.scene.remove(this.shadowHelper);
            this.shadowHelper.dispose();
            this.shadowHelper = null;
        }
    }

    setHelper(enable) {
        this.helperVisible = (enable == true);
        this.createShadowHelper();
    }

    getHelper() {
        return this.helperVisible;
    }

    toggleHelper() {
        this.setHelper(!this.helperVisible);
    }
}
