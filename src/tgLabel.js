class TgLabel {
    constructor(context, text) {
        this._ctx = context;
        this._text = text;
        this.draw = true;
        this.x = 0;
        this.y = 0;
    }

    recalc() {
        this.width = this._ctx.measureText(this._text).width;
    }

    render() {
        this._ctx.textAlign = 'center';
        this._ctx.textBaseline = 'middle';
        this._ctx.fillText(this._text, this.x, this.y);
    }
}