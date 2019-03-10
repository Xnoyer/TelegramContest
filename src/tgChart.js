class TgChart extends HTMLElement {
    static get observedAttributes() {
        return ['chartwidth', 'chartheight'];
    }

    set chartdata(newValue) {
        this._data = newValue;
        this.recalc();
        this.redraw();
    }

    constructor() {
        super();
        this.theme = {
            colors: ['#3CC23F', '#F34C44'],
            secondaryColor: '#E6ECF0',
            legend: {
                elementHeight: 50,
                elementBorder: 2,
                elementPadding: 10,
                elementMarkRadius: 15,
                elementSpacing: 20,
            }
        };
        this.attachShadow({mode: 'open'});
        this._styleNode = document.createElement('style');
        this.shadowRoot.appendChild(this._styleNode);
        this._legend = new TgLegend(this);
        this.addEventListener('mousemove', this.onMouseMove);
        this.addEventListener('click', this.onClick);
    }

    onMouseMove(e) {
        let bRect = this.getBoundingClientRect();
        let coords = {
            x: e.clientX - bRect.left,
            y: e.clientY - bRect.top
        };
        this._legend.onMouseMove(coords);
    }

    onClick(e) {
        let bRect = this.getBoundingClientRect();
        let coords = {
            x: e.clientX - bRect.left,
            y: e.clientY - bRect.top
        };
        this._legend.onClick(coords);
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

    recalc() {
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
        this._resetDimensions();
        TgSeries.callCount = 0;
        this._series = [];
        for (let name in this.seriesData) {
            this._series.push(new TgSeries(this, this.seriesData[name], name));
        }
        this._legend.series = this._series;
        this._legend.recalc();
    }

    redraw() {
        if (!this._data) {
            return;
        }
        this._legend.redraw();
    }

    _resetDimensions() {
        this._legend.setSize(this._width, this._height);
        if (this._series && this._series.length) {
            this._series.forEach(series => {
                series.setSize(this._width, this._height)
            });
        }
        this.plotArea = {x: 0, y: 0, w: this._width, h: this._height};
    }
}

window.customElements.define('tg-chart', TgChart);