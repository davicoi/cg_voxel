export function binaryIndexOf(arr, target, compare) {
    let left = 0;
    let right = arr.length - 1;
    let mid, res;

    while (left <= right) {
        mid = Math.floor((left + right) / 2);
        res = compare(target, arr[mid]);

        if (res === 0)
            return mid;
        else if (res < 0)
            right = mid - 1;
        else
            left = mid + 1;
    }

    return -1;
}

export function binarySearch(arr, target, compare) {
    const idx = binaryIndexOf(arr, target, compare);
    return idx >= 0 ? arr[idx] : null;
}
