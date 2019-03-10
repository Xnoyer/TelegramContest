class TgLayerBase {
    constructor(parent) {
        this._chart = parent;
        this._theme = parent.theme;

        this._canvasNode = document.createElement('canvas');
        this._canvasNode.classList.add('legend');
        this._canvasNode.classList.add('layer');
        parent.shadowRoot.appendChild(this._canvasNode);
        this._ctx = this._canvasNode.getContext('2d');
        this._canvasNode.width = parent.width;
        this._canvasNode.height = parent.height;
        this._canvasNode.style.height = parent.width + 'px';
        this._canvasNode.style.height = parent.height + 'px';
    }

    setSize(width, height) {
        this._canvasNode.width = width;
        this._canvasNode.height = height;
        this._canvasNode.style.height = width + 'px';
        this._canvasNode.style.height = height + 'px';
    }

    onMouseMove(coords) {

    }

    onClick(coords) {

    }
}