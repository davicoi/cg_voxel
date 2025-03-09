import Conf from "./conf.js";
import ModelData from "./modeldata.js";

const modelsName = [
    'tree1', 'tree2', 'tree3', 'tree4', 'tree5',
    'rav'
];

export default class BlockModels {
    static instBlockModels = null;
    /** @type [{ModelData}] */
    modelList = [];
    loadCount = 0;
    pending = 0;

    constructor() {
        if (BlockModels.instBlockModels)
            throw new ReferenceError("ERROR: Only 1 instance of Blocks() is allowed.");
        BlockModels.instBlockModels = this;
    }

    static getInstance() {
        if (!BlockModels.instBlockModels)
            BlockModels.instBlockModels = new BlockModels();
        return BlockModels.instBlockModels;
    }

    loaded() {
        return this.pending == 0;
    }

    loadStatus() {
        return {
            count: this.loadCount,
            pending: this.pending
        }
    }

    /** Loads all models */
    async loadAll() {
        const list = [];
        modelsName.forEach(modelName => {
            list.push(this.load(modelName));
        });

        await Promise.all(list).catch(err => {});

        return this.modelList.length;
    }

    get(modelName) {
        return this.modelList[modelName] || null;
    }

    add(modelName, model) {
        this.modelList[modelName] = model;
    }    

    loadJSON(modelName, json) {
        const model = ModelData.load(json);
        this.add(modelName, model);
        return model;
    }    

    /** downloads a model */
    load(modelName) {
        const url = `${Conf.BLOCKMODELS_PATH}${modelName}.json`;
        this.loadCount++;
        this.pending++;

        return fetch(url)
        .then(resp => {
            if (!resp.ok)
                throw new Error(`ERRO: Arquivo do modelo "${modelName}.json" nao encontrado.`);
            return resp.json();

        }).then(json => {
            return this.loadJSON(modelName, json);

        }).catch(err => {
            console.error(err);
            return null;
        }).finally(() => {
            this.pending--;
        });
    }

    countOf(baseName) {
        let count = 0;
        for (let i = 0 ; i < modelsName.length ; i++) {
            if (modelsName[i].startsWith(baseName))
                count++;
        }
        return count;
    }
}
