class TgSeries {
    constructor(parent, data, name) {
        TgSeries.callCount++;
        this._chart = parent;
        this._data = data;
        this._name = name || 'TgSeries ' + TgSeries.callCount;

        this._canvasNode = document.createElement('canvas');
        this._canvasNode.classList.add('series');
        this._canvasNode.classList.add('layer');
        parent.shadowRoot.appendChild(this._canvasNode);
        this._ctx = this._canvasNode.getContext('2d');
    }

    get data() {
        return this._data;
    }

    get name() {
        return this._name;
    }
}

TgSeries.callCount = 0;