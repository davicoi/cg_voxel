/** force download of memory data as json */
export function downloadJsonData(filename, jsonData) {
    if (typeof jsonData !== 'string')
        jsonData = JSON.stringify(jsonData, null, 2);

    const blob = new Blob([jsonData], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // filename
    link.href = url;
    link.download = filename;

    link.click();
    URL.revokeObjectURL(url);
}

/** force download of memory data as string */
export function downloadAsciiData(filename, str) {
    const blob = new Blob([str], { type: 'text/plain' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // filename
    link.href = url;
    link.download = filename;

    link.click();
    URL.revokeObjectURL(url);
}

/** force download of memory data as string */
export function downloadBinaryData(filename, str) {
    const blob = new Blob([str], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // filename
    link.href = url;
    link.download = filename;

    link.click();
    URL.revokeObjectURL(url);
}
