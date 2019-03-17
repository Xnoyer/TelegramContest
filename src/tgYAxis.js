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

    getCoordFromData(dataValue) {
        let top = this._theme.spacing + this._labelHeight;
        let start = this.dataPoints[0];
        let intervals = (dataValue - start) / this._dataInterval;
        return top + this._height - intervals * this._intervalHeight;
    }

    _calculateVisibleBounds() {
        let intervalsLength = this._chart.categories.length - 1;
        // Taking by 1 point out of the border since we're drawing lines to it.
        let startPoint = Math.floor(intervalsLength * this._chart.scaleStart);
        let endPoint = Math.ceil(intervalsLength * (this._chart.scaleStart + this._chart.scale));
        let min = Infinity;
        let max = -Infinity;
        this._chart.series.forEach(series => {
            if (!series.enabled) {
                return;
            }
            let point;
            for (let i = startPoint; i <= endPoint; i++) {
                point = series.data[i];
                min = Math.min(min, point);
                max = Math.max(max, point);
            }
        });
        return {min: min === Infinity ? 0 : min, max: max === -Infinity ? 1 : max};
    }

    onAnimationFrame(fromLast) {
        if (!this._labels) {
            return false;
        }
        let hasChanges = false;
        for (let i = 0; i < this.points.length; i++) {
            let labelHasChanges = this._labels[this.dataPoints[i]].onAnimationFrame(fromLast);
            hasChanges = hasChanges || labelHasChanges;
        }
        this.redraw();
        return hasChanges;
    }

    recalc() {
        let bounds = this._calculateVisibleBounds();
        this._ctx.font = `${this._fontSize}px Roboto`;
        let dataInterval = bounds.max - bounds.min;
        let rawDataTick = dataInterval / this._numOfIntervals;
        let powOf10 = Math.round(rawDataTick).toString().length - 1;
        let powered = Math.pow(10, powOf10);
        let minAnchorDiff = Infinity;
        let fittingAnchor;
        for (let i = 1; i <= 10; i += .5) {
            let anchor = i * powered;
            let diff = anchor - rawDataTick;
            if (diff >= 0 && diff < minAnchorDiff) {
                minAnchorDiff = diff;
                fittingAnchor = anchor;
            }
        }
        this.dataPoints = [];
        let point;
        if (bounds.min > 0) {
            point = Math.floor(bounds.min / fittingAnchor) * fittingAnchor;
        } else {
            point = Math.ceil(bounds.min / fittingAnchor) * fittingAnchor;
        }
        for (let i = 0; i <= this._numOfIntervals; i++) {
            this.dataPoints.push(point);
            point += fittingAnchor;
        }
        this._dataInterval = fittingAnchor;
        this._height = this._chart.plotArea.h - this._chart.plotArea.y - this._theme.spacing - this._labelHeight;
        this._intervalHeight = Math.floor(this._height / this._numOfIntervals);
        this.points = [];
        let pointY = this._height;
        for (let i = 0; i <= this._numOfIntervals; i++) {
            this.points.push(pointY);
            let label;
            if (!this._labels[this.dataPoints[i]]) {
                label = new TgLabel(this._ctx, this.dataPoints[i]);
                this._labels[this.dataPoints[i]] = label;
            } else {
                label = this._labels[this.dataPoints[i]];
            }
            label.draw = true;
            label.recalc();
            label.x = this._chart.plotArea.x + this._theme.spacing + label.width / 2;
            label.y = pointY + this._theme.spacing + this._labelHeight - this._labelHeight / 2;
            pointY -= this._intervalHeight;
        }
    }

    redraw() {
        this._ctx.clearRect(0, 0, 9999, 9999);
        this._ctx.font = `${this._fontSize}px Roboto, Arial, sans-serif`;
        this._ctx.fillStyle = this._theme.primaryColor;
        this._ctx.strokeStyle = this._theme.secondaryColor;
        this._ctx.lineHeight = 1;
        for (let i = 0; i < this.points.length; i++) {
            this._ctx.moveTo(this._chart.plotArea.x + this._theme.spacing, this._theme.spacing + this._labelHeight +
                this.points[i] + .5);
            this._ctx.lineTo(this._chart.plotArea.x + this._chart.plotArea.w -
                this._theme.spacing, this._theme.spacing + this._labelHeight + this.points[i] + .5);
            this._ctx.stroke();
            this._labels[this.dataPoints[i]].redraw();
        }
    }
}