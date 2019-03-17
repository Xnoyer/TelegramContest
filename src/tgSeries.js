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

    onAnimationFrame(fromLast) {
        if (this._animationProgress < 1 && this._points) {
            this._animationProgress += fromLast / this._animDuration;
            if (this._animationProgress > 1) {
                this._animationProgress = 1;
            }
            this._points.forEach(point => {
                point.y = point.old_y + (point.new_y - point.old_y) * this._animationProgress;
            });
            this.redraw();
            return true;
        } else {
            return false;
        }
    }

    recalc() {
        if (!this._points) {
            this._points = [];
        }
        this._animationProgress = 0;
        for (let i = 0; i < this._data.length; i++) {
            if (this._points.length <= i) {
                this._points.push({
                    old_y: this._chart.plotArea.y + this._chart.plotArea.h - this._chart.theme.spacing,
                    y: this._chart.plotArea.y + this._chart.plotArea.h - this._chart.theme.spacing,
                    new_y: this._chart.yAxis.getCoordFromData(this._data[i]),
                    x: this._chart.xAxis.getCoordForPoint(i),
                });
            } else {
                this._points[i].old_y = this._points[i].y;
                this._points[i].new_y = this._chart.yAxis.getCoordFromData(this._data[i]);
                this._points[i].x = this._chart.xAxis.getCoordForPoint(i);
            }
        }
    }

    redraw() {
        if (!this.enabled) {
            return;
        }
        this._ctx.clearRect(0, 0, 9999, 9999);
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