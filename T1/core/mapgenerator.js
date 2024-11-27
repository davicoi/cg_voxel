import Perlin from "../other/perlin.js";
import ModelData from "./modeldata.js";
import Position from "./position.js";
import WorldModel from "./worldmodel.js";


export default class MapGenerator {
    /** @type {workspace} */
    workspace;

    // generate Perlin noise map
    static generatePerlin(model, gridsize = 128, valueRange = 256, smooth = 50, seed = null) {
        if (!seed || seed <= 0) seed = Math.floor(Math.random() * 65536);
        const perlin = new Perlin(seed);

        let pos = new Position(0, 0, 0);

        //const map = [];
        let num, raw;
        for (pos.z = 0 ; pos.z < gridsize ; pos.z++) {
            //map[y] = [];
            for (pos.x = 0; pos.x < gridsize; pos.x++) {
                num = perlin.noise(pos.x, pos.z, 1, smooth);
                raw = (num / 2) + 0.5;

                num = Math.floor(raw * valueRange);
                num = Math.min(num, valueRange);

                //map[y][x] = num;
                
                MapGenerator.setByHeight(model, pos, num);
            }
        }
    }

    /**
     * 
     * @param {ModelData} model 
     * @param {Position} pos
     * @param {*} height 
     */
    static setByHeight(model, pos, height) {
        for (let y = 0 ; y < height ; y++) {
            pos.y = y;
            model.set(1, pos);
        }
        pos.y = height;
        model.set(height + 1, pos.clone());
    }


    static create(size, blockRange, smooth = 30, seed = 0) {
        /** @type {ModelData} */
        const model = WorldModel.getModel();

        MapGenerator.generatePerlin(model, size, blockRange, smooth, seed);

    }

}