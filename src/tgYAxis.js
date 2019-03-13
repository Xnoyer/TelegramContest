class TgYAxis extends TgLayerBase {
    constructor(parent) {
        super(parent);
        this._canvasNode.classList.add('y-axis');
        this._fontSize = 16;
        this._labelHeight = this._fontSize * 1.5;
        this._numOfIntervals = 5;
        this._labels = {};
    }

    set series(value) {
        this._series = value;
        this._data = [];
        value.forEach(series => {
            this._data.push(series.data);
        });
    }

    recalc() {
        this._ctx.font = `${this._fontSize}px Roboto`;
        let dataAnchors = [10, 5, 2.5, 1];
        let dataInterval = this._chart.seriesBounds.max - this._chart.seriesBounds.min;
        let rawDataTick = dataInterval / this._numOfIntervals;
        let powOf10 = Math.round(rawDataTick).toString().length - 1;
        let powered = Math.pow(10, powOf10);
        let minAnchorDiff = Infinity;
        let fittingAnchor;
        for (let i = 0; i < dataAnchors.length; i++) {
            let anchor = dataAnchors[i] * powered;
            let diff = anchor - rawDataTick;
            if (diff >= 0 && diff < minAnchorDiff) {
                minAnchorDiff = diff;
                fittingAnchor = anchor;
            }
        }
        this.dataPoints = [];
        let point;
        if (this._chart.seriesBounds.min > 0) {
            point = Math.floor(this._chart.seriesBounds.min / fittingAnchor) * fittingAnchor;
        } else {
            point = Math.ceil(this._chart.seriesBounds.min / fittingAnchor) * fittingAnchor;
        }
        for (let i = 0; i <= this._numOfIntervals; i++) {
            this.dataPoints.push(point);
            point += fittingAnchor;
        }
        this._height = this._chart.plotArea.h - this._chart.plotArea.y - this._chart.theme.spacing - this._labelHeight;
        this._intervalHeight = Math.floor(this._height / this._numOfIntervals);
        this.points = [];
        let pointY = this._height;
        for (let i = 0; i <= this._numOfIntervals; i++) {
            this.points.push(pointY);
            let label;
            if (!this._labels[this.dataPoints[i]]) {
                label = new TgLabel(this._ctx, this.dataPoints[i]);
                label.recalc();
                this._labels[this.dataPoints[i]] = label;
                label.x = this._chart.plotArea.x + this._chart.theme.spacing + label.width / 2;
                label.y = pointY + this._chart.theme.spacing + this._labelHeight - this._labelHeight / 2;
            }
            pointY -= this._intervalHeight;
        }
    }

    redraw() {
        this._ctx.font = `${this._fontSize}px Roboto, Arial, sans-serif`;
        this._ctx.fillStyle = this._chart.theme.primaryColor;
        this._ctx.strokeStyle = this._chart.theme.secondaryColor;
        this._ctx.lineHeight = 1;
        for (let i = 0; i < this.points.length; i++) {
            this._ctx.moveTo(this._chart.plotArea.x + this._chart.theme.spacing, this._chart.theme.spacing + this._labelHeight + this.points[i] + .5);
            this._ctx.lineTo(this._chart.plotArea.x + this._chart.plotArea.w - this._chart.theme.spacing, this._chart.theme.spacing + this._labelHeight + this.points[i] + .5);
            this._ctx.stroke();
            this._labels[this.dataPoints[i]].render();
        }
    }
}