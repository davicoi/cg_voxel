import Conf from './conf.js';
import Chunk from './chunk.js'
import Core from './core.js';
import LightControl from './lightcontrol.js';

export default class ChunkSystem {
    static instance = null;

    enabled = false;
    chunkCount = 2;
    chunkSize = Conf.CHUNK_SIZE;
    gridSize = 0;
    activeRect = {x: 0, z: 0, maxX: 0, maxZ: 0}

    constructor() {
        if (ChunkSystem.instance)
            throw new ReferenceError("ERROR: Only 1 instance of ChunkSystem() is allowed.");
        ChunkSystem.instance = this;
        this.setChunkCount(Conf.DEFAULT_CHUNK_COUNT);
    }

    /**
     * @returns {ChunkSystem}
     */
    static getInstance() {
        if (!ChunkSystem.instance)
            ChunkSystem.instance = new ChunkSystem();
        return ChunkSystem.instance;
    }

    getActive() {
        if (!this.activeRect || this.activeRect.maxX == 0 || this.activeRect.maxZ == 0)
            return null;

        // FIXME: 1 to 1.5
        const moveRadius = (1 * Conf.CHUNK_SIZE) / 2;
        let alwaysVisible = (this.activeRect.maxX - this.activeRect.x) / 2
        if (this.gridSize < this.activeRect.maxX - this.activeRect.x)
            alwaysVisible -= moveRadius;
        
        return {
            rect: this.activeRect,
            maxRadius: (this.activeRect.maxX - this.activeRect.x) / 2,
            alwaysVisible: (this.activeRect.maxX - this.activeRect.x) / 2 - moveRadius,
            moveRadius
        }
    }


    setEnable(enabled) {
        this.enabled = enabled;
    }

    isEnabled() {
        return this.enabled;
    }

    setChunkCount(count) {
        this.chunkCount = count | 0;
        this.gridSize = (1 + this.chunkCount * 2) * Conf.CHUNK_SIZE;
        const core = Core.getInstance();
        if (core && core.fog)
            core.fog.updateDistance();

        LightControl.getInstance().updateArea();
    }

    getChunkCount() {
        return this.chunkCount;
    }

    getRect(x, z, mapSize) {
        const gridSize = this.gridSize;

        if (!this.enabled || gridSize >= mapSize) {
            return { x: 0, z: 0, maxX: mapSize, maxZ: mapSize };
        }
        
        mapSize = Math.ceil(mapSize / this.chunkSize) * this.chunkSize;
        x = parseInt(x - this.chunkCount * this.chunkSize);
        z = parseInt(z - this.chunkCount * this.chunkSize);
    
        if (x + gridSize > mapSize)
            x = mapSize - gridSize;
        if (x < 0)
            x = 0;
        
        if (z + gridSize > mapSize)
            z = mapSize - gridSize;
        if (z < 0)
            z = 0;

        x = parseInt(x / this.chunkSize) * this.chunkSize;
        z = parseInt(z / this.chunkSize) * this.chunkSize;
    
        return { x, z, maxX: x + gridSize, maxZ: z + gridSize }
    }

    getCoordList() {
        const list = [];
        let i, ref;
        const rect = this.activeRect;
        for (let j = rect.z ; j < rect.maxZ ; j += Conf.CHUNK_SIZE) {
            for (i = rect.x ; i < rect.maxX ; i += Conf.CHUNK_SIZE) {
                ref = Chunk.refFrom(i, j);
                list.push({x: i, z: j, ref});
            }
        }
        return list;
    }

    setActive(rect) {
        this.activeRect = rect;
    }

    isEqual(rect) {
        return (this.activeRect.x == rect.x && this.activeRect.y == rect.y &&
                this.activeRect.maxX == rect.maxX && this.activeRect.maxZ == rect.maxZ);
    }
}
