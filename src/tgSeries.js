class TgSeries extends TgLayerBase {
    constructor(parent, data, name) {
        super(parent);
        this._canvasNode.classList.add('series');
        TgSeries.callCount++;
        this._data = data;
        this.name = name || 'TgSeries ' + TgSeries.callCount;
        this.enabled = true;
    }

    get data() {
        return this._data;
    }

    recalc() {
        this._points = [];
        for (let i = 0; i < this._data.length; i++) {
            this._points.push({
                y: this._chart.yAxis.getCoordFromData(this._data[i]),
                x: this._chart.xAxis.getCoordForPoint(i),
            });
        }
    }

    redraw() {
        if (!this.enabled) {
            return;
        }
        this._ctx.lineWidth = 3;
        this._ctx.strokeStyle = this._chart.getColorForSeries(this);
        for (let i = 0; i < this._points.length - 1; i++) {
            if (this._points[i + 1].x < 0 || this._points[i].x > this._chart.plotArea.x + this._chart.plotArea.w) {
                continue;
            }
            this._ctx.beginPath();
            this._ctx.moveTo(this._points[i].x, this._points[i].y);
            this._ctx.lineTo(this._points[i + 1].x, this._points[i + 1].y);
            this._ctx.stroke();
        }
    }
}

TgSeries.callCount = 0;