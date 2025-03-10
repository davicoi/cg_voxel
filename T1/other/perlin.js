export default class Perlin {
    constructor(seed = null) {
        // Initialize the permutation array
        this.p = [];
        this.permutation = [
            151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6,
            148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
            74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65,
            25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
            226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2,
            44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
            242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50,
            45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
        ];

        // Populate the p array with a duplicate of permutation array
        for (let i = 0; i < 256; i++) {
            this.p[256 + i] = this.p[i] = this.permutation[i];
        }

        // Set the seed
        this.seed = seed !== null ? seed : Date.now();
        this.seed %= 65536;
    }

    noise(x, y, z, size = null) {
        if (size === null) size = 64; // Default size
        let value = 0.0;
        const initialSize = size;

        // Add finer and finer hues of smoothed noise together
        while (size >= 1) {
            value += this.smoothNoise(x / size, y / size, z / size) * size;
            size /= 2.0;
        }

        return value / initialSize;
    }

    smoothNoise(x, y, z) {
        x += this.seed;
        y += this.seed;
        z += this.seed;

        const X1 = Math.floor(x) & 255;
        const Y1 = Math.floor(y) & 255;
        const Z1 = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.p[X1] + Y1;
        const AA = this.p[A] + Z1;
        const AB = this.p[A + 1] + Z1;
        const B = this.p[X1 + 1] + Y1;
        const BA = this.p[B] + Z1;
        const BB = this.p[B + 1] + Z1;

        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
            this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))),
            this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
        return (h & 1 ? -u : u) + (h & 2 ? -v : v);
    }

    random1D(x) {
        x += this.seed;
        let value = 0.0;
        let size = 3;
        while (size >= 1) {
            value += this.smoothNoise(x * 3 / size, 100 / size, 100 / size);
            size--;
        }

        return value;
    }

    random2D(x, y) {
        x += this.seed;
        y += this.seed;
        let value = 0.0;
        let size = 3;
        while (size >= 1) {
            value += this.smoothNoise(x * 3 / size, y * 3 / size, 100 / size);
            size--;
        }

        return value;
    }
}

/*
// Function to generate Perlin noise map
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


const grid = generatePerlin(50, 3, 30, null);
let str;
for (let y = 0 ; y < 50 ; y++) {
    str = ''
    for (let x = 0 ; x < 50 ; x++) {
        str += grid[y][x];
    }
    console.log (str);
}
*/
