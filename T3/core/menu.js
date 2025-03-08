import Core from "./core.js";
import GUI from '../../libs/util/dat.gui.module.js'
import Conf from "./conf.js";
import MapGenerator from "./mapgenerator.js";

let gui_visible = true;
let gui;

export function createMenu() {
    const core = Core.getInstance();

    const settings = {
        'optimizeBlocks': core.blockRender.optimizeBlocks == true,
        'optimizeSides': core.blockRender.optimizeSides == true,
        'chunkSystem': core.chunkSystem.isEnabled(),
        'distance': core.chunkSystem.getChunkCount(),
        'useFog': core.fog.isEnabled(),
        'lightAutoUpdate': core.light.shadow.autoUpdate,
        'hour': core.getHour(),
        'shadowSize': core.lightControl.getShadowMapSize(),
        'sensivity': Conf.MOUSE_SENSIVITY,
        'onlyLocked': true,

        'randomSeed': true,
        'seed': 0,
        'mapSize': Conf.DEFAULT_SIZE
    };


    gui = new GUI({hideable: false});
    const optFolder = gui.addFolder('Optimizations');

    // optimize
    optFolder.add(settings, 'optimizeBlocks').name('Optimize Blocks').onChange(function (value) {
        const oldValue = core.blockRender.optimizeBlocks;
        core.blockRender.setOptimizeBlocks(value);
        const redraw = core.blockRender.optimizeBlocks != oldValue;
        if (redraw)
            core.blockRender.redraw();
        else if (value != oldValue)
            this.setValue(oldValue);
    });
    
    optFolder.add(settings, 'optimizeSides').name('Optimize Sides').onChange(function (value) {
        const oldValue = core.blockRender.optimizeSides;
        core.blockRender.setOptimizeSides(value);
        const redraw = core.blockRender.optimizeSides != oldValue;
        if (redraw)
            core.blockRender.redraw();
        else if (value != oldValue)
            this.setValue(oldValue);
    });
    
    optFolder.add(settings, 'chunkSystem').name('Chunk System').onChange((value) => {
        const redraw = core.blockRender.chunkSystem != value;
        core.blockRender.enableChunk(value);
        if (redraw)
            core.blockRender.redraw();
    });
    
    optFolder.add(settings, 'distance', 2, 25, 1).name('Distance').onChange((value) => {
        value = parseInt(value);
        const redraw = core.blockRender.chunkCount != value;
        core.chunkSystem.setChunkCount(value);;
        if (redraw) {
            core.blockRender.redraw();
            core.fog.enable(true);
            core.fog.setDistance(value * 8);
            core.lightControl.updateArea();
        }
    });

    // fog
    optFolder.add(settings, 'useFog').name('Fog').onChange(function (value) {
        core.fog.enableFogSystem(value);
    });
    
    // light auto update
    optFolder.add(settings, 'lightAutoUpdate').name('Light Auto Update').onChange(function (value) {
        core.lightControl.setAutoUpdate(value);
    });
    
    optFolder.add(settings, 'hour', 0, 24, 0.1).name('Hour (light)').onChange((value) => {
        core.setHour(value);
    });


    
    // Variável para armazenar a seleção atual
    
    // Adicionar o dropdown ao GUI
    var shadowSizeList = [256, 512, 1024, 2048, 4096];
    optFolder.add(settings, 'shadowSize', shadowSizeList).name('Shadow Map Size').onChange(function (value) {
        core.lightControl.setShadowMapSize(value);
    });

    optFolder.add(settings, 'sensivity', 0.1, 10, 0.1).name('Sensivity').onChange((value) => {
        core.camControl.firstPerson.sensivity = value;
    });
    optFolder.add(settings, 'onlyLocked').name('Mouse only locked').onChange((value) => {
        core.camControl.firstPerson.onlyLockedMov = value;
    });



    // random
    const mapFolder = gui.addFolder('Map');
    mapFolder.add(settings, 'mapSize', 35, 512, 1).name('MapSize');
    mapFolder.add(settings, 'randomSeed').name('Random Seed');
    const seedItem = mapFolder.add(settings, 'seed', 0, 65535, 1).name('Seed Value');

    mapFolder.add({ generateNewMap: () => {
        if (settings.randomSeed) {
            settings.seed = Math.random() * 65535 | 0;
            seedItem.setValue(settings.seed);
        }


        core.workspace.newModel(parseInt(settings.mapSize));
        // MapGenerator.createByPerc(core.workspace.getModelData(), 16, settings.seed);
//        const ids = [8, 9, 10, 11, 2, 1, 1, 1, 1, 1, 7, 7];
//        const ids = [8, 9, 2, 2, 1, 1, 1, 7, 7];
        //const ids = [8, 8, 8, 9, 9, 9, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 7, 7, 7, 7];
        //const ids = [8, 8, 8, 9, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7, 7];
        const ids = [13, 12, 12, 11, 11, 10, 10, 9, 9, 9, 1, 1, 1, 1, 1, 1, 7, 7, 7, 7];
        MapGenerator.createByAlt(core.workspace.getModelData(), 30, ids.length, ids, settings.seed);
        
        core.workspace.redraw();
        core.camControl.centralize();
    
    }}, 'generateNewMap').name('<b>NEW MAP</b>');
    
    optFolder.open();
//    mapFolder.open();
}

export function toggleMenu() {
    gui_visible = !gui_visible;
    if (gui_visible)
        gui.show();
    else
        gui.hide();
}
