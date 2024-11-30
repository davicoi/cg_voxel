import Blocks from "./blocks.js";

export default class Tool {
    selected = 0;
    blocks = Blocks.getInstance();

    constructor() {
        if (Tool.instTool)
            throw new ReferenceError("ERROR: Only 1 instance of Tool() is allowed.")
        Tool.instTool = this;
    }

    getInstance() {
        return Tool.instTool;
    }

    inc() {
        this.selected = Math.min(this.selected + 1, this.blocks.count() - 1);
    }

    dec() {
        this.selected = this.selected <= 1 ? 0 : this.selected - 1;
    }

    getActive() {
        return this.selected;
    }

    set(id) {
        if (id >= 0 && id < this.blocks.count() - 1)
            this.selected = id;
    }
}
