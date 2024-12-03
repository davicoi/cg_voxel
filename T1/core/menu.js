import Core from "./core.js";
import GUI from '../../libs/util/dat.gui.module.js'
import Conf from "./conf.js";
import MapGenerator from "./mapgenerator.js";

export function createMenu() {
    const core = Core.getInstance();

    const settings = {
        'optimizeBlocks': core.blockRender.optimizeBlocks == true,
        'optimizeSides': core.blockRender.optimizeSides == true,
        'chunkSystem': core.chunkSystem.isEnabled(),
        'distance': core.chunkSystem.getChunkCount(),

        'randomSeed': true,
        'seed': 0,
        'mapSize': Conf.DEFAULT_SIZE

    };


    const gui = new GUI();
    const optFolder = gui.addFolder('Optimizations');

    // optimize
    optFolder.add(settings, 'optimizeBlocks').name('Optimize Blocks').onChange((value) => {
        const redraw = core.blockRender.optimizeBlocks != value;
        core.blockRender.optimizeBlocks = value;
        if (redraw)
            core.blockRender.redraw();
    });
    
    optFolder.add(settings, 'optimizeSides').name('Optimize Sides').onChange((value) => {
        const redraw = core.blockRender.optimizeSides != value;
        core.blockRender.optimizeSides = value;
        if (redraw)
            core.blockRender.redraw();
    });
    
    optFolder.add(settings, 'chunkSystem').name('Chunk System').onChange((value) => {
        const redraw = core.blockRender.chunkSystem != value;
        core.blockRender.enableChunk(value);
        if (redraw)
            core.blockRender.redraw();
    });
    
    optFolder.add(settings, 'distance', 2, 50, 1).name('Distance').onChange((value) => {
        value = parseInt(value);
        const redraw = core.blockRender.chunkCount != value;
        core.chunkSystem.setChunkCount(value);;
        if (redraw)
            core.blockRender.redraw();
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
        MapGenerator.createByPerc(core.workspace.getModelData(), 16, settings.seed);
        core.workspace.redraw();
        core.camControl.center();
    
    }}, 'generateNewMap').name('<b>NEW MAP</b>');
    
    optFolder.open();
    mapFolder.open();
}
