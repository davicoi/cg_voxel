import Conf from "./conf.js";
import ModelData from "./modeldata.js";

const modelsName = [
    'tree1', 'tree2', 'tree3', 'tree4', 'tree5'
];


export default class BlockModels {
    /** @type [{ModelData}] */
    modelList = [];

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

        return fetch(url)
        .then(resp => {
            if (!resp.ok)
                throw new Error(`ERRO: Arquivo do modelo "${modelName}.json" nao encontrado.`);
            return resp.json();

        }).then(json => {
            return this.loadJSON(modelName, json);

        }).catch(err => {
            //alert (`ERRO: Nao foi possivel carretar o arquivo "${modelName}.json".`);
            console.error(err);
            return null;
        });
    }
}
