import GUI from '../../libs/util/dat.gui.module.js'
import Core from '../core/core.js';
import Workspace from '../core/workspace.js';
import { downloadBinaryData, downloadJsonData } from '../other/download.js';
import BuilderMouseMove from './buildermousemove.js';
import { GLTFExporter } from '../../build/jsm/exporters/GLTFExporter.js';


export default class BuilderMenu {
    /** @type {GUI} */
    gui;
    /** @type {Workspace} */
    workspace;
    /** #@type {BuilderMouseMove} */
    mouseControl;

    modelConf = {
        size: 10,
        modelName: '',
        mouseEnable: true,
        nameCtl: null
    }

    /**
     * Constructor
     * @param {Workspace} workspace
     * @param {BuilderMouseMove} workspace
     */
    constructor(workspace, mouseControl) {
        this.workspace = workspace;        
        this.mouseControl = mouseControl;

        this.gui = new GUI();

    }

    createMenu() {
        const controls = {
            /** create new model */
            newModel: () => {
                this.workspace.newModel(parseInt(this.modelConf.size) || 10);
            },

            /** save model */
            save: () => {
                let fname = this.modelConf.modelName.trim() != '' ? this.modelConf.modelName.trim() : `model_${(new Date()).getTime()}`;
                fname = prompt('Informe um nome para o arquivo', fname);
                if (fname) {
                    downloadJsonData(`${fname}.json`, this.workspace.getModelData().dump());
                    this.modelConf.nameCtl.setValue(fname);
                }
            },

            /** load model */
            load: () => {
                let fname = this.modelConf.modelName.trim() != '' ? this.modelConf.modelName.trim() : `model_${(new Date()).getTime()}`;
                fname = prompt('Informe o nome do modelo', fname);
                if (fname) {
                    fetch(`./assets/blockmodel/${fname}.json`)
                    .then(resp => {
//                         if (!resp.ok) {
// //                            throw new Error(`ERRO: Arquivo do modelo "${fname}.json" não encontrado.`);
//                             alert(`ERRO: Arquivo do modelo "${fname}.json" não encontrado.`);
//                         }

                        return resp.json();

                    }).then(json => {
                        this.workspace.loadModel(json);
                        this.modelConf.nameCtl.setValue(fname);
                        Core.getInstance().camControl.update();

                    }).catch(err => {
                        alert (`ERRO: Não foi possível carretar o arquivo "${fname}.json".`);
                        console.error(err);
                    });
                }
            },

            /** export model */
            export: () => {
                const exporter = new GLTFExporter();
                const core = Core.getInstance();

                core.workspace.workGrid.show(false);
                const options = {
                    binary: true,
                    onlyVisible: true
                };
                exporter.parse(core.scene, (gltf) => {
                    downloadBinaryData('model.glb', gltf);
                    core.workspace.workGrid.show(true);
                }, undefined, options);
            }
        }

        // menu
        const folderConf = this.gui.addFolder('Conf');
        this.modelConf.nameCtl = folderConf.add(this.modelConf, 'modelName').name("Name");
        folderConf.add(this.modelConf, 'mouseEnable').name("Mouse enable").onChange((status) => {
            this.mouseControl.enable(status);
        });
        folderConf.open();

        const folderNew = this.gui.addFolder('New model');
        folderNew.add(this.modelConf, 'size', 10, 100, 2).name("Size");
        folderNew.add(controls, 'newModel').name("<b>NEW</b>");
        folderNew.open();

        const folderModel = this.gui.addFolder('Model');
        folderModel.add(controls, 'save').name("<b>SAVE</b>");
        folderModel.add(controls, 'export').name("<b>EXPORT (.GLB)</b>");
        folderModel.add(controls, 'load').name("<b>LOAD</b>");
        folderModel.open();
    }
}
