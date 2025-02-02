import * as THREE from    '../../build/three.module.js';
import {initRenderer} from "../../libs/util/util.js";

import BlockModels from "./blockmodels.js";
import BlockRenderer from "./blockrenderer.js";
import Blocks from "./blocks.js";
import ModelData from "./modeldata.js";
import Workspace from "./workspace.js";
import CameraControls from './cameracontrols.js';
import KeyboardState from '../../libs/util/KeyboardState.js';
import WorkGrid from '../builder/workgrid.js';
import WorkPlane from './workplane.js';
import Tool from './tool.js';
import ChunkSystem from './chunksystem.js';
import InstancedDraw from './instanceddraw.js';
import BlockDraw from './blockdraw.js';
import Conf from './conf.js';
import Fog from './fog.js';
import ModelsLoader from './modelsloader.js';
import Character from './character.js';
import LightControl from './lightcontrol.js';


/**
 * 
 */
export default class Core {
    static instance = null;
    backgrounColor = 0xd0d0d0;
    lightHour = 11;

    /** @type {Workspace} */
    workspace;
    /** @type {BlockRenderer} */
    blockRender;
    /** @type {ModelData} */
    mapData;
    /** @type {Blocks} */
    blocks;
    /** @type {BlockModels} */
    blockModels;
    /** @type {CameraControls} */
    camControl;
    /** @type {THREE.Clock} */
    clock;
    /** @type {THREE.KeyboardState} */
    keyboard = new KeyboardState();
    /** @type {Tool} */
    tool = new Tool();
    /** @type {ChunkSystem} */
    chunkSystem;
    /** @type {Fog} */
    fog;
    /** @type {ModelsLoader} */
    models;

    /** @type {THREE.DirectionalLight} */
    light;
    /** @type {THREE.AmbientLight} */
    light2;
    /** @type {THREE.CameraHelper} */
    shadowHelper;

    /** @type {LightControl} */
    lightControl;


    /** @type {BlockDraw|InstancedDraw} */
    blockDraw;

    /** @type {THREE.PerspectiveCamera} */
    camera = null;
    /** @type {THREE.Scene} */
    scene;
    /** @type {THREE.WebGLRenderer} */
    renderer;

    workGrid;

    /** @type {[Character]} */
    characterList = [];
    /** @type {Character} */
    playerModel;


    constructor(size, x, y, z, planeOrGrid = true, backgrounColor = 0xd0d0d0) {
        if (Core.instance)
            throw new ReferenceError("ERROR: Only 1 instance of Core() is allowed.");
        Core.instance = this;

        this.backgrounColor = backgrounColor;
        this.clock = new THREE.Clock(true);
        this.blocks = Blocks.getInstance();

        this.initThreeJS();
        this.loadModels();
        this.initCamera(x, y, z);

        if (Conf.INSTANCED_MESH_OPTIMIZATION)
            this.blockDraw = new InstancedDraw(this, this.scene);
        else
            this.blockDraw = new BlockDraw(this, this.scene);
        this.initWorkspace(size, planeOrGrid);
    }

    setModel(model) {
        this.mapData = model;
    }


    /**
     * @returns {Core}
     */
    static getInstance() {
        return Core.instance;
    }

    async loadModels() {
        this.models = ModelsLoader.getInstance();
        await this.models.loadAll();

        await this.models.wait('player');

        this.playerModel = await Character.create('player');
        this.characterList.push(this.playerModel);

        /** @type {THREE.Object3D} */
        const obj = this.playerModel.getObject3D();
        this.scene.add(obj);

        // fix the scale and center
        const scale = 1.85/3.6;
        this.playerModel.scale = 1.85/3.6;
        obj.scale.set(scale, scale, scale);

        this.playerModel.center.y = 0.4;
        obj.position.x = this.playerModel.center.x;
        obj.position.y = this.playerModel.center.y;
        obj.position.z = this.playerModel.center.z;

        this.lightControl.light.target = this.playerModel.obj;
    }

    initThreeJS() {
        this.scene = new THREE.Scene();
        this.renderer = initRenderer(this.backgrounColor);

        this.lightControl = new LightControl(this.scene);

        //this.initLight();
        // let degree = 0;
        // setInterval(() => {
        //     degree = (degree + 5) % 360;
        //     const rad = degree / 180 * Math.PI;
        //     let x = Math.sin(rad) * 256;
        //     let y = Math.cos(rad) * 256;
        //     this.light.position.set(x, y, 0);
        //     console.log (degree);
        // }, 100);
    }

    setHour(hour) {
        this.lightHour = Math.abs(hour % 24);
    }
    getHour() {
        return this.lightHour;
    }

    initCamera(x, y, z) {
        this.camControl = new CameraControls(this.renderer);
        this.camera = this.camControl.init(x, y, z);
        window.addEventListener('resize', () => {
            this.camControl.resize();            
        }, false);
    }


    initWorkspace(size, planeOrGrid) {
        const workGrid = planeOrGrid ? new WorkPlane(this.scene, false, this.backgrounColor) : new WorkGrid(this.scene, false, this.backgrounColor);

        this.blockRender = new BlockRenderer();
        this.blockModels = new BlockModels();
        this.chunkSystem = new ChunkSystem();

        this.workspace = new Workspace({
            blockRender: this.blockRender,
            workGrid,
            camera: this.camera
        }, null, size);

        this.mapData = this.workspace.getModelData();

        this.blockRender.init();
        this.fog = new Fog();
    }


    createCrosshair() {
        // Criar uma textura de cruz para o HUD
        const canvas = document.createElement('canvas');
        canvas.width = 15;
        canvas.height = 15;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 7);  // Linha horizontal
        ctx.lineTo(15, 7);
        ctx.moveTo(7, 0);  // Linha vertical
        ctx.lineTo(7, 15);
        ctx.stroke();
        
        // Criar a textura para o sprite
        const texture = new THREE.CanvasTexture(canvas);

        // Criar o sprite com a textura
        const material = new THREE.SpriteMaterial({ map: texture });
        const crosshair = new THREE.Sprite(material);
        
        // Ajustar o tamanho do sprite
        crosshair.scale.set(0.1, 0.1, 1);  // Tamanho do sprite (ajustado para 15x15)
        return crosshair;
    }

    renderHUD() {
        const crosshair = this.createCrosshair();
        // Renderizar o HUD (sprite da mira) como uma sobreposição
        // Adiciona o sprite do cursor no centro da tela
        const hudContext = this.renderer.getContext(); // Obter o contexto de renderização
        const width = window.innerWidth;
        const height = window.innerHeight;
        console.log(hudContext);
        this.renderer.get

        // Posicionar a mira no centro da tela
        crosshair.position.set(0, 0, -1);  // Definido para estar sempre na frente da câmera
        
        // Posicionar o sprite de mira no centro da tela (HUD)
        crosshair.position.x = width / 2;
        crosshair.position.y = height / 2;

        // Renderizar a cena 3D
        renderer.render(scene, camera);

        // Aqui, apenas o sprite de mira será desenhado no HUD, sem ser afetado pela cena 3D
        hudContext.drawImage(crosshair, (width / 2) - (crosshair.scale.x * 15 / 2), (height / 2) - (crosshair.scale.y * 15 / 2));
    }


    angleCameraPlayer() {
        const camPos = this.camera.position;
        const playerPos = this.playerModel.obj.position;
        const playerToCam = new THREE.Vector3();
        playerToCam.subVectors(camPos, playerPos);

        const angle = Math.atan2(playerToCam.x, playerToCam.z);
        const deg = angle * 180 / Math.PI;

        return { deg, rad: angle };
    }
}
