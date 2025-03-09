export default class Cursor {
    /** @type {HTMLDivElement} */
    cursor;

    constructor() {
        const cursor = document.createElement('div');
        cursor.id = 'cursor';
        cursor.style.display = 'block';
        cursor.style.position = 'absolute';
        cursor.style.width = '24px';
        cursor.style.height = '24px';
        //cursor.style.backgroundColor = 'black';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999';
        cursor.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(cursor);
        this.cursor = cursor;

        cursor.innerHTML = `<svg width="24px" height="24px" viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enable-background="new 0 0 76.00 76.00" xml:space="preserve">
	                            <path fill="#000000" fill-opacity="1" stroke-width="0.2" stroke-linejoin="round" d="M 35,19L 41,19L 41,35L 57,35L 57,41L 41,41L 41,57L 35,57L 35,41L 19,41L 19,35L 35,35L 35,19 Z "/>
                            </svg>`;

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
