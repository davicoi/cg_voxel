import Perlin from "../other/perlin.js";
import BlockModels from "./blockmodels.js";
import ModelData from "./modeldata.js";
import Position from "./position.js";


export default class MapGenerator {
    /** @type {workspace} */
    workspace;

    // generate Perlin noise map
    static generatePerlin(model, gridsize = 128, valueRange = 256, smooth = 50, seed = null) {
        if (!seed || seed <= 0) seed = Math.floor(Math.random() * 65536);
        const perlin = new Perlin(seed);

        let pos = new Position(0, 0, 0);
        let num, raw;
        for (pos.z = 0 ; pos.z < gridsize ; pos.z++) {
            for (pos.x = 0; pos.x < gridsize; pos.x++) {
                num = perlin.noise(pos.x, pos.z, 1, smooth);
                raw = (num / 2) + 0.5;

                num = Math.floor(raw * valueRange);
                num = Math.min(num, valueRange);

                MapGenerator.setByHeight(model, pos, num);
            }
        }
    }

    /**
     * 
     * @param {ModelData} model 
     * @param {Position} pos
     * @param {number} height 
     */
    static setByHeight(model, pos, height) {
        for (let y = 0 ; y < height ; y++) {
            pos.y = y;
            model.set(1, pos);
        }
        pos.y = height;
        model.set(height + 1, pos.clone());
    }


    /**
     * 
     * @param {ModelData} model 
     * @param {number} blockRange 
     * @param {number} smooth 
     * @param {number} seed 
     */
    static create(model, blockRange, smooth = 30, seed = 0) {
        const size = model.getSize();
        MapGenerator.generatePerlin(model, size, blockRange, smooth, seed);

        const list = MapGenerator.randomTrees(model);
        MapGenerator.addTrees(model, list);
    }

    /**
     * 
     * @param {ModelData} model 
     */
    static randomTrees(model) {
        const size = model.getSize();
        const dist = 7;
        const treeDist = 5;
        const min = Math.max(6, Math.pow(size/(dist*2), 2));

        //const list = [{left: 5-treeDist, top: 5-treeDist, right: 5+treeDist, bottom: 5+treeDist, x: 5, y: 5}];
        const list = [];

        let x, y, count = 0, add = false;
        let left, right, top, bottom;

        const size2 = size - treeDist*2
        while (list.length < min && count++ < min*5) {
            x = treeDist + Math.random() * size2 | 0;
            y = treeDist + Math.random() * size2 | 0;

            add = true;
            for (let i = 0 ; i < list.length ; i++) {
                if (x >= list[i].left && x < list[i].right && y >= list[i].top && y < list[i].bottom) {
                    add = false;
                    break;
                }
            }

            if (!add)
                continue;

            left = x - treeDist;
            right = x + treeDist;
            top = y - treeDist;
            bottom = y + treeDist;

            if (left >= 0 && right < size && top >= 0 && bottom < size) {
                list.push({left, top, right, bottom, x, y});
            }
        }

        return list;
    }

    /**
    * 
     * @param {ModelData} model 
    */
    static addTrees(model, list) {
        const blockModels = BlockModels.getInstance();
        const treeCount = blockModels.countOf('tree');

        let modelName, r, pos;
        for (let i = 0 ; i < list.length ; i++) {
            const y = model.firstEmptyFrom(list[i].x, list[i].y);
            if (y < 0)
                continue;

            r = Math.random() * treeCount | 0;
            modelName = 'tree' + (r + 1);

            pos = new Position(list[i].x, y, list[i].y);
            const treeModel = blockModels.get(modelName);
            if (treeModel)
                model.addModel(treeModel, pos);
        }
    }

    static perlinArray(model, gridsize = 128, smooth = 50, seed = null) {
        if (!seed || seed <= 0) seed = Math.floor(Math.random() * 65536);
        const perlin = new Perlin(seed);

        const map = new Uint8Array(gridsize * gridsize);
        const dist = []

        dist.fill()
        for (let i = 0 ; i < 256 ; i++)
            dist.push(0);

        let pos = new Position(0, 0, 0);
        let num, raw, idx = 0;
        for (pos.z = 0 ; pos.z < gridsize ; pos.z++) {
            for (pos.x = 0; pos.x < gridsize; pos.x++) {
                num = perlin.noise(pos.x, pos.z, 1, smooth);
                raw = (num / 2) + 0.5;

                num = Math.floor(raw * 256);
                if (num > 256)
                    num = 256;

                map[idx++] = num;
                dist[num]++;
            }
        }

        return {map, dist};
    }

    static distByPerc(dist, percList, total) {
        const numList = [];

        let count = 0;
        let minPerc = percList[0];
        for (let i = 0 ; i < dist.length ; i++) {
            count += dist[i];
            if (count / total > minPerc) {
                numList.push(i);
                count = 0;
                minPerc = percList[numList.length];
                if (numList.length >= percList.length)
                    break;
            }
        }

        if (numList.length < percList.length)
            numList.push(256)

        return numList;
    }

    static normalizeByPerc(map, numList) {
        let heightValue = [];

        let count = 0;
        numList.forEach((num, i) => {
            for (; count < num ; count++) {
                heightValue.push(i);
            }
        });

        return heightValue;
    }


    static createByPerc(model, smooth = 50, seed = null) {
        const gridsize = model.getSize();
        const {map, dist} = MapGenerator.perlinArray(model, gridsize, smooth, seed);

        const percList = [0.5, 0.35, 0.15];
        const numList = MapGenerator.distByPerc(dist, percList, gridsize*gridsize);

        const height = MapGenerator.normalizeByPerc(map, numList);


        const pos = new Position(0, 0, 0);
        let val, idx = 0;
        for (pos.z = 0 ; pos.z < gridsize ; pos.z++) {
            for (pos.x = 0 ; pos.x < gridsize ; pos.x++) {
                val = height[ map[idx++] ];
                MapGenerator.setByHeight(model, pos, val);
            }
        }

        const list = MapGenerator.randomTrees(model);
        MapGenerator.addTrees(model, list);
    }

}
