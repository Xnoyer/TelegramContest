class TgLegend {
    constructor(parent, series) {
        this._chart = parent;
        this._series = series;
        this._theme = parent.theme;

        this._canvasNode = document.createElement('canvas');
        this._canvasNode.classList.add('legend');
        this._canvasNode.classList.add('layer');
        parent.shadowRoot.appendChild(this._canvasNode);
        this._ctx = this._canvasNode.getContext('2d');
    }

    set series(value) {
        this._series = value;
    }

    recalc() {
        this._legendItems = [];
        let x = 0;
        this._ctx.font = '22px Roboto';
        this._series.forEach(series => {
            let name = series.name;
            let width = 0;
            width += this._ctx.measureText(name).width;
            width += this._theme.legend.elementPadding * 3;
            width += this._theme.legend.elementMarkRadius * 2;
            this._legendItems.push({
                x: x,
                y: this._chart.plotArea.x + this._chart.plotArea.h - this._theme.legend.elementHeight,
                height: this._theme.legend.elementHeight,
                width: width
            });
            x += width + this._theme.legend.elementSpacing;
        });
        this._chart.plotArea.h -= (this._theme.legend.elementHeight + this._theme.legend.elementSpacing);
    }

    redraw() {
        let height = this._theme.legend.elementHeight;
        let radius = height / 2;
        this.ctx.strokeStyle = this._theme.secondaryColor;
        this.ctx.lineWidth = this._theme.legend.elementBorder;
        let shift = (this.ctx.lineWidth % 2) * .5;
        for (let i = 0; i < this._legendItems.length; i++) {
            let item = this._legendItems[i];
            this._ctx.fillStyle = this._theme.colors[i];
        }
    }
}