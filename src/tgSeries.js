class TgSeries extends TgLayerBase {
    constructor(parent, data, name) {
        super(parent);
        TgSeries.callCount++;
        this._data = data;
        this._name = name || 'TgSeries ' + TgSeries.callCount;
        this.enabled = true;
    }

    get data() {
        return this._data;
    }

    get name() {
        return this._name;
    }
}

TgSeries.callCount = 0;