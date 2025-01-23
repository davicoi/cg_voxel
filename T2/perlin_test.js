import GUI from "../libs/util/dat.gui.module.js";
import Perlin from "./other/perlin.js";

let canvasSize = document.getElementById('canvas1').width;

const conf = {
    sameSeed: true,
    randomSeed: true,
    gridSize: canvasSize,

    canvas1: {
        valueRange: canvasSize,
        smooth: 50,
        seed: 128
    },

    canvas2: {
        valueRange: 3,
        smooth: 50,
        seed: 128
    }
}
canvas1 = {
    gridSize: 256,
    valueRange: 256,
    smooth: 0.5,
    seed: 128
};


// resize canvas
function setCanvasSize(size) {
    document.getElementById('canvas1').width = size;
    document.getElementById('canvas1').height = size;
    document.getElementById('canvas2').width = size;
    document.getElementById('canvas2').height = size;
    canvasSize = size;
}

// generate Perlin noise map
function generatePerlin(gridsize = 128, valueRange = 256, smooth = 50, seed = null) {
    if (!seed || seed <= 0) seed = Math.floor(Math.random() * 65536);
    const perlin = new Perlin(seed);

    const map = [];
    let x, num, raw;
    for (let y = 0; y < gridsize; y++) {
        map[y] = [];
        for (x = 0; x < gridsize; x++) {
            num = perlin.noise(x, y, 1, smooth);
            raw = (num / 2) + 0.5;

            num = Math.floor(raw * valueRange);
            num = Math.min(num, valueRange);

            map[y][x] = num;
        }
    }

    return map;
}

// draw map
function drawPerlinNoise(canvasNum = 1, gridSize, valueRange, smooth, seed) {
    const canvas = document.getElementById(`canvas${canvasNum}`);
    const ctx = canvas.getContext('2d');

    // perlin map
    const perlin = new Perlin(seed);
    seed = (!seed || seed < 1) ? null : seed | 0;
    const mapa = generatePerlin(gridSize, valueRange, smooth, seed );

    // draw
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    let x, color, idx;
    for (let y = 0; y < gridSize; y++) {
        for (x = 0; x < gridSize; x++) {
            color = mapa[y][x] * (256 / valueRange) | 0;

            idx = (y * gridSize + x) * 4;
            data[idx] = color;
            data[idx + 1] = color;
            data[idx + 2] = color;
            data[idx + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function draw() {
    const seed1 = !conf.randomSeed ? conf.canvas1.seed : Math.random() * 65535 | 0;
    const seed2 = conf.sameSeed ? seed1 : (!conf.randomSeed ? conf.canvas2.seed : Math.random() * 65535 | 0);

    setCanvasSize(conf.gridSize);

    drawPerlinNoise(1, conf.gridSize, conf.canvas1.valueRange, conf.canvas1.smooth, seed1);
    drawPerlinNoise(2, conf.gridSize, conf.canvas2.valueRange, conf.canvas2.smooth, seed2);
}


function createMenu() {
    const gui = new GUI();

    gui.add(conf, 'sameSeed').name('Same Seed');
    gui.add(conf, 'randomSeed').name('Random Seed');
    gui.add(conf, 'gridSize', 1, 1024, 1).name('Grid Size');
    
    const folder1 = gui.addFolder('Canvas 1');
    folder1.add(conf.canvas1, 'valueRange', 2, 256).name('Value Range');
    folder1.add(conf.canvas1, 'smooth', 0, 500, 1).name('Smooth');
    folder1.add(conf.canvas1, 'seed', 0, 65536).name('Seed');
    folder1.open();

    const folder2 = gui.addFolder('Canvas 2');
    folder2.add(conf.canvas2, 'valueRange', 2, 256).name('Value Range');
    folder2.add(conf.canvas2, 'smooth', 0, 500, 1).name('Smooth');
    folder2.add(conf.canvas2, 'seed', 0, 65536).name('Seed');
    folder2.open();

    
    gui.add({ exec: () => draw() }, 'exec').name('<b style="color: #0AFFFF">GENERATE MAP</b>');
}


function main() {
    createMenu();
    draw();
}
main();
