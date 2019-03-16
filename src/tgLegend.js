class TgLegend extends TgLayerBase {
    constructor(parent, series) {
        super(parent);
        this._canvasNode.classList.add('legend');
        this._series = series;
    }

    onMouseMove(coords) {
        if (!this._legendItems || !this._legendItems.length) {
            return;
        }
        this.isOnItem = -1;
        for (let i = 0; i < this._legendItems.length; i++) {
            let item = this._legendItems[i];
            if (coords.x > item.x && coords.x < item.x + item.width) {
                if (coords.y > item.y && coords.y < item.y + item.height) {
                    this.isOnItem = i;
                    this._chart.style.cursor = 'pointer';
                }
            }
        }
        if (this.isOnItem === -1) {
            this._chart.style.cursor = '';
        }
    }

    onClick(coords) {
        if (this.isOnItem !== -1) {
            this._series[this.isOnItem].enabled = !this._series[this.isOnItem].enabled;
            this._chart.recalc();
            this._chart.redraw();
        }
    }

    set series(value) {
        this._series = value;
    }

    recalc() {
        this._legendItems = [];
        let x = this._chart.plotArea.x + this._theme.spacing;
        this._ctx.font = '22px Roboto';
        this._series.forEach(series => {
            let name = series.name;
            let width = 0;
            width += this._ctx.measureText(name).width;
            width += this._theme.legend.elementPadding * 3;
            width += this._theme.legend.elementMarkRadius * 2;
            this._legendItems.push({
                x: x,
                y: this._chart.plotArea.y + this._chart.plotArea.h - this._theme.legend.elementHeight - this._theme.spacing,
                height: this._theme.legend.elementHeight,
                width: width,
                name: name,
            });
            x += width + this._theme.legend.elementSpacing;
        });
        this._chart.plotArea.h -= (this._theme.legend.elementHeight + this._theme.spacing * 2);
    }

    redraw() {
        this._ctx.clearRect(0, 0, 9999, 9999);
        let height = this._theme.legend.elementHeight;
        let radius = height / 2;
        this._ctx.lineWidth = this._theme.legend.elementBorder;
        let shift = (this._ctx.lineWidth % 2) * .5;
        for (let i = 0; i < this._legendItems.length; i++) {
            this._ctx.strokeStyle = this._theme.secondaryColor;
            let item = this._legendItems[i];
            this._ctx.fillStyle = this._theme.colors[i % this._theme.colors.length];
            this._ctx.beginPath();
            this._ctx.moveTo(item.x + radius, item.y + shift);
            this._ctx.lineTo(item.x + item.width - radius, item.y + shift);
            this._ctx.arc(item.x + item.width - radius, item.y + radius, radius, -Math.PI / 2, Math.PI / 2);
            this._ctx.lineTo(item.x + radius, item.y + item.height - shift);
            this._ctx.arc(item.x + radius, item.y + radius, radius, Math.PI / 2, -Math.PI / 2);
            this._ctx.closePath();
            this._ctx.stroke();

            this._ctx.strokeStyle = this._theme.colors[i % this._theme.colors.length];
            this._ctx.beginPath();
            this._ctx.arc(item.x + radius, item.y + radius, radius - this._theme.legend.elementPadding, 0, Math.PI * 2);
            this._ctx.closePath();
            this._ctx.stroke();
            if (this._series[i].enabled) {
                this._ctx.fill();
                this._ctx.lineWidth = 3;
                this._ctx.strokeStyle = '#FFFFFF';
                this._ctx.beginPath();
                this._ctx.moveTo(item.x + radius - 7, item.y + radius);
                this._ctx.lineTo(item.x + radius - 2, item.y + radius + 5);
                this._ctx.lineTo(item.x + radius + 8, item.y + radius - 5);
                this._ctx.stroke();
            }
            this._ctx.fillStyle = '#000000';
            this._ctx.textAlign = 'left';
            this._ctx.textBaseline = 'middle';
            this._ctx.fillText(item.name, item.x + this._theme.legend.elementMarkRadius * 2 + this._theme.legend.elementPadding * 2, item.y + radius);
        }
    }
}