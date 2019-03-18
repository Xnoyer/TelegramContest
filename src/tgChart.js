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

    get theme() {
        return this._theme;
    }

    get themeIndex() {
        return this._themes.indexOf(this._theme);
    }

    set themeIndex(value) {
        this._theme = this._themes[value];
        this._legend.theme = this._theme;
        this._xAxis.theme = this._theme;
        this._yAxis.theme = this._theme;
        this._scale.theme = this._theme;
        this._hoverLayer.theme = this._theme;
        this.redraw();
    }

    _onWindowAnimationFrame() {
        if (!this._tabIsActive || !this._data) {
            return;
        }
        this._animationStopped = false;
        let fromLast = Date.now() - this._animPrevTime;
        this._hasAnimationChanges = false;
        if (this._scale.onAnimationFrame(fromLast)) {
            this._hasAnimationChanges = true;
        }
        if (this._xAxis.onAnimationFrame(fromLast)) {
            this._hasAnimationChanges = true;
        }
        if (this._yAxis.onAnimationFrame(fromLast)) {
            this._hasAnimationChanges = true;
        }
        let seriesHasChanges = false;
        this._series.forEach(series => {
            let certainSeriesHasChanges = series.onAnimationFrame(fromLast);
            seriesHasChanges = seriesHasChanges || certainSeriesHasChanges;
        });
        this._hasAnimationChanges = this._hasAnimationChanges || seriesHasChanges;
        this._animPrevTime = Date.now();
        if (this._hasAnimationChanges) {
            window.requestAnimationFrame(this._bindedOnAnimationFrame);
        } else {
            this._animationStopped = true;
        }
    }

    getColorForSeries(series) {
        let index = this._series.indexOf(series);
        return this.getColorForIndex(index);
    }

    getColorForIndex(index) {
        return this._theme.colors[index % this.theme.colors.length];
    }

    constructor() {
        super();
        this._themes = [
            {
                colors: ['#3CC23F', '#F34C44'],
                primaryColor: '#96A2AA',
                secondaryColor: '#E6ECF0',
                hoverFill: '#FFFFFF',
                spacing: 20,
                legend: {
                    elementHeight: 50,
                    elementBorder: 2,
                    elementPadding: 10,
                    elementMarkRadius: 15,
                    elementSpacing: 20,
                    textColor: 'rgb(0,0,0)',
                },
                scale: {
                    height: 50,
                    hoverColor: 'rgba(230,230,230,.6)',
                    frameColor: 'rgba(0,0,0,.10)',
                }
            }, {
                colors: ['#3CC23F', '#F34C44'],
                primaryColor: '#546778',
                secondaryColor: '#344658',
                hoverFill: '#242F3E',
                spacing: 20,
                legend: {
                    elementHeight: 50,
                    elementBorder: 2,
                    elementPadding: 10,
                    elementMarkRadius: 15,
                    elementSpacing: 20,
                    textColor: 'rgb(232,232,232)',
                },
                scale: {
                    height: 50,
                    hoverColor: 'rgba(0,0,0,.2)',
                    frameColor: 'rgba(255,255,255,.10)',
                }
            }
        ];
        this._theme = this._themes[0];
        this._daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        this._monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.scaleStart = 0;
        this.scale = .19;
        this._tabIsActive = true;
        this.attachShadow({mode: 'open'});
        this._styleNode = document.createElement('style');
        this._tooltipNode = document.createElement('div');
        this._tooltipNode.classList.add('tooltip');
        this.shadowRoot.appendChild(this._styleNode);
        this.shadowRoot.appendChild(this._tooltipNode);
        this._tooltipHeaderContainer = document.createElement('div');
        this._tooltipSeriesContainer = document.createElement('div');
        this._tooltipHeaderContainer.classList.add('header-container');
        this._tooltipSeriesContainer.classList.add('series-container');
        this._tooltipNode.appendChild(this._tooltipHeaderContainer);
        this._tooltipNode.appendChild(this._tooltipSeriesContainer);
        this._templateNode = document.createElement('template');
        this._templateNode.innerHTML = `
            <div class="series-value">
                <div class="value">Value</div>
                <span class="name">Name</span>
            </div>
        `;
        this.shadowRoot.appendChild(this._templateNode);
        this._legend = new TgLegend(this);
        this._scale = new TgScale(this);
        this._xAxis = new TgXAxis(this);
        this._yAxis = new TgYAxis(this);
        this._hoverLayer = new TgHoverLayer(this);
        this._bindedOnMove = this.onMouseMove.bind(this);
        this._bindedOnUp = this.onMouseUp.bind(this);
        this._bindedOnAnimationFrame = this._onWindowAnimationFrame.bind(this);
        this._bindedOnWindowFocus = this._onWindowFocus.bind(this);
        this._bindedOnWindowBlur = this._onWindowBlur.bind(this);
        this.addEventListener('mousemove', this.onMouseMove);
        this.addEventListener('mousedown', this.onMouseDown);
        this.addEventListener('mouseup', this.onMouseUp);
        this.addEventListener('click', this.onClick);
        window.addEventListener('focus', this._bindedOnWindowFocus);
        window.addEventListener('blur', this._bindedOnWindowBlur);
        this._animationStopped = true;
        this._startAnimation();
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
        this._xAxis.onMouseMove(coords);
    }

    onMouseDown(e) {
        let coords = this._calcMouseCoords(e);
        this._legend.onMouseDown(coords);
        this._scale.onMouseDown(coords);
        document.captureEvents();
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

    _onWindowFocus() {
        this._tabIsActive = true;
        this._startAnimation();
    }

    _onWindowBlur() {
        this._tabIsActive = false;
        this._animationStopped = true;
    }

    _onPointHovered(index) {
        if (index === null) {
            this._tooltipNode.style.display = 'none';
            this._hoverLayer.clear();
            return;
        }
        this._tooltipNode.style.display = '';
        let points = this._series.map(series => {
            return series.data[index];
        });
        this._tooltipSeriesContainer.innerHTML = '';
        let half = null;
        let xCoord = this._xAxis.getCoordForPoint(index);
        let pointsToDrawOnHover = points.map((point, i) => {
            let value = point.toFixed(2).replace(/0*$/g, '').replace(/\.$/g, '');
            let seriesDataNode = this._templateNode.content.cloneNode(true);
            let color = this.getColorForIndex(i);
            let yCoord = this._yAxis.getCoordFromData(point);
            seriesDataNode.querySelector('.series-value .value').innerHTML = value;
            seriesDataNode.querySelector('.series-value .name').innerHTML = this._series[i].name;
            seriesDataNode.querySelector('.series-value').style.color = color;
            this._tooltipSeriesContainer.appendChild(seriesDataNode);
            if (half !== -1) {
                if (yCoord < this.plotArea.y + this.plotArea.h / 2) {
                    half = half === null ? 0 : (half === 0 ? 0 : -1);
                } else {
                    half = half === null ? 1 : (half === 1 ? 1 : -1);
                }
            }
            return {
                x: xCoord,
                y: yCoord,
                color: color,
            };
        });
        let horHalf = (xCoord < this.plotArea.x + this.plotArea.w / 2) ? 0 : 1;
        this._hoverLayer.drawPoints(pointsToDrawOnHover);
        let date = new Date(this.categories[index]);
        let header = `${this._daysOfWeek[date.getDay()]}, ${this._monthNames[date.getMonth()]} ${date.getDate()}`;
        this._tooltipHeaderContainer.innerHTML = header;
        let tooltipBounds = this._tooltipNode.getBoundingClientRect();
        let x;
        let y;
        if (half === -1) {
            x = horHalf === 0 ? xCoord + 12 : xCoord - tooltipBounds.width - 12;
            y = this.plotArea.y + this.plotArea.h / 2;
        } else {
            x = xCoord - tooltipBounds.width / 2;
            y = (half === 1 ? this.plotArea.y + this.plotArea.h / 4 : this.plotArea.y + this.plotArea.h * .75) -
                tooltipBounds.height / 2;
        }
        this._tooltipNode.style.top = y + 'px';
        this._tooltipNode.style.left = Math.min(Math.max(x, 0), this._width - tooltipBounds.width) + 'px';
    }

    connectedCallback() {
        this._styleSheet = this._styleNode.sheet;
        this._styleSheet.insertRule(
            `:host {
                font-family: Roboto, Arial, sans-serif;
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
        this._styleSheet.insertRule(
            `.tooltip {
                transition: top .5s, left .5s;
                position: absolute;
                padding: 12px;
                display: flex;
                flex-direction: column;
                box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 5px;
                border-radius: 15px;
                background-color: #FFFFFF;
                z-index: 1;
            }`, 0);
        this._styleSheet.insertRule(
            `.header-container {
               flex: 1,
               text-align: center;
               font-size: 18px;
               margin-bottom: 12px;
            }`, 0);
        this._styleSheet.insertRule(
            `.series-container {
               flex: 1,
               justify-content: start;
               display: flex;
               flex-direction: row;
            }`, 0);
        this._styleSheet.insertRule(
            `.series-value {
               flex: 1,
               font-size: 18px;
            }`, 0);
        this._styleSheet.insertRule(
            `.series-value:not(:first-of-type) {
               margin-left: 12px;
            }`, 0);
        this._styleSheet.insertRule(
            `.series-value .value {
               font-size: 22px;
               font-weight: bold;
            }`, 0);
        this._tooltipNode.style.display = 'none';
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
        this._theme.colors = Object.values(this._data.colors);
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
        this._hoverLayer.reAppend();
    }

    _startAnimation() {
        if (this._animationStopped) {
            this._animPrevTime = Date.now();
            window.requestAnimationFrame(this._bindedOnAnimationFrame);
        }
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
        this._startAnimation();
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
        this._hoverLayer.setSize(this._width, this._height);
        if (this._series && this._series.length) {
            this._series.forEach(series => {
                series.setSize(this._width, this._height)
            });
        }
        this.plotArea = {x: 0, y: 0, w: this._width, h: this._height};
    }
}

window.customElements.define('tg-chart', TgChart);