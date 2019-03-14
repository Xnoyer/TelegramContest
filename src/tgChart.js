class TgChart extends HTMLElement {
    static get observedAttributes() {
        return ['chartwidth', 'chartheight'];
    }

    set chartdata(newValue) {
        this._data = newValue;
        this._parseData();
        this.recalc();
        this.redraw();
    }

    get yAxis() {
        return this._yAxis;
    }

    get xAxis() {
        return this._xAxis;
    }

    get series() {
        return this._series;
    }

    getColorForSeries(series) {
        let index = this._series.indexOf(series);
        return this.theme.colors[index % this.theme.colors.length];
    }

    constructor() {
        super();
        this.theme = {
            colors: ['#3CC23F', '#F34C44'],
            primaryColor: '#96A2AA',
            secondaryColor: '#E6ECF0',
            spacing: 20,
            legend: {
                elementHeight: 50,
                elementBorder: 2,
                elementPadding: 10,
                elementMarkRadius: 15,
                elementSpacing: 20,
            },
            scale: {
                height: 50,
                hoverColor: 'rgba(230,230,230,.6)',
                frameColor: 'rgba(0,0,0,.10)',
            }
        };
        this.scaleStart = .4;
        this.scale = .4;
        this.attachShadow({mode: 'open'});
        this._styleNode = document.createElement('style');
        this.shadowRoot.appendChild(this._styleNode);
        this._legend = new TgLegend(this);
        this._scale = new TgScale(this);
        this._xAxis = new TgXAxis(this);
        this._yAxis = new TgYAxis(this);
        this._bindedOnMove = this.onMouseMove.bind(this);
        this._bindedOnUp = this.onMouseUp.bind(this);
        this.addEventListener('mousemove', this.onMouseMove);
        this.addEventListener('mousedown', this.onMouseDown);
        this.addEventListener('mouseup', this.onMouseUp);
        this.addEventListener('click', this.onClick);
    }

    _calcMouseCoords(event) {
        let bRect = this.getBoundingClientRect();
        return {
            x: event.clientX - bRect.left,
            y: event.clientY - bRect.top
        };
    }

    onMouseMove(e) {
        let coords = this._calcMouseCoords(e);
        this._legend.onMouseMove(coords);
        this._scale.onMouseMove(coords);
    }

    onMouseDown(e) {
        let coords = this._calcMouseCoords(e);
        this._legend.onMouseDown(coords);
        this._scale.onMouseDown(coords);
        document.captureEvents(Event.MOUSEMOVE);
        document.addEventListener('mousemove', this._bindedOnMove);
        document.addEventListener('mouseup', this._bindedOnUp);
    }

    onMouseUp(e) {
        let coords = this._calcMouseCoords(e);
        this._legend.onMouseUp(coords);
        this._scale.onMouseUp(coords);
        document.removeEventListener('mousemove', this._bindedOnMove);
        document.removeEventListener('mouseup', this._bindedOnUp);
        document.releaseEvents();
    }

    onClick(e) {
        let coords = this._calcMouseCoords(e);
        this._legend.onClick(coords);
        this._scale.onClick(coords);
    }

    connectedCallback() {
        this._styleSheet = this._styleNode.sheet;
        this._styleSheet.insertRule(
            `:host {
                display: block;
                width: 800;
                height: 600;
                position: relative;
            }`, 0);
        this._styleSheet.insertRule(
            `.layer {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
            }`, 0);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name.toLowerCase()) {
            case 'chartwidth':
                this._width = +newValue;
                this.style.width = this._width + 'px';
                this.recalc();
                break;
            case 'chartheight':
                this._height = +newValue;
                this.style.height = this._height + 'px';
                this.recalc();
                break;
        }
    }

    _parseData() {
        if (!this._data) {
            return;
        }
        this.categories = this._data.columns[0].slice(1);
        this.seriesData = {};
        this.theme.colors = Object.values(this._data.colors);
        this._data.columns.forEach(column => {
            if (column[0] === 'x') {
                return;
            }
            this.seriesData[this._data.names[column[0]]] = column.slice(1);
        });
        TgSeries.callCount = 0;
        this._series = [];
        for (let name in this.seriesData) {
            this._series.push(new TgSeries(this, this.seriesData[name], name));
        }
        this._legend.series = this._series;
        this._scale.series = this._series;
        this._xAxis.categories = this.categories;
        this._xAxis.series = this._series;
    }

    recalc() {
        if (!this._data) {
            return;
        }
        this._resetDimensions();
        this.seriesBounds = this._calcSeriesBounds();
        this._legend.recalc();
        this._scale.recalc();
        this._xAxis.recalc();
        this._yAxis.recalc();
        this._series.forEach(series => {
            series.recalc();
        });
    }

    redraw() {
        if (!this._data) {
            return;
        }
        this._legend.redraw();
        this._scale.redraw();
        this._xAxis.redraw();
        this._yAxis.redraw();
        this._series.forEach(series => {
            series.redraw();
        });
    }

    _calcSeriesBounds() {
        let min = Infinity;
        let max = -Infinity;
        this._series.forEach(series => {
            if (!series.enabled) {
                return;
            }
            series.data.forEach(point => {
                min = Math.min(min, point);
                max = Math.max(max, point);
            });
        });
        return {min: min, max: max};
    }

    _resetDimensions() {
        this._legend.setSize(this._width, this._height);
        this._scale.setSize(this._width, this._height);
        this._xAxis.setSize(this._width, this._height);
        this._yAxis.setSize(this._width, this._height);
        if (this._series && this._series.length) {
            this._series.forEach(series => {
                series.setSize(this._width, this._height)
            });
        }
        this.plotArea = {x: 0, y: 0, w: this._width, h: this._height};
    }
}

window.customElements.define('tg-chart', TgChart);