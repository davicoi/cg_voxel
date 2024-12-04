import * as THREE from    '../../build/three.module.js';
import Conf from "./conf.js";
import Core from "./core.js";

export default class Fog {
    useFog = false;
    enabled = false;
    min = Conf.CHUNK_SIZE * 3;
    max = Conf.CHUNK_SIZE * 4;

    isEnabled() {
        return Core.getInstance().scene.fog != null;
    }

    enableFogSystem(enable = true) {
        this.useFog = enable;
        this.enable(enable);
    }

    enable(enable = true) {
        const core = Core.getInstance();
        if (!core)
            return;
        
        core.scene.fog = null;
        const isFirtstPerson = core.camControl.isFirstPerson();
        if (this.useFog && enable && isFirtstPerson)
            core.scene.fog = new THREE.Fog(core.backgrounColor, this.min, this.max);
    }

    updateDistance() {
        const core = Core.getInstance();
        if (!core)
            return;

        const chunkInfo = core.chunkSystem.getActive();
        if (!chunkInfo)
            return;

        const visible = chunkInfo.alwaysVisible;
        const min = visible - Conf.CHUNK_SIZE;
        const max = visible;

        if (min != this.min || max != this.max) {
            this.min = min;
            this.max = max;
            this.enable(this.isEnabled());
        }
    }
}
