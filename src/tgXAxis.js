class TgXAxis extends TgLayerBase {
    constructor(parent) {
        super(parent);
        this._monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this._canvasNode.classList.add('x-axis');
        this._fontSize = 16;
        this._labelHeight = this._fontSize * 2;
        this._labelWidths = [];
        this._labelWidthsSum = 0;
        this._labels = [];
    }

    set categories(categories) {
        this._categories = categories;
        this._ctx.font = `${this._fontSize}px Roboto`;
        this._categories.forEach(category => {
            let date = new Date(category);
            let name = (date.getDay() + 1) + ' ' + this._monthNames[date.getMonth()];
            let label = new TgLabel(this._ctx, name);
            this._labels.push(label);
            label.recalc();
            this._labelWidths.push(label.width);
            this._labelWidthsSum += label.width;
        });
        this._avgLabelWidth = this._labelWidthsSum / this._labels.length;
    }

    onAnimationFrame(fromLast) {
        if (!this._labels) {
            return false;
        }
        let hasChanges = false;
        this._labels.forEach(label => {
            let labelHasChanges = label.onAnimationFrame(fromLast);
            hasChanges = hasChanges || labelHasChanges;
        });
        this.redraw();
        return hasChanges;
    }

    getCoordForPoint(point) {
        return this.points[point];
    }

    recalc() {
        this._labelY = this._chart.plotArea.y + this._chart.plotArea.h - this._labelHeight / 2;
        let realWidth = this._chart.plotArea.w - this._chart.plotArea.x - this._theme.spacing * 2;
        let scaledWidth = realWidth / this._chart.scale;
        let labelX = -scaledWidth * this._chart.scaleStart + this._theme.spacing + this._avgLabelWidth / 2;
        let distanceForLabel = scaledWidth / (this._labels.length - 1);
        let showEach = Math.round(this._labelWidthsSum * 2 / scaledWidth) || 1;
        this.points = [];
        for (let i = 0; i < this._labels.length; i++) {
            this.points.push(labelX - this._avgLabelWidth / 2);
            this._labels[i].x = labelX;
            this._labels[i].y = this._labelY;
            if (i % showEach > 0 || labelX < 0 || labelX > this._theme.spacing + realWidth) {
                this._labels[i].draw = false;
            } else {
                if (!this._labels[i].draw) {
                    this._labels[i].draw = true;
                }
            }
            labelX += distanceForLabel;
        }

        this._chart.plotArea.h -= this._labelHeight;
    }

    redraw() {
        this._ctx.clearRect(0, 0, 9999, 9999);
        this._ctx.font = `${this._fontSize}px Roboto, Arial, sans-serif`;
        this._ctx.fillStyle = this._theme.primaryColor;
        this._labels.forEach(label => {
            if (label.draw) {
                label.redraw();
            }
        });
        this._ctx.strokeStyle = this._theme.secondaryColor;
        this._ctx.lineWidth = 1;
        let y = this._labelY - this._labelHeight / 2;
        if (y % 1 === 0) {
            y += .5;
        }
        this._ctx.beginPath();
        this._ctx.moveTo(this._chart.plotArea.x + this._theme.spacing, y);
        this._ctx.lineTo(this._chart.plotArea.x + this._chart.plotArea.w - this._theme.spacing, y);
        this._ctx.stroke();
    }
}