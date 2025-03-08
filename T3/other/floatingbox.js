export default class FloatingBox {
    /** @type {HTMLDivElement} */
    div;
    constructor(id, left = 10, top = 10) {
        this.div = document.createElement( 'div' );
        if (id)
            this.div.id = id;
        this.div.style.position = 'fixed';
        this.div.style.top = `${top}px`;
        this.div.style.left = `${left}px`;
        this.div.style.width = 'min-content';
        this.div.style.height = 'min-content';
        this.div.style.whiteSpace = 'nowrap';
        this.div.style.backgroundColor = '#000';
        this.div.style.color = 'white'
        this.div.style.padding = '10px'
        this.div.style.opacity = '0.5';
        document.body.appendChild( this.div );
    }

    setText(text) {
        this.div.innerHTML = text;
    }

    remove() {
        this.div.remove();
    }

    visible(visible) {
        this.div.style.display = visible ? 'block' : 'none';
    }

    toggle() {
        this.div.style.display = this.div.style.display === 'none' ? 'block' : 'none';
    }
}
