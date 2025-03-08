/**
 * Convert a Uint8Array to a hex string
 * @param {Uint8Array} uint8array 
 * @returns 
 */
export function uint8ToHex(uint8array) {
    let str = '';
    for (let i = 0; i < uint8array.length; i++) {
        str += uint8array[i].toString(16).padStart(2, '0');
    }
    return str;
}

/**
 * Convert a Uint8Array to a hex string and removing empty data
 * @param {Uint8Array} uint8array 
 * @returns 
 */
export function trimmedUint8ToHex(uint8array) {
    let size = uint8array.length - 1;

    // calc size of data
    for (; size >= 0 && !uint8array[size] ; size--);
    if (size < 0)
        size = 0;
    if (uint8array[size])
        size++;

    //
    let str = '';
    for (let i = 0; i < size ; i++) {
        str += uint8array[i].toString(16).padStart(2, '0');
    }
    return str;
}

/**
 * Convert a hex string to a Uint8Array
 * @param {string} strInHex 
 * @returns {Uint8Array}
 */
export function hexToUint8(strInHex) {
    const size = strInHex.length;
    let data = new Uint8Array(size);

    let idx = 0;
    for (let i = 0 ; i < size ; i++) {
        data[i] = parseInt(`${strInHex[idx++]}${strInHex[idx++]}`, 16);
    }
    return data;
}
