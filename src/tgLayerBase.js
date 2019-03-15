class TgLayerBase {
    constructor(parent) {
        this._chart = parent;
        this._theme = parent.theme;

        this._canvasNode = document.createElement('canvas');
        this._canvasNode.classList.add('layer');
        parent.shadowRoot.appendChild(this._canvasNode);
        this._ctx = this._canvasNode.getContext('2d');
        this._canvasNode.width = parent.width;
        this._canvasNode.height = parent.height;
        this._canvasNode.style.height = parent.width + 'px';
        this._canvasNode.style.height = parent.height + 'px';
        this._animDuration = 200;
        this._animationProgress = 1;
    }

    setSize(width, height) {
        this._canvasNode.width = width;
        this._canvasNode.height = height;
        this._canvasNode.style.height = width + 'px';
        this._canvasNode.style.height = height + 'px';
    }

    onMouseMove(coords) {

    }

    onMouseDown(coords) {

    }

    onMouseUp(coords) {

    }

    onClick(coords) {

    }

    onAnimationFrame(fromLast) {

    }
}