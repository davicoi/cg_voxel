export default class Cursor {
    /** @type {HTMLDivElement} */
    cursor;

    constructor() {
        const cursor = document.createElement('div');
        cursor.id = 'cursor';
        cursor.style.display = 'block';
        cursor.style.position = 'absolute';
        cursor.style.width = '4px';
        cursor.style.height = '4px';
        cursor.style.backgroundColor = 'black';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999';
        cursor.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(cursor);
        this.cursor = cursor;

        this.centralize();
    }

    centralize() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
    
        this.cursor.style.left = `${centerX}px`;
        this.cursor.style.top = `${centerY}px`;
    }

    show(enable) {
        this.cursor.style.display = enable ? 'block' : 'none';
    }

    isVisible() {
        return this.cursor.style.display === 'block';
    }
}
