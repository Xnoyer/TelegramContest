class TgChart extends HTMLElement {
    static get observedAttributes() {
        return ['chartwidth', 'chartheight'];
    }

    set chartdata(newValue) {
        this._data = newValue;
        this.recalc();
    }

    constructor() {
        super();
        this.theme = {
            colors: ['#3CC23F', '#F34C44'],
            secondaryColor: '#E6ECF0',
            legend: {
                elementHeight: 100,
                elementBorder: 2,
                elementPadding: 20,
                elementMarkRadius: 30,
                elementSpacing: 40,
            }
        };
        this.attachShadow({mode: 'open'});
        this._styleNode = document.createElement('style');
        this.shadowRoot.appendChild(this._styleNode);
        this._legend = new TgLegend(this);
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
        if (!this._data || !this._data.length) {
            return;
        }
        this._resetDimensions();
        TgSeries.callCount = 0;
        this._series = [];
        this._data.forEach(seriesData => {
            this._series.push(new TgSeries(this, seriesData));
        });
        this._legend.series = this._series;
    }

    _resetDimensions() {
        this.plotArea = {x: 0, y: 0, w: this._width, h: this._height};
    }
}

window.customElements.define('tg-chart', TgChart);