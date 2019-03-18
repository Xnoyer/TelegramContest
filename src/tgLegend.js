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
        let plotArea = this._chart.plotArea;
        let legendTheme = this._theme.legend;
        this._legendItems = [];
        let x = plotArea.x + this._theme.spacing;
        this._ctx.font = '22px Roboto, Arial, sans-serif';
        this._series.forEach(series => {
            let name = series.name;
            let width = 0;
            width += this._ctx.measureText(name).width;
            width += legendTheme.elementPadding * 3;
            width += legendTheme.elementMarkRadius * 2;
            this._legendItems.push({
                x: Math.round(x),
                y: plotArea.y + plotArea.h - legendTheme.elementHeight - this._theme.spacing,
                height: legendTheme.elementHeight,
                width: Math.round(width),
                name: name,
            });
            x += width + legendTheme.elementSpacing;
        });
        this._chart.plotArea.h -= (legendTheme.elementHeight + this._theme.spacing * 2);
    }

    redraw() {
        this._ctx.clearRect(0, 0, 9999, 9999);
        let legendTheme = this._theme.legend;
        let height = legendTheme.elementHeight;
        let radius = height / 2;
        let shift = (this._ctx.lineWidth % 2) * .5;
        for (let i = 0; i < this._legendItems.length; i++) {
            this._ctx.lineWidth = legendTheme.elementBorder;
            this._ctx.strokeStyle = this._theme.secondaryColor;
            let item = this._legendItems[i];
            this._ctx.fillStyle = this._chart.getColorForIndex(i);
            this._ctx.beginPath();
            this._ctx.moveTo(item.x + radius, item.y + shift);
            this._ctx.lineTo(item.x + item.width - radius, item.y + shift);
            this._ctx.arc(item.x + item.width - radius, item.y + radius, radius, -Math.PI / 2, Math.PI / 2);
            this._ctx.lineTo(item.x + radius, item.y + item.height - shift);
            this._ctx.arc(item.x + radius, item.y + radius, radius, Math.PI / 2, -Math.PI / 2);
            this._ctx.closePath();
            this._ctx.stroke();

            this._ctx.strokeStyle = this._chart.getColorForIndex(i);
            this._ctx.beginPath();
            this._ctx.arc(item.x + radius, item.y + radius, radius - legendTheme.elementPadding, 0, Math.PI * 2);
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
            this._ctx.fillStyle = this._theme.legend.textColor;
            this._ctx.textAlign = 'left';
            this._ctx.textBaseline = 'middle';
            this._ctx.fillText(item.name, item.x + legendTheme.elementMarkRadius * 2 + legendTheme.elementPadding *
                2, item.y + radius);
        }
    }
}