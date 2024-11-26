import Perlin from "./other/perlin.js";

let canvasSize = 256;

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
    for (let y = 0; y < gridsize; y++) {
        map[y] = [];
        for (let x = 0; x < gridsize; x++) {
            let num = perlin.noise(x, y, 1, smooth);
            let raw = (num / 2) + 0.5;

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
    let x, color;
    for (let y = 0; y < gridSize; y++) {
        for (x = 0; x < gridSize; x++) {
            color = mapa[y][x] * (256 / valueRange) | 0;

            const index = (y * gridSize + x) * 4;
            data[index] = color;
            data[index + 1] = color;
            data[index + 2] = color;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function draw() {
    const seed = Math.random() * 65535 | 0;
    drawPerlinNoise(1, canvasSize, 256, 100, seed);
    drawPerlinNoise(2, canvasSize, 3, 100, seed);
}



function main() {
    //setCanvasSize(512);
    draw();

    document.getElementById('refresh').addEventListener('click', draw);
}
main();
