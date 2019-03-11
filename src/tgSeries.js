class TgSeries extends TgLayerBase {
    constructor(parent, data, name) {
        super(parent);
        this._canvasNode.classList.add('series');
        TgSeries.callCount++;
        this._data = data;
        this.name = name || 'TgSeries ' + TgSeries.callCount;
        this.enabled = true;
    }

    get data() {
        return this._data;
    }
}

TgSeries.callCount = 0;