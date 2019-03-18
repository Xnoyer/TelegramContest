class TgHoverLayer extends TgLayerBase {
    constructor(parent) {
        super(parent);
        this._canvasNode.classList.add('hover');
    }

    drawPoints(points) {
        this.clear();
        this._ctx.lineWidth = 3;
        this._ctx.fillStyle = this._theme.hoverFill;
        points.forEach(point => {
            this._ctx.strokeStyle = point.color;
            this._ctx.beginPath();
            this._ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
            this._ctx.fill();
            this._ctx.stroke();
        });
    }

    clear() {
        this._ctx.clearRect(0, 0, 9999, 9999);
    }
}