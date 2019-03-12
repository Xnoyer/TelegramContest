class TgXAxis extends TgLayerBase {
    constructor(parent) {
        super(parent);
        this._monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this._canvasNode.classList.add('x-axis');
        this._fontSize = 16;
        this._labelWidths = [];
        this._labelWidthsSum = 0;
        this._labels = [];
    }

    set categories(categories) {
        this._categories = categories;
        this._ctx.font = `${this._fontSize}px Roboto`;
        this._categories.forEach(category => {
            let date = new Date(category);
            let name = date.getDay() + ' ' + this._monthNames[date.getMonth()];
            let label = new TgLabel(this._ctx, name);
            this._labels.push(label);
            label.recalc();
            this._labelWidths.push(label.width);
            this._labelWidthsSum += label.width;
        });
        this._avgLabelWidth = this._labelWidthsSum / this._labels.length;
    }

    recalc() {
        this._labelY = this._chart.plotArea.y + this._chart.plotArea.h - this._fontSize * 1.5 / 2;
        let realWidth = this._chart.plotArea.w - this._chart.plotArea.x - this._chart.theme.spacing * 2;
        let scaledWidth = realWidth / this._chart.scale;
        let labelX = -scaledWidth * this._chart.scaleStart + this._chart.theme.spacing + this._avgLabelWidth / 2;
        let distanceForLabel = scaledWidth / (this._labels.length - 1);
        let showEach = Math.round(this._labelWidthsSum * 2 / scaledWidth) || 1;
        this.points = [];
        for (let i = 0; i < this._labels.length; i++) {
            this._labels[i].draw = true;
            this.points.push(labelX);
            if (i % showEach > 0 || labelX < 0 || labelX > this._chart.theme.spacing + realWidth) {
                this._labels[i].draw = false;
                labelX += distanceForLabel;
                continue;
            }
            this._labels[i].x = labelX;
            this._labels[i].y = this._labelY;
            labelX += distanceForLabel;
        }

        this._chart.plotArea.h -= this._fontSize * 1.5;
    }

    redraw() {
        this._ctx.font = `${this._fontSize}px Roboto`;
        this._labels.forEach(label => {
            if (label.draw) {
                label.render();
            }
        });
        this._ctx.strokeStyle = this._chart.theme.secondaryColor;
        this._ctx.lineWidth = 1;
        let y = this._labelY - this._fontSize * 1.5 / 2;
        if (y % 1 === 0) {
            y += .5;
        }
        this._ctx.beginPath();
        this._ctx.moveTo(this._chart.plotArea.x + this._chart.theme.spacing, y);
        this._ctx.lineTo(this._chart.plotArea.x + this._chart.plotArea.w - this._chart.theme.spacing, y);
        this._ctx.stroke();
    }
}